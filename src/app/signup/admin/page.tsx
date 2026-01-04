'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { adminSignup, type AdminSignupState } from '@/lib/actions';
import { useAuth } from '@/context/auth-provider';
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
  const initialState: AdminSignupState = { message: '', success: false };
  const [state, dispatch] = useActionState(adminSignup, initialState);
  const { toast } = useToast();
  const { login } = useAuth();

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: 'Success',
          description: state.message,
        });
        if (state.adminId) {
            login(state.adminId, 'admin');
        }
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
