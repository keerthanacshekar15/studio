import { getPosts } from '@/lib/data';
import { PostCard } from '@/components/app/PostCard';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Logo } from '@/components/Logo';

export default async function FeedPage() {
  const posts = await getPosts();

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <header className="flex items-center justify-between mb-6">
        <Logo />
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </header>
      
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.postId} post={post} />
        ))}
      </div>
    </div>
  );
}
