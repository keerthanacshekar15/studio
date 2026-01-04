
'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User as UserIcon, Hash, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { updateUserAction, type UpdateUserState } from '@/lib/actions';

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : 'Update Profile'}
    </Button>
  );
}

export default function ProfilePage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const initialState: UpdateUserState = { message: '', success: false };
  const [state, formAction, isPending] = useActionState(updateUserAction, initialState);

  useEffect(() => {
    if (state.success && state.updatedUser) {
      toast({
        title: 'Profile Updated',
        description: 'Your details have been successfully updated.',
      });
      // Re-run login logic to update user context with new details
      login(state.updatedUser.userId, 'user');
    } else if (state.message) {
      toast({
        title: 'Update Failed',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast, login]);

  if (!user || user.type !== 'user') return null;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <Button asChild variant="ghost" className="mb-4">
        <Link href="/app/feed"><ArrowLeft />Back to Feed</Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>
            Update your personal information here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            <input type="hidden" name="userId" value={user.userId} />

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  name="fullName"
                  defaultValue={user.fullName}
                  required
                  className="pl-10"
                />
              </div>
              {state.errors?.fullName && <p className="text-sm text-destructive">{state.errors.fullName[0]}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="usn">USN / Roll Number</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="usn"
                  name="usn"
                  defaultValue={user.usn}
                  required
                  className="pl-10"
                />
              </div>
              {state.errors?.usn && <p className="text-sm text-destructive">{state.errors.usn[0]}</p>}
            </div>

            <SubmitButton pending={isPending} />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
