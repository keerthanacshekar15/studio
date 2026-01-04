
'use server';

import { getFirestore } from 'firebase-admin/firestore';
import { firestore as adminFirestore } from '@/firebase/server-init';
import type { User, Post, Notification } from './types';

const USERS_COLLECTION = 'users';
const POSTS_COLLECTION = 'posts';
const NOTIFICATIONS_COLLECTION = 'notifications';

export const getUsers = async (): Promise<User[]> => {
  const usersRef = adminFirestore.collection(USERS_COLLECTION);
  const q = usersRef.orderBy('createdAt', 'desc');
  const querySnapshot = await q.get();
  return querySnapshot.docs.map(doc => ({ ...doc.data(), userId: doc.id } as User));
};

export const getUserById = async (
  userId: string
): Promise<User | undefined> => {
  const userRef = adminFirestore.doc(`${USERS_COLLECTION}/${userId}`);
  const userSnap = await userRef.get();
  if (userSnap.exists) {
    return { ...userSnap.data(), userId: userSnap.id } as User;
  }
  return undefined;
};

export const getUserByCredentials = async (
  fullName: string,
  usn: string
): Promise<User | undefined> => {
  const usersRef = adminFirestore.collection(USERS_COLLECTION);
  const q = usersRef
    .where('fullName', '==', fullName)
    .where('usn', '==', usn)
    .limit(1);
  const querySnapshot = await q.get();
  if (!querySnapshot.empty) {
    const userDoc = querySnapshot.docs[0];
    return { ...userDoc.data(), userId: userDoc.id } as User;
  }
  return undefined;
};

export type CreateUserDTO = Omit<
  User,
  'userId' | 'createdAt' | 'verificationStatus'
>;

export const createUser = async (
  userData: CreateUserDTO
): Promise<{ user: User; isExisting: boolean }> => {
  const usersRef = adminFirestore.collection(USERS_COLLECTION);
  const q = usersRef.where('usn', '==', userData.usn).limit(1);
  const querySnapshot = await q.get();

  if (!querySnapshot.empty) {
    const existingUserDoc = querySnapshot.docs[0];
    return {
      user: { ...existingUserDoc.data(), userId: existingUserDoc.id } as User,
      isExisting: true,
    };
  }
  
  const newUserPayload = {
      ...userData,
      createdAt: Date.now(),
      verificationStatus: 'pending' as const,
  };

  try {
    const newUserRef = await usersRef.add(newUserPayload);

    const newUser: User = {
        ...newUserPayload,
        userId: newUserRef.id,
    };

    return { user: newUser, isExisting: false };
  } catch(error) {
    console.error("Error creating user in Firestore:", error);
    throw new Error("Could not create user document in the database.");
  }
};

export const updateUserStatus = async (
  userId: string,
  status: 'approved' | 'rejected'
): Promise<User | undefined> => {
  const userRef = adminFirestore.doc(`${USERS_COLLECTION}/${userId}`);
  await userRef.update({ verificationStatus: status });
  
  const notificationRef = adminFirestore.collection(`${USERS_COLLECTION}/${userId}/${NOTIFICATIONS_COLLECTION}`);
  await notificationRef.add({
      type: status === 'approved' ? 'approval' : 'rejection',
      content: `Your account has been ${status}.`,
      createdAt: Date.now(),
      readStatus: false,
      link: status === 'approved' ? '/app/feed' : '/'
  });

  return getUserById(userId);
};

export const getPosts = async (): Promise<Post[]> => {
  const postsRef = adminFirestore.collection(POSTS_COLLECTION);
  const q = postsRef.orderBy('createdAt', 'desc');
  const querySnapshot = await q.get();
  const posts = querySnapshot.docs.map(
    doc => ({ ...doc.data(), postId: doc.id } as Post)
  );
  return posts.filter(post => post.expiresAt > Date.now());
};

export const createPost = async (
  postData: Omit<
    Post,
    'postId' | 'status' | 'replyCount' | 'expiresAt' | 'createdAt'
  >
) => {
  const postsRef = adminFirestore.collection(POSTS_COLLECTION);
  const newPost: Omit<Post, 'postId'> = {
    ...postData,
    status: 'open',
    replyCount: 0,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
  };
  await postsRef.add(newPost);
};

export const getNotifications = async (
  userId: string
): Promise<Notification[]> => {
  const notificationsRef = adminFirestore.collection(`${USERS_COLLECTION}/${userId}/${NOTIFICATIONS_COLLECTION}`);
  const q = notificationsRef.orderBy('createdAt', 'desc');
  const querySnapshot = await q.get();
  return querySnapshot.docs.map(
    doc => ({ ...doc.data(), notificationId: doc.id } as Notification)
  );
};
