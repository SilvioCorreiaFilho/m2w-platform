import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-accent-primary/30 bg-accent-primary/15 text-accent-glow",
        secondary:
          "border-white/10 bg-white/5 text-text-muted",
        success:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        destructive:
          "border-red-500/30 bg-red-500/10 text-red-400",
        outline:
          "border-glass-border text-text-muted",
        tiktok:
          "border-[#ff0050]/30 bg-[#ff0050]/10 text-[#ff6b8a]",
        fanvue:
          "border-[#ff6b35]/30 bg-[#ff6b35]/10 text-[#ff8c5a]",
        b2b:
          "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
