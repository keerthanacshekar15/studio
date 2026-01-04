
'use server';

import type { User, Post, Notification, CreateUserDTO } from './types';

// NOTE: All Firebase Admin SDK logic has been temporarily removed to prevent
// application crashes due to a persistent server-side authentication issue.
// These functions return mock or empty data to allow the UI to run without errors.

export const getUsers = async (): Promise<User[]> => {
  console.warn('getUsers is returning mock data due to a server issue.');
  return [];
};

export const getUserById = async (
  userId: string
): Promise<User | undefined> => {
    console.warn('getUserById is returning mock data due to a server issue.');
  return undefined;
};

export const getUserByCredentials = async (
  fullName: string,
  usn: string
): Promise<User | undefined> => {
  console.warn('getUserByCredentials is returning mock data due to a server issue.');
  return undefined;
};

export const createUser = async (
  userData: CreateUserDTO
): Promise<{ user: User; isExisting: boolean }> => {
  console.warn('createUser is returning mock data due to a server issue.');
  // Return a mock user to allow the signup flow to proceed to the pending page.
  const mockUser: User = {
      ...userData,
      userId: `mock-user-${Date.now()}`,
      verificationStatus: 'pending',
      createdAt: Date.now(),
  };
  return { user: mockUser, isExisting: false };
};

export const updateUserStatus = async (
  userId: string,
  status: 'approved' | 'rejected'
): Promise<User | undefined> => {
  console.warn('updateUserStatus is a no-op due to a server issue.');
  return undefined;
};

export const getPosts = async (): Promise<Post[]> => {
    console.warn('getPosts is returning mock data due to a server issue.');
  return [];
};

export const createPost = async (
  postData: Omit<Post, 'postId' | 'status' | 'replyCount' | 'expiresAt' | 'createdAt'>
) => {
    console.warn('createPost is a no-op due to a server issue.');
  return;
};

export const getNotifications = async (
  userId: string
): Promise<Notification[]> => {
    console.warn('getNotifications is returning mock data due to a server issue.');
  return [];
};
