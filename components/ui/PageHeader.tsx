import { cn } from "@/lib/cn";

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 flex-wrap mb-6",
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
          {title}
        </h1>
        {description ? (
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
