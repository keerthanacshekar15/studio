
'use server';

import type { User, Post, Notification, CreateUserDTO, Reply, Message } from './types';
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
  const users = await db.getUsers();
  return users.find(u => u.fullName.toLowerCase() === fullName.toLowerCase() && u.usn.toLowerCase() === usn.toLowerCase());
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
    userId: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
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

export const getPostWithReplies = async (postId: string): Promise<{ post: Post; replies: Reply[] } | null> => {
    const post = await db.getPostById(postId);
    if (!post) return null;
    const replies = await db.getRepliesByPostId(postId);
    return { post, replies };
}

export const addReplyToServer = async (postId: string, message: string, user: User): Promise<Reply> => {
    const newReply: Reply = {
        replyId: `reply-${Date.now()}`,
        postId,
        message,
        repliedBy: user.userId,
        repliedByName: user.fullName,
        createdAt: Date.now(),
    };
    db.addReply(newReply);

    const post = await db.getPostById(postId);
    if (post && post.postedBy !== user.userId) {
        db.addNotification({
            notificationId: `notif-reply-${Date.now()}`,
            userId: post.postedBy,
            type: 'reply',
            content: `${user.fullName} replied to your post: "${post.title}"`,
            link: `/app/post/${postId}`,
            createdAt: Date.now(),
            readStatus: false,
        });
    }

    return newReply;
};


export const createPost = async (
  postData: Omit<Post, 'postId' | 'status' | 'replyCount' | 'expiresAt' | 'createdAt'>
): Promise<Post> => {
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

export const getChat = async (postId: string, currentUser: User): Promise<{ chat: any, post: Post } | null> => {
    const post = await db.getPostById(postId);
    if (!post) return null;

    const postOwner = await db.getUserById(post.postedBy);
    if (!postOwner) return null;

    const chat = await db.getOrCreateChat(postId, postOwner, currentUser);
    return { chat, post };
}

export const addMessage = async(chatId: string, text: string, sender: User): Promise<Message> => {
    const message: Message = {
        messageId: `msg-${Date.now()}`,
        chatId,
        text,
        senderId: sender.userId,
        senderName: sender.fullName,
        timestamp: Date.now()
    }
    return db.addMessageToChat(chatId, message);
}
