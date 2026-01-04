
'use client';
import { useState, useEffect } from 'react';
import { getUsers } from '@/lib/data';
import type { User } from '@/lib/types';
import { VerificationCard } from '@/components/admin/VerificationCard';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-provider';
import { LogOut } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const { logout, user, isLoading } = useAuth();
  
  useEffect(() => {
    if (user?.type === 'admin') {
        async function fetchUsers() {
          const allUsers = await getUsers();
          const pendingUsers = allUsers.filter(u => u.verificationStatus === 'pending');
          setUsers(pendingUsers);
          setIsDataLoading(false);
        }
        fetchUsers();
    }
  }, [user]);
  
  const handleStatusChange = (userId: string) => {
    setUsers(prevUsers => {
        const newUsers = [...prevUsers];
        const userIndex = newUsers.findIndex(u => u.userId === userId);
        if(userIndex > -1) {
            newUsers.splice(userIndex, 1);
        }
        return newUsers;
    });
  }

  if (isLoading) {
      return (
          <div className="flex h-screen items-center justify-center">
              <p>Loading admin dashboard...</p>
          </div>
      )
  }

  if (user?.type !== 'admin') {
    return (
        <div className="flex h-screen items-center justify-center">
            <p>Access Denied. You are not an admin.</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <header className="flex items-center justify-between mb-6">
        <Logo />
        <Button variant="ghost" size="sm" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </header>
      <h1 className="text-2xl font-bold mb-4">User Verifications</h1>

        {isDataLoading ? (
            <div className="space-y-4">
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        ) : users.length > 0 ? (
        <div className="space-y-4">
          {users.map((user) => (
            <VerificationCard key={user.userId} user={user} onStatusChange={handleStatusChange} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-dashed border-2 rounded-lg">
            <h2 className="text-xl font-medium">All Clear!</h2>
            <p className="text-muted-foreground">There are no new user signups to review.</p>
        </div>
      )}
    </div>
  );
}
