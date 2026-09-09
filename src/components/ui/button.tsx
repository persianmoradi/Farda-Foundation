import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-none border font-medium transition-[color,border-color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary px-5 py-3 text-sm text-primary-foreground focus-visible:border-ring",
        primary:
          "border-primary bg-primary px-5 py-3 text-sm text-primary-foreground focus-visible:border-ring",
        destructive:
          "border-destructive bg-destructive px-5 py-3 text-sm text-destructive-foreground",
        outline:
          "glass-light border-white/20 bg-transparent px-5 py-3 text-sm text-foreground focus-visible:border-ring",
        secondary:
          "glass-light border-white/20 bg-transparent px-5 py-3 text-sm text-secondary-foreground focus-visible:border-ring",
        ghost: "glass-light border-white/20 px-3 py-2 text-sm focus-visible:border-ring",
        link: "border-transparent px-1 py-2 text-sm text-primary underline-offset-4",
        icon: "glass-dark border-white/20 size-11 bg-transparent focus-visible:border-ring",
      },

      size: {
        default: "h-11",
        sm: "h-9 px-3 text-sm",
        lg: "h-13 px-6",
        icon: "size-11",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
