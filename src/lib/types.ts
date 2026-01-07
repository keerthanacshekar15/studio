
export type User = {
  userId: string;
  fullName: string;
  usn: string; // Private
  idCardImageURL: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  createdAt: number;
};

export type CreateUserDTO = Omit<User, 'userId' | 'verificationStatus' | 'createdAt'>;

export type Admin = {
  adminId: string;
  createdAt: number;
};

export type Post = {
  postId: string;
  postType: 'lost' | 'found';
  title: string;
  description:string;
  location: string;
  date: number; // Timestamp of when item was lost/found
  itemImageURL?: string;
  postedBy: string; // userId
  postedByName: string;
  status: 'open' | 'resolved';
  replyCount: number;
  expiresAt: number;
  createdAt: number;
};

export type Reply = {
  replyId: string;
  postId: string;
  parentReplyId?: string; 
  repliedBy: string; // userId
  repliedByName: string;
  message: string;
  createdAt: number;
};

export type Chat = {
  chatId: string;
  postId: string;
  userAId: string; // Post owner
  userAName: string;
  userBId: string; // Replier
  userBName: string;
  messages: Message[];
};

export type Message = {
  messageId: string;
  chatId: string;
  senderId: string;
  senderName:string;
  text: string;
  timestamp: number;
};


export type Notification = {
  notificationId: string;
  userId: string;
  type: 'reply' | 'approval' | 'rejection' | 'message';
  content: string;
  link: string;
  createdAt: any; // Can be Timestamp or number
  readStatus: boolean;
};
