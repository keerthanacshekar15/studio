import { cn } from "@/lib/utils";

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
      <circle cx="10" cy="10" r="7"></circle>
      <line x1="15" y1="15" x2="20" y2="20"></line>
      
      {/* Smaller Building inside */}
      <path d="M8 12h4v-2h-4z"></path>
      <path d="M8 12l2-2l2 2"></path>
      <path d="M10 10V9"></path>
    </svg>
  );

export function Logo({ className, textClassName }: { className?: string; textClassName?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <CustomLogoIcon className="text-primary" />
      <span className={cn("text-2xl font-bold tracking-tight text-foreground", textClassName)}>
        CampusFind
      </span>
    </div>
  );
}
