import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

export function Logo({ className, textClassName }: { className?: string; textClassName?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Sparkles className="h-8 w-8 text-primary" />
      <span className={cn("text-2xl font-bold tracking-tight text-foreground", textClassName)}>
        CampusFind
      </span>
    </div>
  );
}
