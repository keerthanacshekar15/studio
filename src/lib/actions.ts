
'use server';

import { z } from 'zod';
import {
  createUser,
  getUserByCredentials,
  createPost,
  type CreateUserDTO
} from './data';
import type { VerifyIdInput } from '@/ai/flows/admin-assisted-id-verification';
import { verifyId } from '@/ai/flows/admin-assisted-id-verification';
import type { Post, User } from './types';

const ADMIN_KEY = '298761';

export type AdminSignupState = {
  message?: string;
  success: boolean;
  adminId?: string;
};

export async function adminSignup(
  prevState: AdminSignupState,
  formData: FormData
): Promise<AdminSignupState> {
  const key = formData.get('key');
  if (key === ADMIN_KEY) {
    const adminId = `admin-${Date.now()}`;
    return { message: 'Admin access granted!', success: true, adminId };
  } else {
    return { message: 'Invalid admin key.', success: false };
  }
}

const UserSignupSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters.'),
  usn: z.string().regex(/^4VM/, 'USN must start with "4VM".'),
  idCardImageURL: z.string().url('A valid image URL is required.'),
});

export type UserSignupState = {
  message?: string;
  success: boolean;
  isExistingUser?: boolean;
  newUser?: User;
  errors?: {
    fullName?: string[];
    usn?: string[];
    idCardImageURL?: string[];
  };
};

export async function validateUserSignup(
  prevState: UserSignupState,
  formData: FormData
): Promise<UserSignupState> {
  const validatedFields = UserSignupSchema.safeParse({
    fullName: formData.get('fullName'),
    usn: formData.get('usn'),
    idCardImageURL: formData.get('idCardImage'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Please check your input.',
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const newUserDTO: CreateUserDTO = {
    fullName: validatedFields.data.fullName,
    usn: validatedFields.data.usn,
    idCardImageURL: validatedFields.data.idCardImageURL,
  };

  try {
    const { user: createdUser, isExisting } = await createUser(newUserDTO);

    if (isExisting) {
      return {
        message: 'An account with this USN already exists. Please log in.',
        success: true,
        isExistingUser: true,
        newUser: createdUser,
      };
    }

    return {
      message: 'Signup successful! Your account is pending approval.',
      success: true,
      newUser: createdUser,
    };
  } catch (err: any) {
    console.error("Error in validateUserSignup:", err);
    return {
      message: err.message || 'An unexpected error occurred during user creation.',
      success: false,
    };
  }
}

export async function runIdVerification(input: VerifyIdInput) {
  try {
    const result = await verifyId(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'AI verification failed.' };
  }
}

const LoginSchema = z.object({
  fullName: z.string().min(1, 'Full name is required.'),
  usn: z.string().min(1, 'USN is required.'),
});

export type LoginState = {
  message: string;
  success: boolean;
  user?: User;
};

export async function loginUser(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const validatedFields = LoginSchema.safeParse({
    fullName: formData.get('fullName'),
    usn: formData.get('usn'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Both fields are required.',
      success: false,
    };
  }

  const { fullName, usn } = validatedFields.data;
  
  const existingUser = await getUserByCredentials(fullName, usn);

  if (existingUser) {
    return {
      message: 'Login successful!',
      success: true,
      user: existingUser,
    };
  } else {
    return {
      message: 'Invalid credentials or user not found.',
      success: false,
    };
  }
}

const PostSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().min(1, 'Description is required.'),
  location: z.string().min(1, 'Location is required.'),
  date: z.string().min(1, 'Date is required.'),
  postType: z.enum(['lost', 'found']),
  itemImageURL: z.string().url('A valid image URL is required.').optional().or(z.literal('')),
  postedBy: z.string(),
  postedByName: z.string()
});

export type NewPostState = {
    message?: string;
    success: boolean;
    errors?: {
        title?: string[];
        description?: string[];
        location?: string[];
        date?: string[];
        postType?: string[];
        itemImageURL?: string[];
    }
}

export async function newPostAction(prevState: NewPostState, formData: FormData): Promise<NewPostState> {
    const validatedFields = PostSchema.safeParse({
        title: formData.get('title'),
        description: formData.get('description'),
        location: formData.get('location'),
        date: formData.get('date'),
        postType: formData.get('postType'),
        itemImageURL: formData.get('itemImageURL'),
        postedBy: formData.get('postedBy'),
        postedByName: formData.get('postedByName'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Please check your input.',
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    try {
        await createPost({
            ...validatedFields.data,
            date: new Date(validatedFields.data.date).getTime(),
        } as Omit<Post, 'postId' | 'status' | 'replyCount' | 'expiresAt' | 'createdAt'>);

        return { message: 'Post created successfully!', success: true };
    } catch(e) {
        console.error("Error creating post:", e);
        return { message: 'Failed to create post.', success: false };
    }
}
