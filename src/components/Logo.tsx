import { cn } from "@/lib/utils";
import { Search, Sparkles } from "lucide-react";

export function Logo({ className, textClassName }: { className?: string; textClassName?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <Sparkles className="absolute -top-2 -left-2 h-4 w-4 text-accent" />
        <Search className="h-8 w-8 text-primary" />
      </div>
      <span className={cn("text-2xl font-bold tracking-tight text-foreground", textClassName)}>
        CampusFind
      </span>
    </div>
  );
}
