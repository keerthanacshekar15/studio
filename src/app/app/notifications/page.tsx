import { getNotifications } from "@/lib/data";
import { Logo } from "@/components/Logo";
import { Bell, MessageSquare, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';

export default async function NotificationsPage() {
  // In a real app, you'd get the userId from the session
  const notifications = await getNotifications('user-001-approved');

  const getIcon = (type: 'reply' | 'message' | 'approval' | 'rejection') => {
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
      
      {notifications.length > 0 ? (
        <Card>
            <CardContent className="p-0">
                <div className="divide-y">
                {notifications.map((notif, index) => (
                    <div key={notif.notificationId} className={cn("p-4 flex items-start gap-4", !notif.readStatus && "bg-primary/5")}>
                        <div className="flex-shrink-0">{getIcon(notif.type)}</div>
                        <div className="flex-1">
                            <p className="text-sm">{notif.content}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                            </p>
                        </div>
                        {!notif.readStatus && <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
                    </div>
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
