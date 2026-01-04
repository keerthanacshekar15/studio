'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function PendingPage() {
  const { logout, user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto bg-primary/10 text-primary rounded-full p-3 w-fit">
            <Clock className="h-10 w-10" />
          </div>
          <CardTitle className="mt-4 text-2xl">Account Pending Approval</CardTitle>
          <CardDescription>
            Thanks for signing up, {user?.type === 'user' ? user.fullName : 'User'}! Our admins are reviewing your details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3 rounded-lg border bg-card p-4 text-left text-sm">
            <MailCheck className="h-5 w-5 flex-shrink-0 text-primary" />
            <p className="text-muted-foreground">
              You'll be able to access the app as soon as your account is approved. You will receive a notification. You can close this page.
            </p>
          </div>
          <Button variant="outline" className="w-full" onClick={logout}>
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
