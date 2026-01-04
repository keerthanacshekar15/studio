'use server';

import { z } from 'zod';
import { createUser } from './data';
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
    userId?: string;
}

export async function userSignup(prevState: UserSignupState, formData: FormData): Promise<UserSignupState> {
    const validatedFields = UserSignupSchema.safeParse({
        fullName: formData.get('fullName'),
        usn: formData.get('usn'),
        idCardImage: formData.get('idCardImage'),
    });

    if (!validatedFields.success) {
        return {
            message: validatedFields.error.flatten().fieldErrors[Object.keys(validatedFields.error.flatten().fieldErrors)[0] as string]![0],
            success: false,
        };
    }
    
    try {
        const newUser = await createUser({
            fullName: validatedFields.data.fullName,
            usn: validatedFields.data.usn,
            idCardImageURL: validatedFields.data.idCardImage,
        });
        return { message: 'Signup successful! Your account is pending approval.', success: true, userId: newUser.userId };
    } catch (error) {
        return { message: 'An unexpected error occurred.', success: false };
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
