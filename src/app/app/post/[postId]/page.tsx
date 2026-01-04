
'use client';

import { useEffect, useState, useActionState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { Post, Reply, User } from '@/lib/types';
import { addReplyToServer, getPostWithReplies } from '@/lib/server-actions';
import { PostCard } from '@/components/app/PostCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Send, ArrowLeft, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

function ReplyForm({ postId, user, onReplyAdded }: { postId: string, user: User, onReplyAdded: (newReply: Reply) => void }) {
    const [message, setMessage] = useState('');
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        const newReply = await addReplyToServer(postId, message, user);
        onReplyAdded(newReply);
        setMessage('');
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
            <Textarea
                placeholder="Write a reply..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1"
                rows={1}
            />
            <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
            </Button>
        </form>
    );
}

export default function PostDetailsPage({ params }: { params: { postId: string } }) {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [data, setData] = useState<{ post: Post; replies: Reply[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (params.postId) {
            getPostWithReplies(params.postId).then(result => {
                setData(result);
                setIsLoading(false);
            });
        }
    }, [params.postId]);
    
    const handleReplyAdded = (newReply: Reply) => {
        setData(prevData => {
            if (!prevData) return null;
            return {
                ...prevData,
                replies: [...prevData.replies, newReply],
                post: { ...prevData.post, replyCount: prevData.post.replyCount + 1 }
            }
        });
    }

    if (isLoading || isAuthLoading) {
        return (
            <div className="container mx-auto max-w-2xl px-4 py-6 space-y-4">
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        )
    }

    if (!data) {
        return <div className="text-center py-10">Post not found.</div>;
    }

    const { post, replies } = data;

    return (
        <div className="container mx-auto max-w-2xl px-4 py-6">
            <Button asChild variant="ghost" className="mb-4">
              <Link href="/app/feed"><ArrowLeft />Back to Feed</Link>
            </Button>

            <PostCard post={post} />
            
            {user && user.type === 'user' && post.postedBy !== user.userId && (
                <Button asChild className="w-full mt-4">
                    <Link href={`/app/chat/${post.postId}`}>
                        <MessageSquare className="mr-2 h-4 w-4" /> Message Owner
                    </Link>
                </Button>
            )}

            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>{post.replyCount} Replies</CardTitle>
                </CardHeader>
                <CardContent>
                    {replies.length > 0 ? (
                        <div className="space-y-4">
                            {replies.map(reply => (
                                <div key={reply.replyId} className="flex gap-3">
                                    <Avatar>
                                        <AvatarImage src={`https://i.pravatar.cc/150?u=${reply.repliedBy}`} />
                                        <AvatarFallback>{reply.repliedByName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="font-semibold">{reply.repliedByName}</span>
                                            <span className="text-muted-foreground text-xs">
                                                {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{reply.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No replies yet. Be the first to reply!</p>
                    )}
                    {user && user.type === 'user' && (
                       <ReplyForm postId={post.postId} user={user} onReplyAdded={handleReplyAdded} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
