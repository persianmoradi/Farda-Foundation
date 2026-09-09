import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "farda-button inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-none border font-medium transition-[color,border-color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "glass-light border-white/20 px-5 py-3 text-sm text-foreground",
        primary: "glass-light border-white/20 px-5 py-3 text-sm text-foreground",
        destructive: "glass-dark border-white/20 px-5 py-3 text-sm text-primary-foreground",
        outline: "glass-light border-white/20 px-5 py-3 text-sm text-foreground",
        secondary: "glass-light border-white/20 px-5 py-3 text-sm text-secondary-foreground",
        ghost: "glass-light border-white/20 px-3 py-2 text-sm",
        link: "glass-light border-white/20 px-3 py-2 text-sm text-primary",
        icon: "farda-button-icon glass-dark border-white/20 size-11 bg-transparent focus-visible:border-ring",
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
