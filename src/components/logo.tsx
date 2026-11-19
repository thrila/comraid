import { cn } from "@/lib/utils";

/** Placeholder text wordmark. Swap the contents for a real logo when the brand is settled. */
const Logo = ({ className }: { className?: string }) => (
  <span className={cn("font-black tracking-[0.25em] leading-none select-none", className)}>
    SHOP
  </span>
);

export default Logo;
