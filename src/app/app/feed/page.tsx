
'use client';
import { getPosts } from '@/lib/data';
import { PostCard } from '@/components/app/PostCard';
import { Button } from '@/components/ui/button';
import { PlusCircle, LogOut, User } from 'lucide-react';
import { Logo } from '@/components/Logo';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import type { Post } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function FeedPage() {
  const { logout } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getPosts().then(data => {
      setPosts(data);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <header className="flex items-center justify-between mb-6">
        <Logo />
        <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
                <Link href="/app/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                </Link>
            </Button>
            <Button asChild>
                <Link href="/app/new-post">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Post
                </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
        </div>
      </header>
      
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.postId} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
