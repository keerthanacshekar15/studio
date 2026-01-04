import { MessageSquare } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function MessagesPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <header className="flex items-center justify-between mb-6">
        <Logo />
      </header>
      <div className="text-center py-20 border-dashed border-2 rounded-lg">
        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-medium">Your Messages</h2>
        <p className="text-muted-foreground">
          Private chats from your posts will appear here.
        </p>
      </div>
    </div>
  );
}
