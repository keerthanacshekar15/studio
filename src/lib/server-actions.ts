
'use server';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, limit, serverTimestamp, orderBy, writeBatch, FieldValue, Timestamp, setDoc } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import type { User, Post, Notification, CreateUserDTO, Reply, Message, Chat } from './types';
import { FirestorePermissionError } from '@/firebase/errors';


function initializeFirebase() {
  if (getApps().length > 0) {
    const app = getApp();
    return {
        firestore: getFirestore(app)
    };
  }

  const app = initializeApp(firebaseConfig);
  const firestore = getFirestore(app);
  
  return {
    firestore,
  };
}


const { firestore } = initializeFirebase();

// --- User Functions ---

export const getUsers = async (): Promise<User[]> => {
    const usersSnapshot = await getDocs(query(collection(firestore, 'users'), where('verificationStatus', '==', 'pending')));
    if (usersSnapshot.empty) {
        return [];
    }
    return usersSnapshot.docs.map(doc => doc.data() as User);
};

export const getUserById = async (userId: string): Promise<User | undefined> => {
    const userDocRef = doc(firestore, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
        return undefined;
    }
    const user = userDoc.data() as User;
    // Convert Timestamps to numbers
    return {
        ...user,
        createdAt: (user.createdAt as unknown as Timestamp)?.toMillis() || Date.now(),
    };
};

export const getUserByCredentials = async (
  fullName: string,
  usn: string
): Promise<User | undefined> => {
    const userQuery = await getDocs(query(collection(firestore, 'users'),
        where('usn', '==', usn),
        limit(1)
    ));

    if (userQuery.empty) {
        return undefined;
    }
    
    const user = userQuery.docs[0].data() as User;

    // Case-insensitive comparison for full name
    if (user.fullName.toLowerCase() !== fullName.toLowerCase()) {
        return undefined;
    }

    return {
        ...user,
        createdAt: (user.createdAt as unknown as Timestamp)?.toMillis() || Date.now(),
    };
};

export const createUser = async (
  userData: CreateUserDTO
): Promise<{ user: User; isExisting: boolean }> => {
    const usersRef = collection(firestore, 'users');
    const existingUserQuery = await getDocs(query(usersRef, where('usn', '==', userData.usn), limit(1)));

    if (!existingUserQuery.empty) {
        const existingUser = existingUserQuery.docs[0].data() as User;
        const createdAt = (existingUser.createdAt as unknown as Timestamp)?.toMillis() || Date.now();
        return { 
            user: { ...existingUser, createdAt }, 
            isExisting: true 
        };
    }
    
    const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newUserDocRef = doc(usersRef, userId);
    
    const newUser: User = {
        ...userData,
        userId: userId,
        verificationStatus: 'pending',
        createdAt: serverTimestamp() as any, // Firestore will convert this
    };
    
    try {
        await setDoc(newUserDocRef, newUser);
    } catch (error: any) {
        if (error.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: newUserDocRef.path,
                operation: 'create',
                requestResourceData: newUser,
            });
            // Re-throw the rich error so the client action can catch it.
            throw permissionError;
        }
        // Throw other errors as-is
        throw error;
    }
    
    const createdUser = await getUserById(userId);
    if(!createdUser) throw new Error("Failed to fetch newly created user.");

    return { user: createdUser, isExisting: false };
};


export const updateUserStatus = async (
  userId: string,
  status: 'approved' | 'rejected'
): Promise<User | undefined> => {
    const userRef = doc(firestore, 'users', userId);
    await updateDoc(userRef, { verificationStatus: status });

    const updatedUser = await getUserById(userId);

    // Create a notification for the user about their status change
    if (updatedUser) {
        const notificationRef = collection(firestore, 'users', userId, 'notifications');
        const existingNotifs = await getDocs(query(notificationRef, where('type', 'in', ['approval', 'rejection']), limit(1)));

        if (existingNotifs.empty) {
            const notificationId = `notif-${status}-${Date.now()}`;
            const newNotifRef = doc(notificationRef, notificationId);
            
            const notificationContent = status === 'approved'
                ? 'Congratulations! Your account has been approved by an administrator.'
                : 'We are sorry, your account verification has been rejected.';
            
            const notificationLink = status === 'approved' ? '/app/feed' : '/';

            await setDoc(newNotifRef, {
                notificationId,
                userId: userId,
                type: status === 'approved' ? 'approval' : 'rejection',
                content: notificationContent,
                link: notificationLink,
                createdAt: serverTimestamp(),
                readStatus: false,
            });
        }
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
    const postsSnapshot = await getDocs(query(collection(firestore, 'posts'), orderBy('createdAt', 'desc')));
    return postsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            postId: doc.id,
            date: (data.date as unknown as Timestamp).toMillis(),
            createdAt: (data.createdAt as unknown as Timestamp).toMillis(),
            expiresAt: (data.expiresAt as unknown as Timestamp).toMillis(),
        } as Post;
    });
};

export const getPostWithReplies = async (postId: string): Promise<{ post: Post; replies: Reply[] } | null> => {
    const postDocRef = doc(firestore, 'posts', postId);
    const postDoc = await getDoc(postDocRef);
    if (!postDoc.exists()) return null;

    const repliesSnapshot = await getDocs(query(collection(postDocRef, 'replies'), orderBy('createdAt', 'asc')));

    const postData = postDoc.data()!;
    const post = {
        ...postData,
        postId: postDoc.id,
        date: (postData.date as unknown as Timestamp).toMillis(),
        createdAt: (postData.createdAt as unknown as Timestamp).toMillis(),
        expiresAt: (postData.expiresAt as unknown as Timestamp).toMillis(),
    } as Post;

    const replies = repliesSnapshot.docs.map(doc => {
        const replyData = doc.data();
        return {
            ...replyData,
            replyId: doc.id,
            createdAt: (replyData.createdAt as unknown as Timestamp).toMillis(),
        } as Reply;
    });

    return { post, replies };
}

export const createPost = async (
  postData: Omit<Post, 'postId' | 'status' | 'replyCount' | 'expiresAt' | 'createdAt'>
): Promise<Post> => {
    const postCollection = collection(firestore, 'posts');
    const newPostRef = doc(postCollection);
    const newPostData = {
        ...postData,
        date: new Date(postData.date),
        status: 'open',
        replyCount: 0,
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromMillis(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };
    await setDoc(newPostRef, newPostData);
    
    const createdDoc = await getDoc(newPostRef);
    const createdData = createdDoc.data()!;
    
    return {
        ...createdData,
        postId: createdDoc.id,
        date: (createdData.date as unknown as Timestamp).toMillis(),
        createdAt: (createdData.createdAt as unknown as Timestamp).toMillis(),
        expiresAt: (createdData.expiresAt as unknown as Timestamp).toMillis(),
    } as Post;
};

export const deletePost = async(postId: string): Promise<void> => {
    const postRef = doc(firestore, 'posts', postId);
    
    const repliesSnapshot = await getDocs(collection(postRef, 'replies'));
    const batch = writeBatch(firestore);
    repliesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    await deleteDoc(postRef);
}

// --- Reply Functions ---

export const addReplyToServer = async (postId: string, message: string, user: User, parentReplyId?: string | null): Promise<Reply> => {
    const postRef = doc(firestore, 'posts', postId);
    const replyCollection = collection(postRef, 'replies');
    
    const newReplyRef = doc(replyCollection);
    const newReplyData: Omit<Reply, 'replyId' | 'createdAt'> = {
        postId,
        message,
        repliedBy: user.userId,
        repliedByName: user.fullName,
        ...(parentReplyId && { parentReplyId }),
    };

    await setDoc(newReplyRef, {
      ...newReplyData,
      createdAt: serverTimestamp()
    });
    
    await updateDoc(postRef, { replyCount: FieldValue.increment(1) });
    
    const postDoc = await getDoc(postRef);
    const postData = postDoc.data();

    // Notify post owner of the new reply
    if (postData && postData.postedBy !== user.userId) {
        const notificationRef = collection(firestore, 'users', postData.postedBy, 'notifications');
        const notificationId = `notif-reply-${Date.now()}`;
        const newNotifRef = doc(notificationRef, notificationId);
        await setDoc(newNotifRef, {
            notificationId,
            userId: postData.postedBy,
            type: 'reply',
            content: `${user.fullName} replied to your post: "${postData.title}"`,
            link: `/app/post/${postId}`,
            createdAt: serverTimestamp(),
            readStatus: false,
        });
    }

    const createdDoc = await getDoc(newReplyRef);
    const createdData = createdDoc.data()!;
    return {
        ...createdData,
        replyId: createdDoc.id,
        createdAt: (createdData.createdAt as unknown as Timestamp).toMillis(),
    } as Reply;
};


// --- Notification Functions ---

export const getNotifications = async (userId: string): Promise<Notification[]> => {
    const notificationsSnapshot = await getDocs(query(collection(firestore, 'users', userId, 'notifications'), orderBy('createdAt', 'desc')));
    if (notificationsSnapshot.empty) {
        return [];
    }
    return notificationsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            notificationId: doc.id,
            createdAt: (data.createdAt as unknown as Timestamp).toMillis(),
        } as Notification;
    });
};

// --- Chat Functions ---
export const getChat = async (postId: string, currentUser: User): Promise<{ chat: Chat; post: Post } | null> => {
    const postDoc = await getDoc(doc(firestore, 'posts', postId));
    const postData = postDoc.data();

    if (!postData) return null;
    const post = {
      ...postData,
      postId: postDoc.id,
      date: (postData.date as Timestamp).toMillis(),
      createdAt: (postData.createdAt as Timestamp).toMillis(),
      expiresAt: (postData.expiresAt as Timestamp).toMillis(),
    } as Post;


    const postOwner = await getUserById(post.postedBy);
    if (!postOwner) return null;

    const chatId = [currentUser.userId, postOwner.userId].sort().join('-');
    const chatRef = doc(firestore, 'chats', chatId);
    let chatDocSnap = await getDoc(chatRef);

    let chatData: Chat;

    if (!chatDocSnap.exists()) {
        const newChat = {
            chatId: chatId,
            postId: postId,
            userAId: postOwner.userId,
            userAName: postOwner.fullName,
            userBId: currentUser.userId,
            userBName: currentUser.fullName,
            messages: [],
        };
        await setDoc(chatRef, { ...newChat, messages: undefined }); // Don't store messages array in chat doc
        chatData = newChat;
    } else {
        chatData = chatDocSnap.data() as Chat;
        chatData.messages = [];
    }

    const messagesSnapshot = await getDocs(query(collection(chatRef, 'messages'), orderBy('timestamp', 'asc')));
    chatData.messages = messagesSnapshot.docs.map(doc => {
        const msgData = doc.data();
        return {
            ...msgData,
            messageId: doc.id,
            timestamp: (msgData.timestamp as unknown as Timestamp).toMillis(),
        } as Message;
    });

    return { chat: chatData, post };
}

export const addMessage = async(chatId: string, text: string, sender: User): Promise<Message> => {
    const chatRef = doc(firestore, 'chats', chatId);
    const messageCollection = collection(chatRef, 'messages');
    const newMessageRef = doc(messageCollection);
    const messageData = {
        text,
        senderId: sender.userId,
        senderName: sender.fullName,
        timestamp: serverTimestamp()
    };
    await setDoc(newMessageRef, messageData);

    const createdDoc = await getDoc(newMessageRef);
    const createdData = createdDoc.data()!;

    return {
        ...createdData,
        messageId: createdDoc.id,
        chatId: chatId,
        timestamp: (createdData.timestamp as unknown as Timestamp).toMillis(),
    } as Message;
}

export const getIdVerifications = async (): Promise<User[]> => {
    const snapshot = await getDocs(query(collection(firestore, 'users'), where('verificationStatus', '==', 'pending')));
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            createdAt: (data.createdAt as unknown as Timestamp).toMillis(),
        } as User
    });
}
