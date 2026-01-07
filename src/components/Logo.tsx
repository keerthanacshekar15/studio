import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

const CustomLogoIcon = ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-8 w-8", className)}
    >
      {/* Magnifying glass */}
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      
      {/* Building inside */}
      <path d="M9 14v-4h4v4"></path>
      <path d="M9 14l2-2l2 2"></path>
      <path d="M12 10V8"></path>
    </svg>
  );

export function Logo({ className, textClassName }: { className?: string; textClassName?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <Sparkles className="absolute -top-1 -left-1 h-4 w-4 text-accent" />
        <CustomLogoIcon className="text-primary" />
      </div>
      <span className={cn("text-2xl font-bold tracking-tight text-foreground", textClassName)}>
        CampusFind
      </span>
    </div>
  );
}
