
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, LogIn } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/use-auth";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
       <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <p>Loading...</p>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="text-center items-center">
            <Logo />
          </CardHeader>
          <CardContent className="grid gap-4">
             <Button asChild className="w-full" size="lg">
              <Link href="/login">
                User Login
                <LogIn className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                    Or
                    </span>
                </div>
            </div>
             <Button asChild className="w-full" variant="secondary">
              <Link href="/signup/user">
                Create a New Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
          <Separator className="my-4" />
          <CardFooter>
             <Button asChild className="w-full" variant="ghost" size="sm">
              <Link href="/signup/admin">
                Admin Access
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
