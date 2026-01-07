
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
  messages: Message[];
  notifiedUsers: Set<string>;
};

const initialUsers: User[] = [
    {
        userId: 'user-001-approved',
        fullName: 'Jane Doe',
        usn: '4VM21CS001',
        idCardImageURL: PlaceHolderImages.find(img => img.id === 'id-card-1')!.imageUrl,
        verificationStatus: 'approved',
        createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    },
    // --- Adding 24 more users ---
    {
        userId: 'user-002-approved',
        fullName: 'John Smith',
        usn: '4VM21CS002',
        idCardImageURL: PlaceHolderImages.find(img => img.id === 'id-card-2')!.imageUrl,
        verificationStatus: 'approved',
        createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    },
    {
        userId: 'user-003-approved',
        fullName: 'Priya Patel',
        usn: '4VM21EC003',
        idCardImageURL: PlaceHolderImages.find(img => img.id === 'id-card-3')!.imageUrl,
        verificationStatus: 'approved',
        createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    },
    {
        userId: 'user-004-approved',
        fullName: 'Michael Brown',
        usn: '4VM20ME004',
        idCardImageURL: PlaceHolderImages.find(img => img.id === 'id-card-1')!.imageUrl,
        verificationStatus: 'approved',
        createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    },
    {
        userId: 'user-005-approved',
        fullName: 'Emily Johnson',
        usn: '4VM22CV005',
        idCardImageURL: PlaceHolderImages.find(img => img.id === 'id-card-2')!.imageUrl,
        verificationStatus: 'approved',
        createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
    },
    {
        userId: 'user-006-approved',
        fullName: 'David Lee',
        usn: '4VM21IS006',
        idCardImageURL: PlaceHolderImages.find(img => img.id === 'id-card-3')!.imageUrl,
        verificationStatus: 'approved',
        createdAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
    },
    {
        userId: 'user-007-approved',
        fullName: 'Sarah Garcia',
        usn: '4VM20EE007',
        idCardImageURL: PlaceHolderImages.find(img => img.id === 'id-card-1')!.imageUrl,
        verificationStatus: 'approved',
        createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    },
    {
        userId: 'user-008-approved',
        fullName: 'James Wilson',
        usn: '4VM22CS008',
        idCardImageURL: PlaceHolderImages.find(img => img.id === 'id-card-2')!.imageUrl,
        verificationStatus: 'approved',
        createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    },
    {
        userId: 'user-009-approved',
        fullName: 'Linda Martinez',
        usn: '4VM21EC009',
        idCardImageURL: PlaceHolderImages.find(img => img.id === 'id-card-3')!.imageUrl,
        verificationStatus: 'approved',
        createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    },
     {
        userId: 'user-010-approved',
        fullName: 'Robert Anderson',
        usn: '4VM20ME010',
        idCardImageURL: PlaceHolderImages.find(img => img.id === 'id-card-1')!.imageUrl,
        verificationStatus: 'approved',
        createdAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
    },
    {
        userId: 'user-011-approved',
        fullName: 'Jennifer Thomas',
        usn: '4VM22CV011',
        idCardImageURL: PlaceHolderImages.find(img => img.id === 'id-card-2')!.imageUrl,
        verificationStatus: 'approved',
        createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    },
    {
        userId: 'user-012-approved',
        fullName: 'William Hernandez',
        usn: '4VM21IS012',
        idCardImageURL: PlaceHolderImages.find(img => img.id === 'id-card-3')!.imageUrl,
        verificationStatus: 'approved',
        createdAt: Date.now() - 9 * 24 * 60 * 60 * 1000,
    },
    {
        userId: 'user-013-approved',
        fullName: 'Jessica Moore',
        usn: '4VM20EE013',
        idCardImageURL: PlaceHolderImages.find(img => img.id === 'id-card-1')!.imageUrl,
        verificationStatus: 'approved',
        createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
    },
    {
        userId: 'user-014-approved',
        fullName: 'Charles Martin',
        usn: '4VM22CS014',
        idCardImageURL: PlaceHolderImages.find(img => img.id === 'id-card-2')!.imageUrl,
        verificationStatus: 'approved',
        createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
    },
    {
        userId: 'user-015-approved',
        fullName: 'Patricia Jackson',
        usn: '4VM21EC015',
        idCardImageURL: PlaceHolderImages.find(img => img.id === 'id-card-3')!.imageUrl,
        verificationStatus: 'approved',
        createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    },
    {
        userId: 'user-016-approved',
        fullName: 'Christopher White',
        usn: '4VM20ME016',
        idCardImageURL: PlaceHolderImages.find(img => img.id === 'id-card-1')!.imageUrl,
        verificationStatus: 'approved',
        createdAt: Date.now() - 11 * 24 * 60 * 60 * 1000,
    },
    {
        userId: 'user-017-approved',
        fullName: 'Daniel Harris',
        usn: '4VM22CV017',
        idCardImageURL: PlaceHolderImages.find(img => img.id === 'id-card-2')!.imageUrl,
        verificationStatus: 'approved',
        createdAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
    },
    {
        userId: 'user-018-approved',
        fullName: 'Barbara Thompson',
        usn: '4VM21IS018',
        idCardImageURL: PlaceHolderImages.find(img => img.id === 'id-card-3')!.imageUrl,
        verificationStatus: 'approved',
        createdAt: Date.now() - 12 * 24 * 60 * 60 * 1000,
    },
    {
        userId: 'user-019-approved',
        fullName: 'Matthew Garcia',
        usn: '4VM20EE019',
        idCardImageURL: PlaceHolderImages.find(img => img.id === 'id-card-1')!.imageUrl,
        verificationStatus: 'approved',
        createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    },
    {
        userId: 'user-020-approved',
        fullName: 'Elizabeth Miller',
        usn: '4VM22CS020',
        idCardImageURL: PlaceHolderImages.find(img => img.id === 'id-card-2')!.imageUrl,
        verificationStatus: 'approved',
        createdAt: Date.now() - 13 * 24 * 60 * 60 * 1000,
    },
    // --- Pending Users for Admin Demo ---
    {
        userId: 'user-101-pending',
        fullName: 'Laura Clark',
        usn: '4VM23CS101',
        idCardImageURL: PlaceHolderImages.find(img => img.id === 'id-card-1')!.imageUrl,
        verificationStatus: 'pending',
        createdAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
    },
    {
        userId: 'user-102-pending',
        fullName: 'Kevin Rodriguez',
        usn: '4VM23EC102',
        idCardImageURL: PlaceHolderImages.find(img => img.id === 'id-card-2')!.imageUrl,
        verificationStatus: 'pending',
        createdAt: Date.now() - 5 * 60 * 60 * 1000, // 5 hours ago
    },
    {
        userId: 'user-103-pending',
        fullName: 'Karen Lewis',
        usn: '4VM23ME103',
        idCardImageURL: PlaceHolderImages.find(img => img.id === 'id-card-3')!.imageUrl,
        verificationStatus: 'pending',
        createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
    },
    {
        userId: 'user-104-pending',
        fullName: 'George Walker',
        usn: '4VM23CV104',
        idCardImageURL: PlaceHolderImages.find(img => img.id === 'id-card-1')!.imageUrl,
        verificationStatus: 'pending',
        createdAt: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
    },
    {
        userId: 'user-105-pending',
        fullName: 'Nancy Hall',
        usn: '4VM23IS105',
        idCardImageURL: PlaceHolderImages.find(img => img.id === 'id-card-2')!.imageUrl,
        verificationStatus: 'pending',
        createdAt: Date.now() - 10 * 60 * 1000, // 10 minutes ago
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
    postedBy: 'user-002-approved',
    postedByName: 'John Smith',
    status: 'open',
    replyCount: 0,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 2 * 60 * 60 * 1000,
  },
   {
    postId: 'post-003',
    postType: 'lost',
    title: 'Lost Keys on a Red Lanyard',
    description: 'A set of 3 keys on a bright red lanyard. Last seen near the science building this morning. One key is a car key.',
    location: 'Science Building',
    date: Date.now() - 8 * 60 * 60 * 1000,
    itemImageURL: PlaceHolderImages.find(img => img.id === 'lost-keys')!.imageUrl,
    postedBy: 'user-003-approved',
    postedByName: 'Priya Patel',
    status: 'open',
    replyCount: 0,
    expiresAt: Date.now() + 29 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 8 * 60 * 60 * 1000,
  },
];

const initialReplies: Reply[] = [
    {
        replyId: 'reply-001',
        postId: 'post-001',
        repliedBy: 'user-002-approved',
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
const initialMessages: Message[] = [];
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
const users = globalForDb.users ?? (globalForDb.users = [...initialUsers]);
const posts = globalForDb.posts ?? (globalForDb.posts = [...initialPosts]);
const replies = globalForDb.replies ?? (globalForDb.replies = [...initialReplies]);
const chats = globalForDb.chats ?? (globalForDb.chats = [...initialChats]);
const messages = globalForDb.messages ?? (globalForDb.messages = [...initialMessages]);
const notifications = globalForDb.notifications ?? (globalForDb.notifications = [...initialNotifications]);
const notifiedUsers = globalForDb.notifiedUsers ?? (globalForDb.notifiedUsers = new Set<string>());


export const db = {
  // User functions
  getUsers: async (): Promise<User[]> => [...users],
  getUserById: async (userId: string): Promise<User | undefined> => users.find(u => u.userId === userId),
  getUserByUsn: async (usn: string): Promise<User | undefined> => users.find(u => u.usn === usn),
  addUser: (user: User) => {
    users.push(user);
    return user;
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
    const remainingReplies = replies.filter(r => r.postId !== postId);
    replies.length = 0;
    replies.push(...remainingReplies);

    // Also delete associated chats
    const remainingChats = chats.filter(c => c.postId !== postId);
    chats.length = 0;
    chats.push(...remainingChats);
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
  getChatById: async(chatId: string): Promise<Chat | undefined> => chats.find(c => c.chatId === chatId),
  getChatsForUser: async(userId: string): Promise<Chat[]> => {
    return [...chats]
        .filter(c => c.userAId === userId || c.userBId === userId)
        .sort((a, b) => {
            const lastMessageA = messages.filter(m => m.chatId === a.chatId).sort((x, y) => y.timestamp - x.timestamp)[0];
            const lastMessageB = messages.filter(m => m.chatId === b.chatId).sort((x, y) => y.timestamp - x.timestamp)[0];
            return (lastMessageB?.timestamp ?? 0) - (lastMessageA?.timestamp ?? 0);
        });
  },
  getChatByPostAndUsers: async(postId: string, userAId: string, userBId: string): Promise<Chat | undefined> => {
    return chats.find(c => c.postId === postId && ((c.userAId === userAId && c.userBId === userBId) || (c.userAId === userBId && c.userBId === userAId)));
  },
  addChat: (chat: Chat) => {
    chats.push(chat);
    return chat;
  },
  
  // Message functions
  getMessagesByChatId: async(chatId: string): Promise<Message[]> => [...messages].filter(m => m.chatId === chatId).sort((a,b) => a.timestamp - b.timestamp),
  addMessageToChat: async(message: Message): Promise<Message> => {
    messages.push(message);
    return message;
  },

  // Notification functions
  getNotifications: async(userId: string): Promise<Notification[]> => [...notifications].filter(n => n.userId === userId).sort((a,b) => b.createdAt - a.createdAt),
  addNotification: (notification: Notification) => notifications.push(notification),
  hasNotified: (userId: string) => notifiedUsers.has(userId),
  markAsNotified: (userId: string) => notifiedUsers.add(userId),
};
