
'use server';

import { initializeFirebase as initializeAdmin } from '@/firebase/server-init';
import type { User, Post, Notification, CreateUserDTO, Reply, Message, Chat } from './types';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

const { firestore } = initializeAdmin();

// --- User Functions ---

export const getUsers = async (): Promise<User[]> => {
    const usersSnapshot = await firestore.collection('users').where('verificationStatus', '==', 'pending').get();
    if (usersSnapshot.empty) {
        return [];
    }
    return usersSnapshot.docs.map(doc => doc.data() as User);
};

export const getUserById = async (userId: string): Promise<User | undefined> => {
    const userDoc = await firestore.collection('users').doc(userId).get();
    if (!userDoc.exists) {
        return undefined;
    }
    const user = userDoc.data() as User;
    // Convert Timestamps to numbers
    return {
        ...user,
        createdAt: (user.createdAt as unknown as Timestamp).toMillis(),
    };
};

export const getUserByCredentials = async (
  fullName: string,
  usn: string
): Promise<User | undefined> => {
    const userQuery = await firestore.collection('users')
        .where('usn', '==', usn)
        .limit(1)
        .get();

    if (userQuery.empty) {
        return undefined;
    }
    
    const user = userQuery.docs[0].data() as User;

    if (user.fullName.toLowerCase() !== fullName.toLowerCase()) {
        return undefined;
    }

    return {
        ...user,
        createdAt: (user.createdAt as unknown as Timestamp).toMillis(),
    };
};

export const createUser = async (
  userData: CreateUserDTO
): Promise<{ user: User; isExisting: boolean }> => {
    const usersRef = firestore.collection('users');
    const existingUserQuery = await usersRef.where('usn', '==', userData.usn).limit(1).get();

    if (!existingUserQuery.empty) {
        const existingUser = existingUserQuery.docs[0].data() as User;
        return { 
            user: {
                ...existingUser,
                createdAt: (existingUser.createdAt as unknown as Timestamp).toMillis()
            }, 
            isExisting: true 
        };
    }
    
    const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newUser: User = {
        ...userData,
        userId: userId,
        verificationStatus: 'pending',
        createdAt: FieldValue.serverTimestamp() as any,
    };
    
    await usersRef.doc(userId).set(newUser);
    
    const createdUser = await getUserById(userId);
    if(!createdUser) throw new Error("Failed to create user.");

    return { user: createdUser, isExisting: false };
};


export const updateUserStatus = async (
  userId: string,
  status: 'approved' | 'rejected'
): Promise<User | undefined> => {
    const userRef = firestore.collection('users').doc(userId);
    await userRef.update({ verificationStatus: status });

    const updatedUser = await getUserById(userId);

    if (updatedUser) {
        const notificationRef = firestore.collection('users').doc(userId).collection('notifications');
        const existingNotifs = await notificationRef.where('type', 'in', ['approval', 'rejection']).limit(1).get();

        if (existingNotifs.empty) {
            const notificationId = `notif-${status}-${Date.now()}`;
            if (status === 'approved') {
                await notificationRef.doc(notificationId).set({
                    notificationId,
                    userId: userId,
                    type: 'approval',
                    content: 'Congratulations! Your account has been approved by an administrator.',
                    link: '/app/feed',
                    createdAt: FieldValue.serverTimestamp(),
                    readStatus: false,
                });
            } else if (status === 'rejected') {
                 await notificationRef.doc(notificationId).set({
                    notificationId,
                    userId: userId,
                    type: 'rejection',
                    content: 'We are sorry, your account verification has been rejected.',
                    link: '/',
                    createdAt: FieldValue.serverTimestamp(),
                    readStatus: false,
                });
            }
        }
    }

    return updatedUser;
};

export const updateUser = async (userId: string, fullName: string, usn: string): Promise<User | undefined> => {
    const userRef = firestore.collection('users').doc(userId);
    await userRef.update({ fullName, usn });
    return getUserById(userId);
}


// --- Post Functions ---

export const getPosts = async (): Promise<Post[]> => {
    const postsSnapshot = await firestore.collection('posts').orderBy('createdAt', 'desc').get();
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
    const postDoc = await firestore.collection('posts').doc(postId).get();
    if (!postDoc.exists) return null;

    const repliesSnapshot = await firestore.collection('posts').doc(postId).collection('replies').orderBy('createdAt', 'asc').get();

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
    const postCollection = firestore.collection('posts');
    const newPostRef = postCollection.doc();
    const newPostData = {
        ...postData,
        date: new Date(postData.date),
        status: 'open',
        replyCount: 0,
        createdAt: FieldValue.serverTimestamp(),
        expiresAt: Timestamp.fromMillis(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };
    await newPostRef.set(newPostData);
    
    const createdDoc = await newPostRef.get();
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
    const postRef = firestore.collection('posts').doc(postId);
    
    // In a real app, you might want to use a batched write or a Cloud Function
    // to delete subcollections for larger datasets.
    const repliesSnapshot = await postRef.collection('replies').get();
    const batch = firestore.batch();
    repliesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    await postRef.delete();
}

// --- Reply Functions ---

export const addReplyToServer = async (postId: string, message: string, user: User, parentReplyId?: string | null): Promise<Reply> => {
    const postRef = firestore.collection('posts').doc(postId);
    const replyCollection = postRef.collection('replies');
    
    const newReplyRef = replyCollection.doc();
    const newReply: Omit<Reply, 'replyId'> = {
        postId,
        message,
        repliedBy: user.userId,
        repliedByName: user.fullName,
        createdAt: FieldValue.serverTimestamp() as any,
        ...(parentReplyId && { parentReplyId }),
    };
    await newReplyRef.set(newReply);
    
    // Increment reply count on the post
    await postRef.update({ replyCount: FieldValue.increment(1) });
    
    const postDoc = await postRef.get();
    const postData = postDoc.data();

    // Send notification if someone else's post is replied to
    if (postData && postData.postedBy !== user.userId) {
        const notificationRef = firestore.collection('users').doc(postData.postedBy).collection('notifications');
        const notificationId = `notif-reply-${Date.now()}`;
        await notificationRef.doc(notificationId).set({
            notificationId,
            userId: postData.postedBy,
            type: 'reply',
            content: `${user.fullName} replied to your post: "${postData.title}"`,
            link: `/app/post/${postId}`,
            createdAt: FieldValue.serverTimestamp(),
            readStatus: false,
        });
    }

    const createdDoc = await newReplyRef.get();
    const createdData = createdDoc.data()!;
    return {
        ...createdData,
        replyId: createdDoc.id,
        createdAt: (createdData.createdAt as unknown as Timestamp).toMillis(),
    } as Reply;
};


// --- Notification Functions ---

export const getNotifications = async (userId: string): Promise<Notification[]> => {
    const notificationsSnapshot = await firestore.collection('users').doc(userId).collection('notifications')
        .orderBy('createdAt', 'desc').get();
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
    const post = (await firestore.collection('posts').doc(postId).get()).data() as Post;
    if (!post) return null;

    const postOwner = await getUserById(post.postedBy);
    if (!postOwner) return null;

    const chatId = [currentUser.userId, postOwner.userId].sort().join('-');
    const chatRef = firestore.collection('chats').doc(chatId);
    let chatDoc = await chatRef.get();

    let chatData: Chat;

    if (!chatDoc.exists) {
        const newChat = {
            chatId: chatId,
            postId: postId,
            userAId: postOwner.userId,
            userAName: postOwner.fullName,
            userBId: currentUser.userId,
            userBName: currentUser.fullName,
        };
        await chatRef.set(newChat);
        chatData = { ...newChat, messages: [] };
    } else {
        chatData = chatDoc.data() as Chat;
    }

    const messagesSnapshot = await chatRef.collection('messages').orderBy('timestamp', 'asc').get();
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
    const chatRef = firestore.collection('chats').doc(chatId);
    const messageCollection = chatRef.collection('messages');
    const newMessageRef = messageCollection.doc();
    const messageData = {
        text,
        senderId: sender.userId,
        senderName: sender.fullName,
        timestamp: FieldValue.serverTimestamp()
    };
    await newMessageRef.set(messageData);

    const createdDoc = await newMessageRef.get();
    const createdData = createdDoc.data()!;

    return {
        ...createdData,
        messageId: createdDoc.id,
        chatId: chatId,
        timestamp: (createdData.timestamp as unknown as Timestamp).toMillis(),
    } as Message;
}

export const getIdVerifications = async (): Promise<User[]> => {
    const snapshot = await firestore.collection('users').where('verificationStatus', '==', 'pending').get();
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            createdAt: (data.createdAt as unknown as Timestamp).toMillis(),
        } as User
    });
}
