
'use server';

import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  Timestamp,
  orderBy,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/server-init';
import type { User, Post, Notification, CreateUserDTO, Reply, Message, Chat } from './types';

// Initialize Firebase Admin SDK
const { firestore } = initializeFirebase();

// --- User Functions ---

export const getUsers = async (): Promise<User[]> => {
  const usersCol = collection(firestore, 'users');
  const userSnapshot = await getDocs(usersCol);
  const userList = userSnapshot.docs.map(doc => ({ userId: doc.id, ...doc.data() } as User));
  return userList;
};

export const getUserById = async (userId: string): Promise<User | undefined> => {
  const userRef = doc(firestore, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return { userId: userSnap.id, ...userSnap.data() } as User;
  }
  return undefined;
};

export const getUserByCredentials = async (
  fullName: string,
  usn: string
): Promise<User | undefined> => {
  const usersRef = collection(firestore, 'users');
  const q = query(
    usersRef,
    where('fullName', '==', fullName),
    where('usn', '==', usn)
  );
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const userDoc = querySnapshot.docs[0];
    return { userId: userDoc.id, ...userDoc.data() } as User;
  }
  return undefined;
};

export const createUser = async (
  userData: CreateUserDTO
): Promise<{ user: User; isExisting: boolean }> => {
  const usersRef = collection(firestore, 'users');
  const q = query(usersRef, where('usn', '==', userData.usn));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const existingUserDoc = querySnapshot.docs[0];
    return { user: { userId: existingUserDoc.id, ...existingUserDoc.data() } as User, isExisting: true };
  }

  const newUserRef = doc(collection(firestore, 'users'));
  const newUser: Omit<User, 'userId'> = {
    ...userData,
    verificationStatus: 'pending',
    createdAt: Date.now(),
  };

  await setDoc(newUserRef, newUser);

  // Also create the ID verification document
  const idVerificationRef = doc(collection(firestore, 'idVerifications'));
  await setDoc(idVerificationRef, {
      userId: newUserRef.id,
      idCardImageURL: userData.idCardImageURL,
      verificationStatus: 'pending',
      fullName: userData.fullName,
      usn: userData.usn
  });


  return { user: { ...newUser, userId: newUserRef.id }, isExisting: false };
};


export const updateUserStatus = async (
  userId: string,
  status: 'approved' | 'rejected'
): Promise<User | undefined> => {
    const userRef = doc(firestore, 'users', userId);
    await updateDoc(userRef, { verificationStatus: status });

    const updatedUser = await getUserById(userId);

    // Find and update the corresponding idVerifications document
    const verificationsRef = collection(firestore, 'idVerifications');
    const q = query(verificationsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    if(!querySnapshot.empty) {
        const verificationDoc = querySnapshot.docs[0];
        await updateDoc(verificationDoc.ref, { verificationStatus: status });
    }

    // Add notification
    const notificationsRef = collection(firestore, `users/${userId}/notifications`);
    if (status === 'approved') {
        await addDoc(notificationsRef, {
            userId,
            type: 'approval',
            content: 'Congratulations! Your account has been approved by an administrator.',
            link: '/app/feed',
            createdAt: Timestamp.now(),
            readStatus: false,
        });
    } else if (status === 'rejected') {
        await addDoc(notificationsRef, {
            userId,
            type: 'rejection',
            content: 'We are sorry, your account verification has been rejected.',
            link: '/',
            createdAt: Timestamp.now(),
            readStatus: false,
        });
    }

    return updatedUser;
};


export const updateUser = async (userId: string, fullName: string, usn: string): Promise<User | undefined> => {
    const userRef = doc(firestore, 'users', userId);
    await updateDoc(userRef, { fullName, usn });
    return getUserById(userId);
}


// --- Post Functions ---

export const getPosts = async (): Promise<Post[]> => {
    const postsCol = collection(firestore, 'posts');
    const q = query(postsCol, orderBy('createdAt', 'desc'));
    const postSnapshot = await getDocs(q);
    return postSnapshot.docs.map(doc => ({ postId: doc.id, ...doc.data() } as Post));
};

export const getPostWithReplies = async (postId: string): Promise<{ post: Post; replies: Reply[] } | null> => {
    const postRef = doc(firestore, 'posts', postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) return null;

    const post = { postId: postSnap.id, ...postSnap.data() } as Post;

    const repliesCol = collection(firestore, `posts/${postId}/replies`);
    const q = query(repliesCol, orderBy('createdAt', 'asc'));
    const repliesSnapshot = await getDocs(q);
    const replies = repliesSnapshot.docs.map(doc => ({ replyId: doc.id, ...doc.data() } as Reply));

    return { post, replies };
}

export const createPost = async (
  postData: Omit<Post, 'postId' | 'status' | 'replyCount' | 'expiresAt' | 'createdAt'>
): Promise<Post> => {
    const newPostRef = doc(collection(firestore, 'posts'));
    const newPost: Omit<Post, 'postId'> = {
        ...postData,
        status: 'open',
        replyCount: 0,
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
        createdAt: Date.now(),
    };
    await setDoc(newPostRef, newPost);
    return { ...newPost, postId: newPostRef.id };
};


export const deletePost = async (postId: string): Promise<void> => {
    const batch = writeBatch(firestore);

    // Delete the post
    const postRef = doc(firestore, 'posts', postId);
    batch.delete(postRef);

    // Delete all replies in the subcollection
    const repliesRef = collection(firestore, `posts/${postId}/replies`);
    const repliesSnapshot = await getDocs(repliesRef);
    repliesSnapshot.forEach(replyDoc => batch.delete(replyDoc.ref));
    
    await batch.commit();
};


// --- Reply Functions ---

export const addReplyToServer = async (postId: string, message: string, user: User, parentReplyId?: string | null): Promise<Reply> => {
    const postRef = doc(firestore, 'posts', postId);
    const repliesCol = collection(firestore, `posts/${postId}/replies`);
    
    const newReplyRef = doc(repliesCol);
    const newReplyData: Omit<Reply, 'replyId'> = {
        postId,
        message,
        repliedBy: user.userId,
        repliedByName: user.fullName,
        createdAt: Date.now(),
        parentReplyId: parentReplyId || undefined,
    };
    await setDoc(newReplyRef, newReplyData);
    
    const postSnap = await getDoc(postRef);
    if(postSnap.exists()){
        const postData = postSnap.data() as Post;
        const newReplyCount = (postData.replyCount || 0) + 1;
        await updateDoc(postRef, { replyCount: newReplyCount });

        // Send notification if not replying to own post
        if (postData.postedBy !== user.userId) {
            const notificationsRef = collection(firestore, `users/${postData.postedBy}/notifications`);
            await addDoc(notificationsRef, {
                userId: postData.postedBy,
                type: 'reply',
                content: `${user.fullName} replied to your post: "${postData.title}"`,
                link: `/app/post/${postId}`,
                createdAt: Timestamp.now(),
                readStatus: false,
            });
        }
    }

    return { ...newReplyData, replyId: newReplyRef.id };
};


// --- Notification Functions ---

export const getNotifications = async (userId: string): Promise<Notification[]> => {
    const notificationsCol = collection(firestore, `users/${userId}/notifications`);
    const q = query(notificationsCol, orderBy('createdAt', 'desc'));
    const notificationSnapshot = await getDocs(q);
    return notificationSnapshot.docs.map(doc => ({ notificationId: doc.id, ...doc.data() } as Notification));
};

// --- Chat functions ---

export const getChat = async (postId: string, currentUser: User): Promise<{ chat: Chat; post: Post } | null> => {
    const post = (await getDoc(doc(firestore, 'posts', postId))).data() as Post;
    if (!post) return null;

    const postOwner = await getUserById(post.postedBy);
    if (!postOwner) return null;

    const chatsRef = collection(firestore, 'chats');
    const q = query(
      chatsRef,
      where('postId', '==', postId),
      where('userAId', 'in', [currentUser.userId, postOwner.userId]),
      where('userBId', 'in', [currentUser.userId, postOwner.userId])
    );
    
    const chatSnapshot = await getDocs(q);
    let chatId, chat;
    
    if (chatSnapshot.empty) {
        // Create new chat
        const newChatRef = doc(collection(firestore, 'chats'));
        chat = {
            chatId: newChatRef.id,
            postId: postId,
            userAId: postOwner.userId,
            userAName: postOwner.fullName,
            userBId: currentUser.userId,
            userBName: currentUser.fullName,
        };
        await setDoc(newChatRef, chat);
        chatId = newChatRef.id;
    } else {
        const chatDoc = chatSnapshot.docs[0];
        chatId = chatDoc.id;
        chat = chatDoc.data();
    }

    // get messages
    const messagesRef = collection(firestore, `chats/${chatId}/messages`);
    const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));
    const messagesSnapshot = await getDocs(messagesQuery);
    const messages = messagesSnapshot.docs.map(d => ({messageId: d.id, ...d.data()}) as Message)

    return { chat: { ...chat, chatId, messages } as Chat, post };
}

export const addMessage = async(chatId: string, text: string, sender: User): Promise<Message> => {
    const messagesRef = collection(firestore, `chats/${chatId}/messages`);
    const messageData: Omit<Message, 'messageId'> = {
        chatId,
        text,
        senderId: sender.userId,
        senderName: sender.fullName,
        timestamp: Date.now()
    }
    const newDocRef = await addDoc(messagesRef, messageData);
    return { ...messageData, messageId: newDocRef.id };
}

// Add this import to the top of the file
import { setDoc } from 'firebase/firestore';

// Also add a function to get ID verification requests for the admin page
export const getIdVerifications = async () => {
    const verificationsCol = collection(firestore, 'idVerifications');
    const q = query(verificationsCol, where('verificationStatus', '==', 'pending'));
    const snapshot = await getDocs(q);
    
    const verifications = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            userId: data.userId,
            fullName: data.fullName,
            usn: data.usn,
            idCardImageURL: data.idCardImageURL,
            verificationStatus: data.verificationStatus,
            createdAt: data.createdAt,
        } as User;
    });

    return verifications;
}
