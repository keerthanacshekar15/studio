
'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { getChatsForUser } from "@/lib/server-actions";
import type { Chat } from "@/lib/types";
import { Logo } from "@/components/Logo";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";

export default function MessagesPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && user.type === 'user') {
      setIsLoading(true);
      getChatsForUser(user.userId).then(data => {
        setChats(data);
        setIsLoading(false);
      });
    } else if (!isAuthLoading) {
        setIsLoading(false);
    }
  }, [user, isAuthLoading]);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <header className="flex items-center justify-between mb-6">
        <Logo />
      </header>
       <h1 className="text-2xl font-bold mb-4">Messages</h1>
      
      {isLoading || isAuthLoading ? (
         <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
        </div>
      ) : chats.length > 0 ? (
        <Card>
            <CardContent className="p-0">
                <div className="divide-y">
                    {chats.map(chat => {
                        const otherUser = user?.type === 'user' && chat.userAId === user.userId ? chat.userBName : chat.userAName;
                        const lastMessage = chat.messages.at(-1);
                        return (
                            <Link href={`/app/chat/${chat.postId}`} key={chat.chatId} className="block hover:bg-muted/50">
                                <div className="p-4">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold">{otherUser}</p>
                                        {lastMessage && (
                                            <p className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(lastMessage.timestamp), { addSuffix: true })}
                                            </p>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {lastMessage ? `${lastMessage.senderName}: ${lastMessage.text}` : 'No messages yet...'}
                                    </p>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
      ) : (
        <div className="text-center py-20 border-dashed border-2 rounded-lg">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-medium">Your Messages</h2>
            <p className="text-muted-foreground">
            Private chats from your posts will appear here.
            </p>
        </div>
      )}
    </div>
  );
}
