
'use server';

import type { User, Post, Notification, CreateUserDTO } from './types';
import { db } from './mock-db';

export const getUsers = async (): Promise<User[]> => {
  return db.getUsers();
};

export const getUserById = async (userId: string): Promise<User | undefined> => {
  return db.getUserById(userId);
};

export const getUserByCredentials = async (
  fullName: string,
  usn: string
): Promise<User | undefined> => {
  return db.getUserByCredentials(fullName, usn);
};

export const createUser = async (
  userData: CreateUserDTO
): Promise<{ user: User; isExisting: boolean }> => {
  const existingUser = await db.getUserByUsn(userData.usn);
  if (existingUser) {
    return { user: existingUser, isExisting: true };
  }

  const newUser: User = {
    ...userData,
    userId: `user-${Date.now()}`,
    verificationStatus: 'pending',
    createdAt: Date.now(),
  };

  db.addUser(newUser);
  return { user: newUser, isExisting: false };
};

export const updateUserStatus = async (
  userId: string,
  status: 'approved' | 'rejected'
): Promise<User | undefined> => {
  return db.updateUserStatus(userId, status);
};

export const getPosts = async (): Promise<Post[]> => {
  return db.getPosts();
};

export const createPost = async (
  postData: Omit<Post, 'postId' | 'status' | 'replyCount' | 'expiresAt' | 'createdAt'>
) => {
  const newPost: Post = {
    ...postData,
    postId: `post-${Date.now()}`,
    status: 'open',
    replyCount: 0,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
    createdAt: Date.now(),
  };
  db.addPost(newPost);
  return newPost;
};

export const getNotifications = async (userId: string): Promise<Notification[]> => {
    // Check for user approval/rejection and create notifications
    const user = await db.getUserById(userId);
    if (user && !db.hasNotified(userId)) {
        if (user.verificationStatus === 'approved') {
            db.addNotification({
                notificationId: `notif-${Date.now()}`,
                userId: userId,
                type: 'approval',
                content: 'Congratulations! Your account has been approved by an administrator.',
                link: '/app/feed',
                createdAt: Date.now(),
                readStatus: false,
            });
            db.markAsNotified(userId);
        } else if (user.verificationStatus === 'rejected') {
            db.addNotification({
                notificationId: `notif-${Date.now()}`,
                userId: userId,
                type: 'rejection',
                content: 'We are sorry, your account verification has been rejected.',
                link: '/',
                createdAt: Date.now(),
                readStatus: false,
            });
            db.markAsNotified(userId);
        }
    }
    return db.getNotifications(userId);
};
