import { VariantProps, cva } from "class-variance-authority";
import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  href?: string;
}

const buttonVariants = cva(
  "inline-flex items-center justify-center text-sm font-black transition-colors disabled:pointer-events-none disabled:opacity-50 hover:transition-all ease-in duration-300",
  {
    variants: {
      variant: {
        default: "bg-black text-light",
        outline: "bg-transparent border border-black hover:bg-light-grey",
        subtle: "bg-light-grey text-black hover:bg-search/30",
        ghost: "bg-transparent",
        link: "bg-transparent underline-offset-4 hover:underline text-black",
        "item-card":
          "bg-white border-[1px] font-thin tracking-wide hover:bg-red hover:text-light hover:border-light",
      },
      size: {
        default: "py-3 px-8 w-full sm:w-auto sm:min-w-[200px] whitespace-nowrap",
        sm: "h-9 px-3 ",
        lg: "h-11 px-32 w-full",
        card: "md:w-[200px] w-full py-3",
        /** Fills its container (use inside flex rows) */
        block: "w-full py-3 px-3",
        /** Square-ish icon button */
        icon: "w-12 py-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, href, variant, size, ...props }, ref) => {
    if (href) {
      return (
        <Link href={href} className={cn(buttonVariants({ variant, size, className }))}>
          {children}
        </Link>
      );
    }
    return (
      <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
