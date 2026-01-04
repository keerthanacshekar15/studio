
'use server';

import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  orderBy,
  limit,
} from 'firebase/firestore';
import { firestore } from '@/firebase/server-init';
import type { User, Post, Notification } from './types';

const USERS_COLLECTION = 'users';
const POSTS_COLLECTION = 'posts';
const NOTIFICATIONS_COLLECTION = 'notifications';

export const getUsers = async (): Promise<User[]> => {
  const usersRef = collection(firestore, USERS_COLLECTION);
  const q = query(usersRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ ...doc.data(), userId: doc.id } as User));
};

export const getUserById = async (
  userId: string
): Promise<User | undefined> => {
  const userRef = doc(firestore, USERS_COLLECTION, userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return { ...userSnap.data(), userId: userSnap.id } as User;
  }
  return undefined;
};

export const getUserByCredentials = async (
  fullName: string,
  usn: string
): Promise<User | undefined> => {
  const usersRef = collection(firestore, USERS_COLLECTION);
  const q = query(
    usersRef,
    where('fullName', '==', fullName),
    where('usn', '==', usn),
    limit(1)
  );
  const querySnapshot = await getDocs(q);
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
  const usersRef = collection(firestore, USERS_COLLECTION);
  const q = query(usersRef, where('usn', '==', userData.usn), limit(1));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const existingUserDoc = querySnapshot.docs[0];
    return {
      user: { ...existingUserDoc.data(), userId: existingUserDoc.id } as User,
      isExisting: true,
    };
  }

  const usersCollection = collection(firestore, USERS_COLLECTION);
  const newUserRef = doc(usersCollection); // Correctly get a new doc ref with an auto-id

  const newUser: User = {
    ...userData,
    userId: newUserRef.id,
    createdAt: Date.now(),
    verificationStatus: 'pending',
  };

  await setDoc(newUserRef, newUser);

  return { user: newUser, isExisting: false };
};

export const updateUserStatus = async (
  userId: string,
  status: 'approved' | 'rejected'
): Promise<User | undefined> => {
  const userRef = doc(firestore, USERS_COLLECTION, userId);
  await updateDoc(userRef, { verificationStatus: status });
  // After updating, send a notification
  const notificationRef = collection(firestore, USERS_COLLECTION, userId, NOTIFICATIONS_COLLECTION);
  await addDoc(notificationRef, {
      type: status === 'approved' ? 'approval' : 'rejection',
      content: `Your account has been ${status}.`,
      createdAt: Date.now(),
      readStatus: false,
      link: status === 'approved' ? '/app/feed' : '/'
  });

  return getUserById(userId);
};

export const getPosts = async (): Promise<Post[]> => {
  const postsRef = collection(firestore, POSTS_COLLECTION);
  const q = query(
    postsRef,
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    doc => ({ ...doc.data(), postId: doc.id } as Post)
  ).filter(post => post.expiresAt > Date.now());
};

export const createPost = async (
  postData: Omit<
    Post,
    'postId' | 'status' | 'replyCount' | 'expiresAt' | 'createdAt'
  >
) => {
  const newPost: Omit<Post, 'postId'> = {
    ...postData,
    status: 'open',
    replyCount: 0,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
  };
  await addDoc(collection(firestore, POSTS_COLLECTION), newPost);
};

export const getNotifications = async (
  userId: string
): Promise<Notification[]> => {
  const notificationsRef = collection(
    firestore,
    USERS_COLLECTION,
    userId,
    NOTIFICATIONS_COLLECTION
  );
  const q = query(notificationsRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    doc => ({ ...doc.data(), notificationId: doc.id } as Notification)
  );
};
