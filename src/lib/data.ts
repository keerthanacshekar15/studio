// This file is intentionally left blank.
// Server-side data fetching is now handled in src/lib/server-actions.ts
// Client-side data fetching can be added here if needed.
import {
    getUsers as getUsers_server,
    getUserById as getUserById_server,
    getPosts as getPosts_server,
    getNotifications as getNotifications_server,
    updateUserStatus as updateUserStatus_server
} from './server-actions';

// These are wrapper functions to maintain compatibility with components that import from this file.
// They simply call the server actions.
export const getUsers = async () => getUsers_server();
export const getUserById = async (userId: string) => getUserById_server(userId);
export const getPosts = async () => getPosts_server();
export const getNotifications = async (userId: string) => getNotifications_server(userId);
export const updateUserStatus = async (userId: string, status: 'approved' | 'rejected') => updateUserStatus_server(userId, status);
