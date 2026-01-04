
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { Post, Reply, User } from '@/lib/types';
import { addReplyToServer, getPostWithReplies } from '@/lib/server-actions';
import { PostCard } from '@/components/app/PostCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { Send, ArrowLeft, Reply as ReplyIcon } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

function ReplyForm({ postId, user, onReplyAdded, parentReplyId, onCancel }: { postId: string, user: User, onReplyAdded: (newReply: Reply) => void, parentReplyId?: string | null, onCancel?: () => void }) {
    const [message, setMessage] = useState('');
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        const newReply = await addReplyToServer(postId, message, user, parentReplyId);
        onReplyAdded(newReply);
        setMessage('');
        if(onCancel) onCancel();
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-2">
            <Textarea
                placeholder="Write a reply..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1"
                rows={2}
                autoFocus={!!parentReplyId}
            />
            <div className='flex justify-end gap-2'>
                {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
                <Button type="submit" size="sm">
                    <Send className="h-4 w-4 mr-2" />
                    Submit Reply
                </Button>
            </div>
        </form>
    );
}

function ReplyCard({ reply, allReplies, user, onReplyAdded }: { reply: Reply, allReplies: Reply[], user: User | null, onReplyAdded: (reply: Reply) => void }) {
    const [showReplyForm, setShowReplyForm] = useState(false);
    
    const childReplies = allReplies.filter(r => r.parentReplyId === reply.replyId);

    return (
        <div className="flex flex-col">
            <div className="flex gap-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold">{reply.repliedByName}</span>
                        <span className="text-muted-foreground text-xs">
                            {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{reply.message}</p>
                    {user && user.type === 'user' && (
                        <Button variant="ghost" size="sm" className="mt-1 -ml-2" onClick={() => setShowReplyForm(!showReplyForm)}>
                            <ReplyIcon className="h-3 w-3 mr-1" />
                            Reply
                        </Button>
                    )}
                </div>
            </div>
            
            <div className="pl-6 border-l ml-3">
                 {showReplyForm && user && user.type === 'user' && (
                    <ReplyForm 
                        postId={reply.postId} 
                        user={user} 
                        parentReplyId={reply.replyId} 
                        onReplyAdded={onReplyAdded}
                        onCancel={() => setShowReplyForm(false)}
                    />
                 )}
                 {childReplies.map(child => (
                    <div key={child.replyId} className="mt-4">
                        <ReplyCard reply={child} allReplies={allReplies} user={user} onReplyAdded={onReplyAdded} />
                    </div>
                 ))}
            </div>
        </div>
    )
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
            const newReplies = [...prevData.replies, newReply];
            return {
                ...prevData,
                replies: newReplies,
                post: { ...prevData.post, replyCount: newReplies.length }
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
    const topLevelReplies = replies.filter(r => !r.parentReplyId);

    return (
        <div className="container mx-auto max-w-2xl px-4 py-6">
            <Button asChild variant="ghost" className="mb-4">
              <Link href="/app/feed"><ArrowLeft />Back to Feed</Link>
            </Button>

            <PostCard post={post} />

            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>{post.replyCount} Replies</CardTitle>
                </CardHeader>
                <CardContent>
                    {replies.length > 0 ? (
                        <div className="space-y-6">
                            {topLevelReplies.map(reply => (
                                <ReplyCard key={reply.replyId} reply={reply} allReplies={replies} user={user} onReplyAdded={handleReplyAdded} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No replies yet. Be the first to reply!</p>
                    )}
                    <div className="mt-6 pt-6 border-t">
                        <h3 className="text-md font-semibold">Leave a Reply</h3>
                        {user && user.type === 'user' ? (
                           <ReplyForm postId={post.postId} user={user} onReplyAdded={handleReplyAdded} />
                        ) : (
                            <p className="text-sm text-muted-foreground mt-2">You must be logged in to reply.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
