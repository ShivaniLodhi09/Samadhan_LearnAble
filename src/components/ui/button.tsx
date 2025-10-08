import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 shadow-lg",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:scale-105",
        outline: "border-2 border-border bg-background hover:bg-accent hover:text-accent-foreground hover:scale-102",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-102",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:scale-102",
        link: "text-primary underline-offset-4 hover:underline hover:scale-105",

        // LearnAble specific variants
        adaptive: "bg-gradient-to-r from-mint-soft to-mint text-white hover:scale-110 shadow-lg hover:shadow-adaptive font-semibold",
        emotional: "bg-gradient-emotional text-white hover:scale-105 shadow-lg animate-gradient-shift",
        pastel: "bg-gradient-secondary text-white hover:scale-105 shadow-soft",
        accessibility: "bg-gradient-to-r from-mint-soft to-mint text-white hover:scale-105 font-bold border-2 border-transparent focus:border-ring",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
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
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
