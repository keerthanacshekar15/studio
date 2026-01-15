
import { cn } from "@/lib/utils";
import { Sparkles, Search } from 'lucide-react';

export function Logo({ className, textClassName }: { className?: string; textClassName?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <Search className="h-8 w-8 text-primary" />
        <Sparkles className="h-4 w-4 text-primary absolute -top-1.5 -left-1.5" />
      </div>
      <span className={cn("text-2xl font-bold tracking-tight text-foreground", textClassName)}>
        CampusFind
      </span>
    </div>
  );
}
