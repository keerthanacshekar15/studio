
import type { User, Post, Notification, Reply, Chat, Message } from './types';
import { PlaceHolderImages } from './placeholder-images';

// In-memory store attached to the global object to persist across hot-reloads in dev.
// This is a common pattern for simulating a database in a Next.js development environment.
const globalForDb = globalThis as unknown as {
  users: User[];
  posts: Post[];
  notifications: Notification[];
  replies: Reply[];
  chats: Chat[];
  notifiedUsers: Set<string>;
};

const initialUsers: User[] = [
    {
        userId: 'user-001-approved',
        fullName: 'Jane Doe (Approved)',
        usn: '4VM21CS001',
        idCardImageURL: PlaceHolderImages.find(img => img.id === 'id-card-1')!.imageUrl,
        verificationStatus: 'approved',
        createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    }
];

const initialPosts: Post[] = [
  {
    postId: 'post-001',
    postType: 'lost',
    title: 'Lost my Programming Textbook',
    description: 'I seem to have misplaced my "Cracking the Coding Interview" book somewhere in the library. It has a blue cover and some coffee stains on the corner. Any help would be greatly appreciated!',
    location: 'Central Library, 3rd Floor',
    date: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
    itemImageURL: PlaceHolderImages.find(img => img.id === 'lost-wallet')!.imageUrl,
    postedBy: 'user-001-approved',
    postedByName: 'Jane Doe',
    status: 'open',
    replyCount: 2,
    expiresAt: Date.now() + 29 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
  },
  {
    postId: 'post-002',
    postType: 'found',
    title: 'Found a Water Bottle',
    description: 'Found a steel water bottle near the basketball court. It has a "Studio" sticker on it. It is currently with me. Please contact me to claim it.',
    location: 'Basketball Court',
    date: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
    itemImageURL: PlaceHolderImages.find(img => img.id === 'found-bottle')!.imageUrl,
    postedBy: 'user-001-approved',
    postedByName: 'Jane Doe',
    status: 'open',
    replyCount: 0,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 2 * 60 * 60 * 1000,
  },
];

const initialReplies: Reply[] = [
    {
        replyId: 'reply-001',
        postId: 'post-001',
        repliedBy: 'user-002-other',
        repliedByName: 'John Smith',
        message: 'I think I saw it near the checkout counter yesterday!',
        createdAt: Date.now() - 20 * 60 * 60 * 1000, // 20 hours ago
    },
    {
        replyId: 'reply-002',
        postId: 'post-001',
        parentReplyId: 'reply-001',
        repliedBy: 'user-001-approved',
        repliedByName: 'Jane Doe',
        message: 'Oh really? I will check there, thanks!',
        createdAt: Date.now() - 18 * 60 * 60 * 1000, // 18 hours ago
    }
];

const initialChats: Chat[] = [];
const initialNotifications: Notification[] = [
    {
        notificationId: 'notif-001',
        userId: 'user-001-approved',
        type: 'reply',
        content: 'Someone replied to your "Lost my Programming Textbook" post.',
        link: '/app/post/post-001',
        createdAt: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
        readStatus: false,
    }
];

// Initialize the global store only if it doesn't exist
let users = globalForDb.users ?? (globalForDb.users = [...initialUsers]);
let posts = globalForDb.posts ?? (globalForDb.posts = [...initialPosts]);
let replies = globalForDb.replies ?? (globalForDb.replies = [...initialReplies]);
let chats = globalForDb.chats ?? (globalForDb.chats = [...initialChats]);
const notifications = globalForDb.notifications ?? (globalForDb.notifications = [...initialNotifications]);
const notifiedUsers = globalForDb.notifiedUsers ?? (globalForDb.notifiedUsers = new Set<string>());


export const db = {
  // User functions
  getUsers: async (): Promise<User[]> => [...users],
  getUserById: async (userId: string): Promise<User | undefined> => users.find(u => u.userId === userId),
  getUserByUsn: async (usn: string): Promise<User | undefined> => users.find(u => u.usn === usn),
  getUserByCredentials: async (fullName: string, usn: string): Promise<User | undefined> => users.find(u => u.fullName.toLowerCase() === fullName.toLowerCase() && u.usn.toLowerCase() === usn.toLowerCase()),
  addUser: (user: User) => {
    users.push(user);
  },
  updateUserStatus: (userId: string, status: 'approved' | 'rejected'): User | undefined => {
    const userIndex = users.findIndex(u => u.userId === userId);
    if (userIndex !== -1) {
      users[userIndex].verificationStatus = status;
      return users[userIndex];
    }
    return undefined;
  },
  updateUser: (userId: string, fullName: string, usn: string): User | undefined => {
    const userIndex = users.findIndex(u => u.userId === userId);
    if (userIndex !== -1) {
      users[userIndex].fullName = fullName;
      users[userIndex].usn = usn;
      return users[userIndex];
    }
    return undefined;
  },
  
  // Post functions
  getPosts: async (): Promise<Post[]> => [...posts].sort((a, b) => b.createdAt - a.createdAt),
  getPostById: async (postId: string): Promise<Post | undefined> => posts.find(p => p.postId === postId),
  addPost: (post: Post) => {
    posts.unshift(post);
  },
  deletePost: async (postId: string): Promise<void> => {
    const postIndex = posts.findIndex(p => p.postId === postId);
    if (postIndex > -1) {
        posts.splice(postIndex, 1);
    }
    // Also delete associated replies
    replies = replies.filter(r => r.postId !== postId);
    // Also delete associated chats
    chats = chats.filter(c => c.postId !== postId);
  },
  
  // Reply functions
  getRepliesByPostId: async (postId: string): Promise<Reply[]> => [...replies].filter(r => r.postId === postId).sort((a,b) => a.createdAt - b.createdAt),
  addReply: (reply: Reply) => { 
    replies.push(reply);
    const post = posts.find(p => p.postId === reply.postId);
    if (post) {
      post.replyCount = (post.replyCount || 0) + 1;
    }
  },

  // Chat functions
  getChatsForUser: async(userId: string): Promise<Chat[]> => [...chats].filter(c => c.userAId === userId || c.userBId === userId).sort((a, b) => (b.messages.at(-1)?.timestamp ?? 0) - (a.messages.at(-1)?.timestamp ?? 0)),
  getChatByPostAndUser: async(postId: string, userBId: string): Promise<Chat | undefined> => chats.find(c => c.postId === postId && c.userBId === userBId),
  getOrCreateChat: async(postId: string, userA: User, userB: User): Promise<Chat> => {
    let chat = chats.find(c => c.postId === postId && ((c.userAId === userA.userId && c.userBId === userB.userId) || (c.userAId === userB.userId && c.userBId === userA.userId)));
    if (!chat) {
        chat = {
            chatId: `chat-${Date.now()}`,
            postId: postId,
            userAId: userA.userId,
            userAName: userA.fullName,
            userBId: userB.userId,
            userBName: userB.fullName,
            messages: []
        };
        chats.push(chat);
    }
    return chat;
  },
  addMessageToChat: async(chatId: string, message: Message): Promise<Message> => {
    const chat = chats.find(c => c.chatId === chatId);
    if (chat) {
        chat.messages.push(message);
        return message;
    }
    throw new Error("Chat not found");
  },

  // Notification functions
  getNotifications: async(userId: string): Promise<Notification[]> => [...notifications].filter(n => n.userId === userId).sort((a,b) => b.createdAt - a.createdAt),
  addNotification: (notification: Notification) => notifications.push(notification),
  hasNotified: (userId: string) => notifiedUsers.has(userId),
  markAsNotified: (userId: string) => notifiedUsers.add(userId),
};
