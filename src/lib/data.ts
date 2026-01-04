
// This file is now a pass-through for server actions to maintain component compatibility.
import {
    getUsers as getUsers_server,
    getUserById as getUserById_server,
    getPosts as getPosts_server,
    getNotifications as getNotifications_server,
    updateUserStatus as updateUserStatus_server
} from './server-actions';

export const getUsers = async () => getUsers_server();
export const getUserById = async (userId: string) => getUserById_server(userId);
export const getPosts = async () => getPosts_server();
export const getNotifications = async (userId: string) => getNotifications_server(userId);
export const updateUserStatus = async (userId: string, status: 'approved' | 'rejected') => updateUserStatus_server(userId, status);
