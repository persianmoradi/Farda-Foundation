import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "farda-button inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-none border-0 font-medium transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-0 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "px-5 py-3 text-sm text-foreground",
        primary: "px-5 py-3 text-sm text-foreground",
        destructive: "text-sm text-primary-foreground",
        outline: "px-5 py-3 text-sm text-foreground",
        secondary: "px-5 py-3 text-sm text-secondary-foreground",
        ghost: "px-3 py-2 text-sm",
        link: "px-3 py-2 text-sm text-primary",
        icon: "farda-button-icon size-11 bg-transparent focus-visible:border-ring",
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
