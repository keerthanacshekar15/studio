
'use server';

import type { User, Post, Notification, CreateUserDTO } from './types';
import { db } from './mock-db';

// This file is now the single source of truth for server-side data operations.
// It uses the mock-db to simulate a database.

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
  // Simulate finding a user by their credentials, allowing login only for existing users.
  const users = await db.getUsers();
  // Note: For login, we check against the full name which might not be unique.
  // In a real app, this would be a unique email or username.
  const matchedUser = users.find(u => u.fullName === fullName && u.usn === usn);
  return matchedUser;
};

export const createUser = async (
  userData: CreateUserDTO
): Promise<{ user: User; isExisting: boolean }> => {
  const existingUser = await db.getUserByUsn(userData.usn);
  if (existingUser) {
    // If the user exists, return them without creating a new one.
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
  const updatedUser = db.updateUserStatus(userId, status);
  
  if (updatedUser && !db.hasNotified(userId)) {
      if (status === 'approved') {
          db.addNotification({
              notificationId: `notif-approval-${Date.now()}`,
              userId: userId,
              type: 'approval',
              content: 'Congratulations! Your account has been approved by an administrator.',
              link: '/app/feed',
              createdAt: Date.now(),
              readStatus: false,
          });
      } else if (status === 'rejected') {
          db.addNotification({
              notificationId: `notif-rejection-${Date.now()}`,
              userId: userId,
              type: 'rejection',
              content: 'We are sorry, your account verification has been rejected.',
              link: '/',
              createdAt: Date.now(),
              readStatus: false,
          });
      }
      db.markAsNotified(userId);
  }

  return updatedUser;
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
    return db.getNotifications(userId);
};
