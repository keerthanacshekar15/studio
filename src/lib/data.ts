
'use server';

// This file is now a pass-through for server actions to maintain component compatibility.
import {
    getUsers as getUsers_server,
    getUserById as getUserById_server,
    getPosts as getPosts_server,
    getNotifications as getNotifications_server,
    updateUserStatus as updateUserStatus_server,
    createPost as createPost_server,
    updateUser as updateUser_server,
    getIdVerifications as getIdVerifications_server,
} from './server-actions';
import type { Post } from './types';

export const getUsers = async () => getIdVerifications_server();
export const getUserById = async (userId: string) => getUserById_server(userId);
export const getPosts = async () => getPosts_server();
export const getNotifications = async (userId: string) => getNotifications_server(userId);
export const updateUserStatus = async (userId: string, status: 'approved' | 'rejected') => updateUserStatus_server(userId, status);
export const createPost = async (postData: Omit<Post, 'postId' | 'status' | 'replyCount' | 'expiresAt' | 'createdAt'>) => createPost_server(postData);
export const updateUser = async (userId: string, fullName: string, usn: string) => updateUser_server(userId, fullName, usn);
