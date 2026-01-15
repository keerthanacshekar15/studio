
import type { User, Post, Notification, Reply, Chat, Message } from './types';
import { placeholderImages } from './placeholder-images.json';

const initialUsers: User[] = [
    {
    userId: 'user-1',
    fullName: 'Alice Johnson',
    usn: '1AB21CS001',
    idCardImageURL: placeholderImages[0].imageUrl,
    verificationStatus: 'approved',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    },
    {
    userId: 'user-2',
    fullName: 'Bob Williams',
    usn: '1AB21CS002',
    idCardImageURL: placeholderImages[1].imageUrl,
    verificationStatus: 'pending',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    },
    {
    userId: 'user-3',
    fullName: 'Charlie Brown',
    usn: '1AB21CS003',
    idCardImageURL: placeholderImages[2].imageUrl,
    verificationStatus: 'approved',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    },
    {
        userId: 'user-4',
        fullName: 'Diana Prince',
        usn: '1AB21ME001',
        idCardImageURL: 'https://picsum.photos/seed/4/600/400',
        verificationStatus: 'approved',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    },
    {
        userId: 'user-5',
        fullName: 'Ethan Hunt',
        usn: '1AB21EC002',
        idCardImageURL: 'https://picsum.photos/seed/5/600/400',
        verificationStatus: 'pending',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
    },
    {
        userId: 'user-6',
        fullName: 'Fiona Glenanne',
        usn: '1AB21CV003',
        idCardImageURL: 'https://picsum.photos/seed/6/600/400',
        verificationStatus: 'approved',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
    },
    {
        userId: 'user-7',
        fullName: 'George Constanza',
        usn: '1AB20CS004',
        idCardImageURL: 'https://picsum.photos/seed/7/600/400',
        verificationStatus: 'approved',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
    },
    {
        userId: 'user-8',
        fullName: 'Hannah Montana',
        usn: '1AB20ME005',
        idCardImageURL: 'https://picsum.photos/seed/8/600/400',
        verificationStatus: 'rejected',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
    },
    {
        userId: 'user-9',
        fullName: 'Ian Malcolm',
        usn: '1AB20EC006',
        idCardImageURL: 'https://picsum.photos/seed/9/600/400',
        verificationStatus: 'approved',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
    },
    {
        userId: 'user-10',
        fullName: 'Jane Doe',
        usn: '1AB22CS007',
        idCardImageURL: 'https://picsum.photos/seed/10/600/400',
        verificationStatus: 'pending',
        createdAt: Date.now() - 1000 * 60 * 30,
    },
    {
        userId: 'user-11',
        fullName: 'Kevin McCallister',
        usn: '1AB22ME008',
        idCardImageURL: 'https://picsum.photos/seed/11/600/400',
        verificationStatus: 'approved',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    },
    {
        userId: 'user-12',
        fullName: 'Laura Palmer',
        usn: '1AB22EC009',
        idCardImageURL: 'https://picsum.photos/seed/12/600/400',
        verificationStatus: 'approved',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
    },
    {
        userId: 'user-13',
        fullName: 'Michael Scott',
        usn: '1AB19CS010',
        idCardImageURL: 'https://picsum.photos/seed/13/600/400',
        verificationStatus: 'approved',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    },
    {
        userId: 'user-14',
        fullName: 'Nancy Drew',
        usn: '1AB19ME011',
        idCardImageURL: 'https://picsum.photos/seed/14/600/400',
        verificationStatus: 'approved',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
    },
    {
        userId: 'user-15',
        fullName: 'Oscar Martinez',
        usn: '1AB19EC012',
        idCardImageURL: 'https://picsum.photos/seed/15/600/400',
        verificationStatus: 'pending',
        createdAt: Date.now() - 1000 * 60 * 60 * 2,
    },
    {
        userId: 'user-16',
        fullName: 'Pam Beesly',
        usn: '1AB21CS013',
        idCardImageURL: 'https://picsum.photos/seed/16/600/400',
        verificationStatus: 'approved',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 9,
    },
    {
        userId: 'user-17',
        fullName: 'Quentin Coldwater',
        usn: '1AB21ME014',
        idCardImageURL: 'https://picsum.photos/seed/17/600/400',
        verificationStatus: 'approved',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 11,
    },
    {
        userId: 'user-18',
        fullName: 'Rachel Green',
        usn: '1AB21EC015',
        idCardImageURL: 'https://picsum.photos/seed/18/600/400',
        verificationStatus: 'approved',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14,
    },
    {
        userId: 'user-19',
        fullName: 'Steve Rogers',
        usn: '1AB20CS016',
        idCardImageURL: 'https://picsum.photos/seed/19/600/400',
        verificationStatus: 'approved',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 18,
    },
    {
        userId: 'user-20',
        fullName: 'Tony Stark',
        usn: '1AB20ME017',
        idCardImageURL: 'https://picsum.photos/seed/20/600/400',
        verificationStatus: 'approved',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 25,
    },
    {
        userId: 'user-21',
        fullName: 'Ursula Buffay',
        usn: '1AB20EC018',
        idCardImageURL: 'https://picsum.photos/seed/21/600/400',
        verificationStatus: 'rejected',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
    },
    {
        userId: 'user-22',
        fullName: 'Victor Frankenstein',
        usn: '1AB22CS019',
        idCardImageURL: 'https://picsum.photos/seed/22/600/400',
        verificationStatus: 'pending',
        createdAt: Date.now() - 1000 * 60 * 60 * 1,
    },
    {
        userId: 'user-23',
        fullName: 'Walter White',
        usn: '1AB22ME020',
        idCardImageURL: 'https://picsum.photos/seed/23/600/400',
        verificationStatus: 'approved',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 40,
    },
    {
        userId: 'user-24',
        fullName: 'Xena Warrior',
        usn: '1AB22EC021',
        idCardImageURL: 'https://picsum.photos/seed/24/600/400',
        verificationStatus: 'approved',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 13,
    },
    {
        userId: 'user-25',
        fullName: 'Yoda Master',
        usn: '1AB18CS022',
        idCardImageURL: 'https://picsum.photos/seed/25/600/400',
        verificationStatus: 'approved',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 100,
    },
];

const initialPosts: Post[] = [
    {
        postId: 'post-1',
        postType: 'lost',
        title: 'Lost: Black Leather Wallet',
        description: 'I lost my wallet somewhere near the main library. It has my student ID and about $20 cash. It\'s a black bifold wallet from Fossil.',
        location: 'Main Library',
        date: new Date('2024-05-20T14:00:00Z').getTime(),
        itemImageURL: placeholderImages[4].imageUrl,
        postedBy: 'user-1',
        postedByName: 'Alice Johnson',
        status: 'open',
        replyCount: 2,
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 25,
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    },
    {
        postId: 'post-2',
        postType: 'found',
        title: 'Found: Bunch of Keys',
        description: 'Found a set of keys on a bench in the central park area. Has a red keychain with a car logo on it.',
        location: 'Central Park',
        date: new Date('2024-05-22T09:30:00Z').getTime(),
        itemImageURL: placeholderImages[3].imageUrl,
        postedBy: 'user-3',
        postedByName: 'Charlie Brown',
        status: 'open',
        replyCount: 0,
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 28,
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    },
    {
        postId: 'post-3',
        postType: 'lost',
        title: 'Lost: iPhone 13 Pro',
        description: 'My phone must have slipped out of my pocket. It is a blue iPhone 13 Pro in a clear case. Last seen in the student union building.',
        location: 'Student Union',
        date: new Date('2024-05-23T18:00:00Z').getTime(),
        itemImageURL: placeholderImages[5].imageUrl,
        postedBy: 'user-4',
        postedByName: 'Diana Prince',
        status: 'open',
        replyCount: 1,
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 29,
        createdAt: Date.now() - 1000 * 60 * 60 * 5,
    },
    {
        postId: 'post-4',
        postType: 'found',
        title: 'Found: Water Bottle',
        description: 'Found a black Hydro Flask water bottle in the gym. It has a bunch of stickers on it. It was left near the treadmills.',
        location: 'Gym',
        date: new Date('2024-05-23T11:00:00Z').getTime(),
        itemImageURL: placeholderImages[6].imageUrl,
        postedBy: 'user-6',
        postedByName: 'Fiona Glenanne',
        status: 'open',
        replyCount: 0,
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 29,
        createdAt: Date.now() - 1000 * 60 * 60 * 8,
    },
];

const initialReplies: Reply[] = [
    {
        replyId: 'reply-1',
        postId: 'post-1',
        repliedBy: 'user-3',
        repliedByName: 'Charlie Brown',
        message: 'I think I saw a wallet near the library entrance yesterday. Did you check with the front desk?',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
    },
    {
        replyId: 'reply-2',
        postId: 'post-1',
        parentReplyId: 'reply-1',
        repliedBy: 'user-1',
        repliedByName: 'Alice Johnson',
        message: 'I did! They didn\'t have it, but thanks for the suggestion.',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    },
    {
        replyId: 'reply-3',
        postId: 'post-3',
        repliedBy: 'user-11',
        repliedByName: 'Kevin McCallister',
        message: 'Is there a reward if found?',
        createdAt: Date.now() - 1000 * 60 * 60 * 2,
    },
];

const initialNotifications: Notification[] = [
    {
        notificationId: 'notif-1',
        userId: 'user-1',
        type: 'reply',
        content: 'Charlie Brown replied to your post: "Lost: Black Leather Wallet"',
        link: '/app/post/post-1',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
        readStatus: false,
    },
    {
        notificationId: 'notif-2',
        userId: 'user-2',
        type: 'approval',
        content: 'Your account is still pending approval.',
        link: '/pending',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
        readStatus: true,
    }
];

const initialChats: Chat[] = [
    {
        chatId: 'chat-1',
        postId: 'post-1',
        userAId: 'user-1',
        userAName: 'Alice Johnson',
        userBId: 'user-3',
        userBName: 'Charlie Brown',
        messages: [
            {
                messageId: 'msg-1',
                chatId: 'chat-1',
                senderId: 'user-3',
                senderName: 'Charlie Brown',
                text: 'Hey, I commented on your post about the wallet.',
                timestamp: Date.now() - 1000 * 60 * 60 * 23,
            },
            {
                messageId: 'msg-2',
                chatId: 'chat-1',
                senderId: 'user-1',
                senderName: 'Alice Johnson',
                text: 'Hi Charlie! Yes, I saw that. Thanks for the heads up.',
                timestamp: Date.now() - 1000 * 60 * 60 * 22,
            },
        ]
    }
]

export class MockDB {
  private users: User[];
  private posts: Post[];
  private notifications: Notification[];
  private replies: Reply[];
  private chats: Chat[];
  private notifiedUsers: Set<string> = new Set();


  constructor() {
    this.users = JSON.parse(JSON.stringify(initialUsers));
    this.posts = JSON.parse(JSON.stringify(initialPosts));
    this.notifications = JSON.parse(JSON.stringify(initialNotifications));
    this.replies = JSON.parse(JSON.stringify(initialReplies));
    this.chats = JSON.parse(JSON.stringify(initialChats));
  }

  // --- User Methods ---
  async getUsers(): Promise<User[]> {
    return JSON.parse(JSON.stringify(this.users));
  }

  async getUserById(userId: string): Promise<User | undefined> {
    return this.users.find(user => user.userId === userId);
  }

  async getUserByUsn(usn: string): Promise<User | undefined> {
    return this.users.find(user => user.usn.toLowerCase() === usn.toLowerCase());
  }

  addUser(user: User): void {
    this.users.push(user);
  }

  updateUserStatus(userId: string, status: 'approved' | 'rejected'): User | undefined {
    const userIndex = this.users.findIndex(u => u.userId === userId);
    if (userIndex !== -1) {
      this.users[userIndex].verificationStatus = status;
      return this.users[userIndex];
    }
    return undefined;
  }
  
  updateUser(userId: string, fullName: string, usn: string): User | undefined {
    const userIndex = this.users.findIndex(u => u.userId === userId);
    if(userIndex > -1){
        this.users[userIndex].fullName = fullName;
        this.users[userIndex].usn = usn;
        return this.users[userIndex];
    }
    return undefined;
  }

  // --- Post Methods ---
  async getPosts(): Promise<Post[]> {
    return [...this.posts].sort((a, b) => b.createdAt - a.createdAt);
  }

  async getPostById(postId: string): Promise<Post | undefined> {
    return this.posts.find(post => post.postId === postId);
  }

  addPost(post: Post): void {
    this.posts.unshift(post);
  }
  
  deletePost(postId: string): void {
      this.posts = this.posts.filter(p => p.postId !== postId);
      this.replies = this.replies.filter(r => r.postId !== postId);
  }

  // --- Reply Methods ---
  async getRepliesByPostId(postId: string): Promise<Reply[]> {
      const postReplies = this.replies.filter(reply => reply.postId === postId);
      return postReplies.sort((a, b) => a.createdAt - b.createdAt);
  }

  addReply(reply: Reply): void {
      this.replies.push(reply);
      const post = this.posts.find(p => p.postId === reply.postId);
      if (post) {
          post.replyCount++;
      }
  }


  // --- Notification Methods ---
  async getNotifications(userId: string): Promise<Notification[]> {
    const userNotifications = this.notifications.filter(n => n.userId === userId);
    return [...userNotifications].sort((a, b) => b.createdAt - a.createdAt);
  }

  addNotification(notification: Notification): void {
    this.notifications.unshift(notification);
  }
  
  hasNotified(userId: string): boolean {
    return this.notifiedUsers.has(userId);
  }

  markAsNotified(userId: string): void {
      this.notifiedUsers.add(userId);
  }

  // --- Chat Methods ---
  async getOrCreateChat(postId: string, postOwner: User, currentUser: User): Promise<Chat> {
    const chatId = [postOwner.userId, currentUser.userId].sort().join('-');
    let chat = this.chats.find(c => c.chatId === chatId);

    if (!chat) {
        chat = {
            chatId: chatId,
            postId: postId,
            userAId: postOwner.userId,
            userAName: postOwner.fullName,
            userBId: currentUser.userId,
            userBName: currentUser.fullName,
            messages: [],
        };
        this.chats.push(chat);
    }
    return JSON.parse(JSON.stringify(chat));
  }

  async addMessageToChat(chatId: string, message: Message): Promise<Message> {
      const chat = this.chats.find(c => c.chatId === chatId);
      if (chat) {
          chat.messages.push(message);
      }
      return message;
  }
}
