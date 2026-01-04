'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
       <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-6 w-full max-w-sm mx-auto" />
            <div className="space-y-4 pt-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <Logo className="justify-center mb-2" />
            <CardTitle className="text-2xl font-bold">Welcome to CampusFind</CardTitle>
            <CardDescription>Your college's lost and found hub.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full" size="lg">
              <Link href="/signup/user">
                User Signup
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild className="w-full" variant="secondary" size="lg">
              <Link href="/signup/admin">
                Admin Signup
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
