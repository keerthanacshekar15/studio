
'use server';

import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, FieldValue, type Firestore } from 'firebase-admin/firestore';
import type { User, Post, Notification } from './types';

// This is a SERVER-ONLY file.

let firestore: Firestore;

if (!getApps().length) {
  try {
    const serviceAccount = JSON.parse(
      process.env.GOOGLE_APPLICATION_CREDENTIALS as string
    );
    initializeApp({
      credential: cert(serviceAccount),
    });
    firestore = getFirestore();
  } catch (e) {
    console.error('Firebase Admin SDK initialization error in data.ts:', e);
    // Fallback for local dev without service account, if needed.
    // Ensure you have GOOGLE_APPLICATION_CREDENTIALS set in your env.
    if (!getApps().length) {
      initializeApp();
    }
    firestore = getFirestore();
  }
} else {
  // If already initialized, get the existing instance
  firestore = getFirestore();
}

const USERS_COLLECTION = 'users';
const POSTS_COLLECTION = 'posts';
const NOTIFICATIONS_COLLECTION = 'notifications';

export const getUsers = async (): Promise<User[]> => {
  const usersRef = firestore.collection(USERS_COLLECTION);
  const q = usersRef.orderBy('createdAt', 'desc');
  const querySnapshot = await q.get();
  return querySnapshot.docs.map(doc => ({ ...(doc.data() as Omit<User, 'userId'>), userId: doc.id }));
};

export const getUserById = async (
  userId: string
): Promise<User | undefined> => {
  const userRef = firestore.doc(`${USERS_COLLECTION}/${userId}`);
  const userSnap = await userRef.get();
  if (userSnap.exists) {
    return { ...(userSnap.data() as Omit<User, 'userId'>), userId: userSnap.id };
  }
  return undefined;
};

export const getUserByCredentials = async (
  fullName: string,
  usn: string
): Promise<User | undefined> => {
  const usersRef = firestore.collection(USERS_COLLECTION);
  const q = usersRef
    .where('fullName', '==', fullName)
    .where('usn', '==', usn)
    .limit(1);
  const querySnapshot = await q.get();
  if (!querySnapshot.empty) {
    const userDoc = querySnapshot.docs[0];
    return { ...(userDoc.data() as Omit<User, 'userId'>), userId: userDoc.id };
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
  const usersRef = firestore.collection(USERS_COLLECTION);
  const q = usersRef.where('usn', '==', userData.usn).limit(1);
  const querySnapshot = await q.get();

  if (!querySnapshot.empty) {
    const existingUserDoc = querySnapshot.docs[0];
    return {
      user: { ...(existingUserDoc.data() as Omit<User, 'userId'>), userId: existingUserDoc.id },
      isExisting: true,
    };
  }
  
  const newUserPayload = {
      ...userData,
      createdAt: FieldValue.serverTimestamp(),
      verificationStatus: 'pending' as const,
  };

  try {
    const newUserRef = await usersRef.add(newUserPayload);
    
    const newUserSnap = await newUserRef.get();
    const newUserData = newUserSnap.data();

    // The timestamp will be null until the server commits it, so we use a client-side date for the immediate return
    const newUser: User = { 
      ...(newUserData as Omit<User, 'userId' | 'createdAt'>), 
      userId: newUserRef.id, 
      createdAt: Date.now() 
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
  const userRef = firestore.doc(`${USERS_COLLECTION}/${userId}`);
  await userRef.update({ verificationStatus: status });
  
  const notificationRef = firestore.collection(`${USERS_COLLECTION}/${userId}/${NOTIFICATIONS_COLLECTION}`);
  await notificationRef.add({
      type: status === 'approved' ? 'approval' : 'rejection',
      content: `Your account has been ${status}.`,
      createdAt: FieldValue.serverTimestamp(),
      readStatus: false,
      userId: userId,
      link: status === 'approved' ? '/app/feed' : '/'
  });

  return getUserById(userId);
};

export const getPosts = async (): Promise<Post[]> => {
  const postsRef = firestore.collection(POSTS_COLlection);
  const q = postsRef.orderBy('createdAt', 'desc');
  const querySnapshot = await q.get();
  const now = Date.now();
  const posts = querySnapshot.docs.map(
    doc => ({ ...(doc.data() as Omit<Post, 'postId'>), postId: doc.id })
  );
  return posts.filter(post => post.expiresAt > now);
};

export const createPost = async (
  postData: Omit<
    Post,
    'postId' | 'status' | 'replyCount' | 'expiresAt' | 'createdAt'
  >
) => {
  const postsRef = firestore.collection(POSTS_COLLECTION);
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
  const notificationsRef = firestore.collection(`${USERS_COLLECTION}/${userId}/${NOTIFICATIONS_COLLECTION}`);
  const q = notificationsRef.orderBy('createdAt', 'desc');
  const querySnapshot = await q.get();
  return querySnapshot.docs.map(
    doc => ({ ...(doc.data() as Omit<Notification, 'notificationId'>), notificationId: doc.id })
  );
};
