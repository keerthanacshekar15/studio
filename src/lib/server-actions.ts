'use server';

import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore, Firestore, FieldValue } from 'firebase-admin/firestore';
import type { User, Post, Notification } from './types';

// Robust singleton pattern for Firebase Admin SDK
let app: App;
let firestore: Firestore;

if (!getApps().length) {
  try {
    // IMPORTANT: This relies on Application Default Credentials (ADC)
    // It will automatically find credentials in a deployed Google Cloud environment.
    // For local development, you MUST run `gcloud auth application-default login`
    app = initializeApp();
  } catch (e) {
    console.error('Firebase Admin Initialization Error:', e);
    throw new Error(
      'Failed to initialize Firebase Admin SDK. Check server logs for details.'
    );
  }
} else {
  app = getApps()[0];
}

firestore = getFirestore(app);

const USERS_COLLECTION = 'users';
const POSTS_COLLECTION = 'posts';
const NOTIFICATIONS_COLLECTION = 'notifications';

export const getUsers = async (): Promise<User[]> => {
  const usersRef = firestore.collection(USERS_COLLECTION);
  const q = usersRef.orderBy('createdAt', 'desc');
  const querySnapshot = await q.get();
  return querySnapshot.docs.map(doc => ({
    ...(doc.data() as Omit<User, 'userId'>),
    userId: doc.id,
  }));
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

export type CreateUserDTO = Pick<User, 'fullName' | 'usn' | 'idCardImageURL'>;

export const createUser = async (
  userData: CreateUserDTO
): Promise<{ user: User; isExisting: boolean }> => {
  const usersRef = firestore.collection(USERS_COLLECTION);
  const q = usersRef.where('usn', '==', userData.usn).limit(1);
  const querySnapshot = await q.get();

  if (!querySnapshot.empty) {
    const existingUserDoc = querySnapshot.docs[0];
    return {
      user: {
        ...(existingUserDoc.data() as Omit<User, 'userId'>),
        userId: existingUserDoc.id,
      },
      isExisting: true,
    };
  }

  const newUserPayload = {
    ...userData,
    createdAt: Date.now(), // Use a reliable server timestamp
    verificationStatus: 'pending' as const,
  };

  try {
    const newUserRef = await usersRef.add(newUserPayload);
    const newUser: User = {
      ...newUserPayload,
      userId: newUserRef.id,
    };
    return { user: newUser, isExisting: false };
  } catch (error) {
    console.error('Error creating user in Firestore:', error);
    throw new Error('Could not create user document in the database.');
  }
};

export const updateUserStatus = async (
  userId: string,
  status: 'approved' | 'rejected'
): Promise<User | undefined> => {
  const userRef = firestore.doc(`${USERS_COLLECTION}/${userId}`);
  await userRef.update({ verificationStatus: status });

  const notificationRef = firestore.collection(
    `${USERS_COLLECTION}/${userId}/${NOTIFICATIONS_COLLECTION}`
  );
  await notificationRef.add({
    type: status === 'approved' ? 'approval' : 'rejection',
    content: `Your account has been ${status}.`,
    createdAt: Date.now(),
    readStatus: false,
    userId: userId,
    link: status === 'approved' ? '/app/feed' : '/',
  });

  return getUserById(userId);
};

export const getPosts = async (): Promise<Post[]> => {
  const postsRef = firestore.collection(POSTS_COLLECTION);
  const q = postsRef.orderBy('createdAt', 'desc');
  const querySnapshot = await q.get();
  const now = Date.now();
  const posts = querySnapshot.docs.map(doc => ({
    ...(doc.data() as Omit<Post, 'postId'>),
    postId: doc.id,
  }));
  return posts.filter(post => post.expiresAt > now);
};

export const createPost = async (
  postData: Omit<Post, 'postId' | 'status' | 'replyCount' | 'expiresAt' | 'createdAt'>
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
  const notificationsRef = firestore.collection(
    `${USERS_COLLECTION}/${userId}/${NOTIFICATIONS_COLLECTION}`
  );
  const q = notificationsRef.orderBy('createdAt', 'desc');
  const querySnapshot = await q.get();
  return querySnapshot.docs.map(doc => ({
    ...(doc.data() as Omit<Notification, 'notificationId'>),
    notificationId: doc.id,
  }));
};
