'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { ArrowLeft, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { adminSignup, type AdminSignupState } from '@/lib/actions';
import { useAuth } from '@/hooks/use-auth';
import { Logo } from '@/components/Logo';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Verifying...' : 'Login as Admin'}
    </Button>
  );
}

export default function AdminSignupPage() {
  const { toast } = useToast();
  const { login } = useAuth();
  
  const initialState: AdminSignupState = { message: '', success: false };
  
  const formAction = async (prevState: AdminSignupState, formData: FormData): Promise<AdminSignupState> => {
    const result = await adminSignup(prevState, formData);
    if (result.message) {
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        if (result.adminId) {
            login(result.adminId, 'admin');
        }
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    }
    return result;
  }
  
  const [state, dispatch] = useActionState(formAction, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
       <Button asChild variant="ghost" className="absolute left-4 top-4">
          <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
        </Button>
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
            <Logo className="justify-center mb-2"/>
            <CardTitle className="text-xl">Admin Access</CardTitle>
            <CardDescription>Enter the secret key to access the admin dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={dispatch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="key">Admin Key</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="key" name="key" type="password" placeholder="••••••" required className="pl-10" />
              </div>
            </div>
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
