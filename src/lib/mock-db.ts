
import type { User, Post, Notification } from './types';
import { PlaceHolderImages } from './placeholder-images';

// In-memory store
const initialUsers: User[] = [
    {
        userId: 'user-001-approved',
        fullName: 'Jane Doe (Approved)',
        usn: '4VM21CS001',
        idCardImageURL: PlaceHolderImages.find(img => img.id === 'id-card-1')!.imageUrl,
        verificationStatus: 'approved',
        createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    },
    {
        userId: 'user-002-pending',
        fullName: 'John Smith (Pending)',
        usn: '4VM21CS002',
        idCardImageURL: PlaceHolderImages.find(img => img.id === 'id-card-2')!.imageUrl,
        verificationStatus: 'pending',
        createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
    },
     {
        userId: 'user-003-rejected',
        fullName: 'Peter Jones (Rejected)',
        usn: '4VM21CS003',
        idCardImageURL: PlaceHolderImages.find(img => img.id === 'id-card-3')!.imageUrl,
        verificationStatus: 'rejected',
        createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
    }
];
let users: User[] = [...initialUsers];

let posts: Post[] = [
  {
    postId: 'post-001',
    postType: 'lost',
    title: 'Lost my Programming Textbook',
    description: 'I seem to have misplaced my "Cracking the Coding Interview" book somewhere in the library. It has a blue cover and some coffee stains on the corner. Any help would be greatly appreciated!',
    location: 'Central Library, 3rd Floor',
    date: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
    itemImageURL: PlaceHolderImages.find(img => img.id === 'lost-keys')!.imageUrl,
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
let notifications: Notification[] = [
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

// To prevent creating duplicate notifications on hot reloads
let notifiedUsers = new Set<string>();

export const db = {
  // User functions
  getUsers: async (): Promise<User[]> => [...users],
  getUserById: async (userId: string): Promise<User | undefined> => users.find(u => u.userId === userId),
  getUserByUsn: async (usn: string): Promise<User | undefined> => users.find(u => u.usn === usn),
  getUserByCredentials: async (fullName: string, usn: string): Promise<User | undefined> => users.find(u => u.fullName === fullName && u.usn === usn),
  addUser: (user: User) => {
    const exists = users.some(u => u.usn === user.usn);
    if (!exists) {
      users.push(user);
    } else {
      console.log(`User with USN ${user.usn} already exists.`);
    }
  },
  updateUserStatus: (userId: string, status: 'approved' | 'rejected'): User | undefined => {
    const userIndex = users.findIndex(u => u.userId === userId);
    if (userIndex !== -1) {
      users[userIndex].verificationStatus = status;
      return users[userIndex];
    }
    return undefined;
  },
  
  // Post functions
  getPosts: async (): Promise<Post[]> => [...posts].sort((a, b) => b.createdAt - a.createdAt),
  addPost: (post: Post) => posts.push(post),

  // Notification functions
  getNotifications: async(userId: string): Promise<Notification[]> => [...notifications].filter(n => n.userId === userId).sort((a,b) => b.createdAt - a.createdAt),
  addNotification: (notification: Notification) => notifications.push(notification),
  hasNotified: (userId: string) => notifiedUsers.has(userId),
  markAsNotified: (userId: string) => notifiedUsers.add(userId),
};
