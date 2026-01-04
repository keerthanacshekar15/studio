'use client';

import { useActionState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { loginUser, type LoginState } from '@/lib/actions';
import { useAuth } from '@/hooks/use-auth';
import { Logo } from '@/components/Logo';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Logging in...' : 'Log In'}
    </Button>
  );
}

export default function LoginPage() {
  const { toast } = useToast();
  const { login } = useAuth();
  
  const initialState: LoginState = { message: '', success: false };
  
  const formAction = async (prevState: LoginState, formData: FormData): Promise<LoginState> => {
    const result = await loginUser(prevState, formData);
    return result;
  }
  
  const [state, dispatch] = useActionState(formAction, initialState);

  useEffect(() => {
    if (state.message) {
      if (state.success && state.user) {
        toast({
          title: 'Success',
          description: state.message,
        });
        login(state.user.userId, 'user');
      } else {
        toast({
          title: 'Error',
          description: state.message,
          variant: 'destructive',
        });
      }
    }
  }, [state, toast, login]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Button asChild variant="ghost" className="absolute left-4 top-4">
          <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to Home</Link>
      </Button>
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
            <Logo className="justify-center mb-2"/>
            <CardTitle className="text-xl">User Login</CardTitle>
            <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={dispatch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="fullName" name="fullName" placeholder="Your full name" required className="pl-10" />
              </div>
            </div>
             <div className="space-y-2">
              <Label htmlFor="usn">USN / Roll Number</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="usn" name="usn" placeholder="Your USN" required className="pl-10" />
              </div>
            </div>
            <SubmitButton />
             <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/signup/user" className="font-semibold text-primary hover:underline">
                    Sign up
                </Link>
             </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
