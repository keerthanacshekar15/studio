
'use server';

import {
    getUsers as getUsers_server,
    getUserById as getUserById_server,
    getPosts as getPosts_server,
    getNotifications as getNotifications_server,
    updateUserStatus as updateUserStatus_server,
    createPost as createPost_server,
    updateUser as updateUser_server,
} from './server-actions';
import type { Post } from './types';

// This function is now intended for the admin page to get pending users.
export const getUsers = async () => {
    // In a real app, this would fetch users needing verification.
    // The server-action will handle the firestore query.
    return getUsers_server();
};

export const getUserById = async (userId: string) => getUserById_server(userId);
export const getPosts = async () => getPosts_server();
export const getNotifications = async (userId: string) => getNotifications_server(userId);
export const updateUserStatus = async (userId: string, status: 'approved' | 'rejected') => updateUserStatus_server(userId, status);
export const createPost = async (postData: Omit<Post, 'postId' | 'status' | 'replyCount' | 'expiresAt' | 'createdAt'>) => createPost_server(postData);
export const updateUser = async (userId: string, fullName: string, usn: string) => updateUser_server(userId, fullName, usn);
