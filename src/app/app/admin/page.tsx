
'use client';
import { useState, useEffect } from 'react';
import { getUsers } from '@/lib/data';
import type { User } from '@/lib/types';
import { VerificationCard } from '@/components/admin/VerificationCard';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { LogOut } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const { logout, user, isLoading } = useAuth();
  
  useEffect(() => {
    if (user?.type === 'admin') {
      const fetchUsers = async () => {
        setIsDataLoading(true);
        const allUsers = await getUsers();
        setUsers(allUsers);
        setIsDataLoading(false);
      }
      fetchUsers();
    } else if (!isLoading) {
        setIsDataLoading(false);
    }
  }, [user, isLoading]);
  
  const handleStatusChange = (userId: string, status: 'approved' | 'rejected') => {
    setUsers((prevUsers) => prevUsers.filter((u) => u.userId !== userId));
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

  const pendingUsers = users.filter(u => u.verificationStatus === 'pending');

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <header className="flex items-center justify-between mb-6">
        <Logo />
        <Button variant="ghost" size="sm" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </header>
      <h1 className="text-2xl font-bold mb-4">Pending Verifications</h1>

        {isDataLoading ? (
            <div className="space-y-4">
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        ) : pendingUsers.length > 0 ? (
        <div className="space-y-4">
          {pendingUsers.map((user) => (
            <VerificationCard key={user.userId} user={user} onStatusChange={handleStatusChange} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-dashed border-2 rounded-lg">
            <h2 className="text-xl font-medium">No Pending Verifications</h2>
            <p className="text-muted-foreground">There are no new users to verify.</p>
        </div>
      )}
    </div>
  );
}
