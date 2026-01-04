import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

export function Logo({ className, textClassName }: { className?: string; textClassName?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Sparkles className="h-6 w-6 text-primary" />
      <span className={cn("text-xl font-bold tracking-tight text-foreground", textClassName)}>
        CampusFind
      </span>
    </div>
  );
}
