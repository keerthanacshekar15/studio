
'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getNotifications } from "@/lib/data";
import type { Notification } from "@/lib/types";
import { Logo } from "@/components/Logo";
import { Bell, MessageSquare, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function NotificationsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && user.type === 'user') {
      setIsLoading(true);
      getNotifications(user.userId).then(data => {
        setNotifications(data);
        setIsLoading(false);
      });
    } else if (!isAuthLoading) {
      setIsLoading(false);
    }
  }, [user, isAuthLoading]);

  const getIcon = (type: Notification['type']) => {
    switch(type) {
        case 'reply': return <MessageSquare className="h-5 w-5 text-blue-500" />;
        case 'message': return <MessageSquare className="h-5 w-5 text-purple-500" />;
        case 'approval': return <CheckCircle className="h-5 w-5 text-green-500" />;
        default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <header className="flex items-center justify-between mb-6">
        <Logo />
      </header>
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      
      {isLoading || isAuthLoading ? (
        <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
        </div>
      ) : notifications.length > 0 ? (
        <Card>
            <CardContent className="p-0">
                <div className="divide-y">
                {notifications.map((notif) => (
                    <Link href={notif.link} key={notif.notificationId} className="block hover:bg-muted/50">
                        <div className={cn("p-4 flex items-start gap-4", !notif.readStatus && "bg-primary/5")}>
                            <div className="flex-shrink-0 pt-0.5">{getIcon(notif.type)}</div>
                            <div className="flex-1">
                                <p className="text-sm">{notif.content}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                </p>
                            </div>
                            {!notif.readStatus && <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
                        </div>
                    </Link>
                ))}
                </div>
            </CardContent>
        </Card>
      ) : (
        <div className="text-center py-20 border-dashed border-2 rounded-lg">
          <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-medium">No Notifications</h2>
          <p className="text-muted-foreground">
            Updates and alerts will show up here.
          </p>
        </div>
      )}
    </div>
  );
}
