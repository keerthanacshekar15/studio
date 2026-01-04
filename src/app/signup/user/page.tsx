'use client';

import { useActionState, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Hash, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { validateUserSignup, type UserSignupState } from '@/lib/actions';
import { createUser } from '@/lib/data';
import { useAuth } from '@/context/auth-provider';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Logo } from '@/components/Logo';

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Submitting...' : 'Create Account'}
    </Button>
  );
}

export default function UserSignupPage() {
  const initialState: UserSignupState = { message: '', success: false };
  const [state, formAction, isPending] = useActionState(validateUserSignup, initialState);
  const { toast } = useToast();
  const { login } = useAuth();
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.success && state.newUser) {
      // Validation was successful, now create the user on the client
      createUser({
        fullName: state.newUser.fullName,
        usn: state.newUser.usn,
        idCardImageURL: state.newUser.idCardImageURL,
      }).then((createdUser) => {
        toast({
          title: 'Success',
          description: 'Signup successful! Your account is pending approval.',
        });
        login(createdUser.userId, 'user');
      }).catch(err => {
         toast({
          title: 'Error',
          description: 'An unexpected error occurred during user creation.',
          variant: 'destructive',
        });
      });
    } else if (!state.success && state.message) {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast, login]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        const randomIdImage = PlaceHolderImages.find(img => img.id.startsWith('id-card'))!;
        setImageUrl(randomIdImage.imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Button asChild variant="ghost" className="absolute left-4 top-4">
          <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
      </Button>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
            <Logo className="justify-center mb-2" />
            <CardTitle className="text-xl">User Signup</CardTitle>
            <CardDescription>Create an account to start finding and reporting items.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
               <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="fullName" name="fullName" placeholder="As on your College ID" required className="pl-10" />
               </div>
               {state.errors?.fullName && <p className="text-sm text-destructive">{state.errors.fullName[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="usn">USN / Roll Number</Label>
               <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="usn" name="usn" placeholder="e.g., 4VM21CS001" required className="pl-10"/>
               </div>
               {state.errors?.usn && <p className="text-sm text-destructive">{state.errors.usn[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label>College ID Card</Label>
              <div 
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer hover:border-primary"
                onClick={handleUploadClick}
              >
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <Image src={imagePreview} alt="ID card preview" width={200} height={125} className="mx-auto rounded-md object-cover"/>
                  ) : (
                    <>
                    <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Upload a clear image of your ID
                    </p>
                    </>
                  )}
                </div>
              </div>
              <Input 
                id="idCardImage-file" 
                name="idCardImage-file" 
                type="file" 
                accept="image/*"
                className="hidden" 
                ref={fileInputRef}
                onChange={handleImageChange}
                required
              />
               <input type="hidden" name="idCardImage" value={imageUrl} />
               {state.errors?.idCardImage && <p className="text-sm text-destructive">{state.errors.idCardImage[0]}</p>}
            </div>
            <SubmitButton pending={isPending} />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
