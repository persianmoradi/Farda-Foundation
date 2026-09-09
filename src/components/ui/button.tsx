import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "btn-fill glass-base inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-[color,border-color,box-shadow] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary px-5 py-3 text-sm text-primary-foreground [--btn-fill:var(--surface-dark)] hover:text-background focus-visible:text-background",
        primary: "bg-primary px-5 py-3 text-sm text-primary-foreground [--btn-fill:var(--surface-dark)] hover:text-background hover:shadow-lg focus-visible:text-background",
        destructive: "bg-destructive px-5 py-3 text-sm text-destructive-foreground [--btn-fill:var(--surface-dark)]",
        outline: "glass-light border-transparent bg-transparent px-5 py-3 text-sm [--btn-fill:var(--accent)] hover:text-accent-foreground focus-visible:text-accent-foreground",
        secondary: "glass-light border-transparent bg-transparent px-5 py-3 text-sm text-secondary-foreground [--btn-fill:var(--accent)] hover:text-accent-foreground focus-visible:text-accent-foreground",
        ghost: "glass-light border-transparent px-3 py-2 text-sm [--btn-fill:var(--accent)] hover:text-accent-foreground focus-visible:text-accent-foreground",
        link: "btn-fill-none px-1 py-2 text-sm text-primary underline-offset-4 hover:underline",
        icon: "btn-fill-radial glass-dark border-transparent size-11 bg-transparent [--btn-fill:var(--primary)] hover:text-primary-foreground focus-visible:text-primary-foreground",
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
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };