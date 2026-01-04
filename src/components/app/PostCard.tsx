import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Post } from '@/lib/types';
import { cn } from '@/lib/utils';
import { MessageSquare, MapPin, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type PostCardProps = {
  post: Post;
};

export function PostCard({ post }: PostCardProps) {
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  return (
    <Card className="overflow-hidden">
      {post.itemImageURL && (
        <div className="aspect-video relative w-full overflow-hidden">
          <Image
            src={post.itemImageURL}
            alt={post.title}
            fill
            className="object-cover"
            data-ai-hint={post.postType === 'lost' ? 'keys wallet' : 'bottle'}
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold tracking-tight">{post.title}</CardTitle>
             <Badge variant={post.postType === 'lost' ? 'destructive' : 'default'} className="uppercase">
                {post.postType}
            </Badge>
        </div>
        <CardDescription className="flex items-center gap-4 text-xs pt-1">
             <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {post.location}</span>
             <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {timeAgo}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">{post.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
        <span>By {post.postedByName}</span>
        <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs",
            post.replyCount >= 5 ? "text-destructive" : "text-primary"
            )}>
          <MessageSquare className="w-3 h-3" />
          <span>{post.replyCount}/5 Replies</span>
        </div>
      </CardFooter>
    </Card>
  );
}
