import type { User, Post, Notification } from './types';
import { PlaceHolderImages } from './placeholder-images';

// --- MOCK DATABASE ---

let users: User[] = [
  {
    userId: 'user-001-approved',
    fullName: 'Jane Doe',
    usn: '4VM21CS050',
    idCardImageURL: PlaceHolderImages.find(p => p.id === 'id-card-1')?.imageUrl || '',
    verificationStatus: 'approved',
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },
  {
    userId: 'user-002-pending',
    fullName: 'John Smith',
    usn: '4VM21IS025',
    idCardImageURL: PlaceHolderImages.find(p => p.id === 'id-card-2')?.imageUrl || '',
    verificationStatus: 'pending',
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
  },
  {
    userId: 'user-003-pending',
    fullName: 'Alex Ray',
    usn: '4VM21EC010',
    idCardImageURL: PlaceHolderImages.find(p => p.id === 'id-card-3')?.imageUrl || '',
    verificationStatus: 'pending',
    createdAt: Date.now() - 2 * 60 * 60 * 1000,
  },
];

let posts: Post[] = [
  {
    postId: 'post-001',
    postType: 'lost',
    title: 'Lost my apartment keys near library',
    description: 'A set of three keys on a blue lanyard. One has a small bottle opener attached. Last seen near the main entrance of the library. Please contact if found!',
    location: 'Central Library',
    date: Date.now() - 1 * 24 * 60 * 60 * 1000,
    itemImageURL: PlaceHolderImages.find(p => p.id === 'lost-keys')?.imageUrl,
    postedBy: 'user-001-approved',
    postedByName: 'Jane Doe',
    status: 'open',
    replyCount: 2,
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    expiresAt: Date.now() + 28 * 24 * 60 * 60 * 1000,
  },
  {
    postId: 'post-002',
    postType: 'found',
    title: 'Found a water bottle in the gym',
    description: 'Found a black Hydro Flask water bottle on the basketball court. It has a few stickers on it. It is at the gym\'s front desk.',
    location: 'University Gym',
    date: Date.now() - 2 * 24 * 60 * 60 * 1000,
    itemImageURL: PlaceHolderImages.find(p => p.id === 'found-bottle')?.imageUrl,
    postedBy: 'user-001-approved',
    postedByName: 'Jane Doe',
    status: 'open',
    replyCount: 0,
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    expiresAt: Date.now() + 28 * 24 * 60 * 60 * 1000,
  },
    {
    postId: 'post-003',
    postType: 'lost',
    title: 'Lost my wallet',
    description: 'Black leather wallet, contained my student ID and some cash. Think I left it in the cafeteria.',
    location: 'Cafeteria',
    date: Date.now() - 3 * 24 * 60 * 60 * 1000,
    itemImageURL: PlaceHolderImages.find(p => p.id === 'lost-wallet')?.imageUrl,
    postedBy: 'user-001-approved',
    postedByName: 'Jane Doe',
    status: 'resolved',
    replyCount: 1,
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    expiresAt: Date.now() + 27 * 24 * 60 * 60 * 1000,
  },
];

let notifications: Notification[] = [
    {
        notificationId: 'notif-001',
        userId: 'user-001-approved',
        type: 'reply',
        content: 'Someone replied to your post "Lost my apartment keys..."',
        link: '/app/feed/post-001',
        createdAt: Date.now() - 1 * 60 * 60 * 1000,
        readStatus: false,
    },
    {
        notificationId: 'notif-002',
        userId: 'user-001-approved',
        type: 'message',
        content: 'You have a new message regarding "Lost my wallet"',
        link: '/app/messages/chat-001',
        createdAt: Date.now() - 5 * 60 * 60 * 1000,
        readStatus: true,
    }
]

// --- MOCK API FUNCTIONS ---

export const getPendingUsers = async (): Promise<User[]> => {
  return users.filter(user => user.verificationStatus === 'pending');
};

export const getUserById = async (userId: string): Promise<User | undefined> => {
  return users.find(user => user.userId === userId);
};

export const createUser = async (userData: Omit<User, 'userId' | 'createdAt' | 'verificationStatus'>): Promise<User> => {
  const newUser: User = {
    ...userData,
    userId: `user-${Date.now()}`,
    createdAt: Date.now(),
    verificationStatus: 'pending',
  };
  users.push(newUser);
  return newUser;
};

export const updateUserStatus = async (userId: string, status: 'approved' | 'rejected'): Promise<User | undefined> => {
  const userIndex = users.findIndex(user => user.userId === userId);
  if (userIndex !== -1) {
    users[userIndex].verificationStatus = status;
    return users[userIndex];
  }
  return undefined;
};

export const getPosts = async (): Promise<Post[]> => {
  // Filter out expired posts
  return posts
    .filter(post => post.expiresAt > Date.now())
    .sort((a, b) => b.createdAt - a.createdAt);
};

export const getNotifications = async (userId: string): Promise<Notification[]> => {
    return notifications
        .filter(n => n.userId === userId)
        .sort((a, b) => b.createdAt - a.createdAt);
}
