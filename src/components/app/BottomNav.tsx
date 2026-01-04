
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Bell, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

const allNavItems = [
  { href: '/app/feed', icon: LayoutGrid, label: 'Feed', for: 'user' },
  { href: '/app/notifications', icon: Bell, label: 'Notifications', for: 'user' },
  { href: '/app/admin', icon: Shield, label: 'Admin', for: 'admin' },
];

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const navItems = allNavItems.filter(item => item.for === user.type);

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm md:hidden">
      <nav className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-sm font-medium transition-colors",
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
}
