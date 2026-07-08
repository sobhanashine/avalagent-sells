import { cn } from "@/lib/cn";

export function Skeleton({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md bg-[var(--muted)] relative overflow-hidden",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:animate-[shimmer_1.6s_infinite]",
        className
      )}
      style={{
        backgroundImage:
          "linear-gradient(90deg, var(--muted) 0%, color-mix(in oklab, var(--muted) 60%, var(--foreground) 8%) 50%, var(--muted) 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.6s linear infinite",
      }}
      {...rest}
    />
  );
}
