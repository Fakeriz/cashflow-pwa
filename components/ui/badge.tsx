import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 whitespace-nowrap",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold",
        secondary:
          "border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300",
        destructive:
          "border-zinc-400 dark:border-zinc-700 bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 font-medium",
        outline: "text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-800",
        success:
          "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 font-bold",
        warning:
          "border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200",
        info:
          "border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
