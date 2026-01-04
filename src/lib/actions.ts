'use server';

import { z } from 'zod';
import { createUser, type CreateUserDTO } from './data';
import type { VerifyIdInput } from '@/ai/flows/admin-assisted-id-verification';
import { verifyId } from '@/ai/flows/admin-assisted-id-verification';


const ADMIN_KEY = '298761';

export type AdminSignupState = {
    message?: string;
    success: boolean;
    adminId?: string;
}

export async function adminSignup(prevState: AdminSignupState, formData: FormData): Promise<AdminSignupState> {
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
  idCardImage: z.string().url("A valid image URL is required.")
});


export type UserSignupState = {
    message?: string;
    success: boolean;
    newUser?: CreateUserDTO & { userId: string };
    errors?: {
        fullName?: string[];
        usn?: string[];
        idCardImage?: string[];
    }
}

// This action now only validates the data and returns it.
// The component will then handle the user creation on the client.
export async function validateUserSignup(prevState: UserSignupState, formData: FormData): Promise<UserSignupState> {
    const validatedFields = UserSignupSchema.safeParse({
        fullName: formData.get('fullName'),
        usn: formData.get('usn'),
        idCardImage: formData.get('idCardImage'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Please check your input.',
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    // Return the validated data so the client can create the user
    const newUser = {
        ...validatedFields.data,
        userId: `user-${Date.now()}`,
        idCardImageURL: validatedFields.data.idCardImage,
    };

    return { 
        message: 'Validation successful!', 
        success: true,
        newUser
    };
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
