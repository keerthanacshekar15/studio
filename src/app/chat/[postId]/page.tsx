
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { Chat, Message, Post, User } from '@/lib/types';
import { getChat, addMessage } from '@/lib/server-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function ChatPage({ params }: { params: { postId: string } }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [chatData, setChatData] = useState<{ chat: Chat; post: Post } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && user.type === 'user') {
      getChat(params.postId, user).then(data => {
        setChatData(data as { chat: Chat; post: Post });
        setIsLoading(false);
      });
    } else if (!isAuthLoading) {
      setIsLoading(false);
    }
  }, [params.postId, user, isAuthLoading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatData?.chat.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || user.type !== 'user' || !chatData) return;

    const tempMessageId = `temp-${Date.now()}`;
    const sentMessage: Message = {
      messageId: tempMessageId,
      chatId: chatData.chat.chatId,
      senderId: user.userId,
      senderName: user.fullName,
      text: newMessage,
      timestamp: Date.now(),
    };

    setChatData(prev => prev ? ({ ...prev, chat: { ...prev.chat, messages: [...prev.chat.messages, sentMessage] }}) : null);
    setNewMessage('');

    const savedMessage = await addMessage(chatData.chat.chatId, newMessage, user);

    setChatData(prev => {
        if (!prev) return null;
        const newMessages = prev.chat.messages.map(m => m.messageId === tempMessageId ? savedMessage : m);
        return { ...prev, chat: { ...prev.chat, messages: newMessages } };
    });
  };

  if (isLoading || isAuthLoading) {
    return (
        <div className="flex flex-col h-screen">
            <header className="p-4 border-b">
                <Skeleton className="h-8 w-1/2" />
            </header>
            <div className="flex-1 p-4 space-y-4">
                <Skeleton className="h-12 w-3/4 self-start" />
                <Skeleton className="h-12 w-3/4 self-end" />
                <Skeleton className="h-12 w-3/4 self-start" />
            </div>
            <footer className="p-4 border-t">
                <Skeleton className="h-10 w-full" />
            </footer>
        </div>
    )
  }

  if (!user || user.type !== 'user') {
    return <div className="text-center py-10">You must be logged in to chat.</div>;
  }
  
  if (!chatData) {
    return <div className="text-center py-10">Chat not found or you do not have permission.</div>;
  }

  const { chat, post } = chatData;
  const otherUser = user.userId === chat.userAId ? 
    { id: chat.userBId, name: chat.userBName } : 
    { id: chat.userAId, name: chat.userAName };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-card">
      <header className="flex items-center gap-4 p-3 border-b sticky top-0 bg-background/95 z-10">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/app/post/${post.postId}`}><ArrowLeft /></Link>
        </Button>
        <Avatar>
          <AvatarImage src={`https://i.pravatar.cc/150?u=${otherUser.id}`} />
          <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold">{otherUser.name}</p>
          <p className="text-xs text-muted-foreground">Regarding: {post.title}</p>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat.messages.map((message) => (
          <div
            key={message.messageId}
            className={cn('flex items-end gap-2', message.senderId === user.userId ? 'justify-end' : 'justify-start')}
          >
            {message.senderId !== user.userId && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://i.pravatar.cc/150?u=${message.senderId}`} />
                <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
            <div
              className={cn(
                'max-w-xs md:max-w-md rounded-lg px-3 py-2 text-sm',
                message.senderId === user.userId
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              )}
            >
              <p>{message.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      <footer className="p-2 border-t sticky bottom-0 bg-background">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            autoComplete="off"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </footer>
    </div>
  );
}
