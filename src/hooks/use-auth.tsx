
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { getUserById } from '@/lib/server-actions';
import { useUser as useFirebaseUser } from '@/firebase';
import { signInAnonymously, signOut } from 'firebase/auth';
import { useAuth as useFirebaseAuth } from '@/firebase';

type AuthUser = (User & { type: 'user' }) | { adminId: string; type: 'admin' };

const AUTH_STORAGE_KEY = 'campusFindUser';

type AuthContextType = {
  user: AuthUser | null;
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
  const firebaseAuth = useFirebaseAuth();
  const { user: firebaseUser, isUserLoading: isFirebaseUserLoading } = useFirebaseUser();

  const logout = useCallback(async () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    await signOut(firebaseAuth);
    router.push('/');
  }, [firebaseAuth, router]);


  useEffect(() => {
    if (!firebaseUser && !isFirebaseUserLoading) {
      signInAnonymously(firebaseAuth).catch(console.error);
    }
  }, [firebaseUser, isFirebaseUserLoading, firebaseAuth]);


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
              // User not found in DB, clear storage
              localStorage.removeItem(AUTH_STORAGE_KEY);
              setUser(null);
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
  }, []);

  useEffect(() => {
    if (isLoading || isFirebaseUserLoading) return;

    const isAuthPage = pathname.startsWith('/signup') || pathname === '/' || pathname.startsWith('/login');
    const isAppPage = pathname.startsWith('/app') || pathname === '/pending';
    const isPendingPage = pathname === '/pending';
    const isAdminPage = pathname === '/app/admin';

    if (!user) {
      // If not logged in and trying to access app pages, redirect to home
      if (isAppPage) {
        router.replace('/');
      }
      return;
    }

    // --- Routing for logged-in users ---
    if (user.type === 'admin') {
        if (!isAdminPage) {
            router.replace('/app/admin');
        }
    } else if (user.type === 'user') {
        switch (user.verificationStatus) {
            case 'approved':
                // Approved users should not be on auth or pending pages
                if (isAuthPage || isPendingPage) {
                    router.replace('/app/feed');
                }
                break;
            case 'pending':
                // Pending users should only be on the pending page
                if (!isPendingPage) {
                    router.replace('/pending');
                }
                break;
            case 'rejected':
                // Log out rejected users
                logout();
                alert("Your account verification was rejected. Please contact support if you believe this is an error.");
                break;
        }
    }
  }, [user, isLoading, isFirebaseUserLoading, pathname, router, logout]);


  const login = useCallback((id: string, type: 'user' | 'admin') => {
    setIsLoading(true);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ id, type }));
    if (type === 'admin') {
      const adminUser = { adminId: id, type: 'admin' };
      setUser(adminUser);
      // Let useEffect handle routing
      setIsLoading(false);
    } else {
       getUserById(id).then(fetchedUser => {
        if(fetchedUser){
            setUser({ ...fetchedUser, type: 'user' });
        } else {
            // User couldn't be found, clear login
            localStorage.removeItem(AUTH_STORAGE_KEY);
        }
        // Let useEffect handle routing
        setIsLoading(false);
       }).catch(() => {
           localStorage.removeItem(AUTH_STORAGE_KEY);
           setIsLoading(false);
       });
    }
  }, []);

  const value = { user, login, logout, isLoading: isLoading || isFirebaseUserLoading };

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
