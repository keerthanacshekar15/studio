
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { getUserById } from '@/lib/data';

const AUTH_STORAGE_KEY = 'campusFindUser';

type AuthContextType = {
  user: (User & { type: 'user' }) | { adminId: string; type: 'admin' } | null;
  login: (id: string, type: 'user' | 'admin') => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const loadUserFromStorage = async () => {
      setIsLoading(true);
      try {
        const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
        if (storedUser) {
          const { id, type } = JSON.parse(storedUser);
          if (type === 'admin') {
            setUser({ adminId: id, type: 'admin' });
          } else {
            const fetchedUser = await getUserById(id);
            if (fetchedUser) {
              setUser({ ...fetchedUser, type: 'user' });
            } else {
              logout();
            }
          }
        }
      } catch (error) {
        console.error("Failed to load user from storage", error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };
    loadUserFromStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const isAuthPage = pathname.startsWith('/signup') || pathname === '/';
    const isAppPage = pathname.startsWith('/app') || pathname === '/pending';

    if (!user && isAppPage) {
        router.replace('/');
        return;
    }

    if (user) {
        if (user.type === 'admin') {
            if (pathname !== '/app/admin') {
                router.replace('/app/admin');
            }
        } else if (user.type === 'user') {
            if (user.verificationStatus === 'pending' && pathname !== '/pending') {
                router.replace('/pending');
            } else if (user.verificationStatus === 'approved' && (isAuthPage || pathname === '/pending')) {
                router.replace('/app/feed');
            }
        }
    }


  }, [user, isLoading, pathname, router]);


  const login = (id: string, type: 'user' | 'admin') => {
    setIsLoading(true);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ id, type }));
    if (type === 'admin') {
      const adminUser = { adminId: id, type: 'admin' };
      setUser(adminUser);
      router.push('/app/admin');
      setIsLoading(false);
    } else {
       getUserById(id).then(fetchedUser => {
        if(fetchedUser){
            setUser({ ...fetchedUser, type: 'user' });
            if (fetchedUser.verificationStatus === 'pending') {
                router.push('/pending');
            } else {
                router.push('/app/feed');
            }
        }
        setIsLoading(false);
       });
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    router.push('/');
  };

  const value = { user, login, logout, isLoading };

  return (
    <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
