'use client';
import { BottomNav } from "@/components/app/BottomNav";
import { useAuth } from "@/context/auth-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      <main className="pb-20 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
