import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-mono font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-cyan-600 text-white shadow hover:bg-cyan-500",
        secondary:
          "border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800",
        destructive:
          "border-transparent bg-rose-950 text-rose-400 border border-rose-800/60 shadow",
        outline: "border-slate-800 text-slate-400",
        cyan: "border-cyan-800/60 bg-cyan-950/80 text-cyan-300",
        emerald: "border-emerald-800/60 bg-emerald-950/80 text-emerald-300",
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
