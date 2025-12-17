import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Width = "lg" | "xl" | "2xl";

const widthMap: Record<Width, string> = {
  lg: "max-w-4xl",
  xl: "max-w-6xl",
  "2xl": "max-w-7xl",
};

type PageShellProps = {
  children: ReactNode;
  className?: string;
  width?: Width;
  padded?: boolean;
};

export function PageShell({
  children,
  className,
  width = "xl",
  padded = true,
}: PageShellProps) {
  return (
    <div
      className={cn(
        "mx-auto",
        widthMap[width],
        padded ? "px-4 sm:px-6 lg:px-8" : "",
        className,
      )}
    >
      {children}
    </div>
  );
}

type SectionHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeader({
  title,
  description,
  eyebrow,
  actions,
  align = "left",
  className,
}: SectionHeaderProps) {
  const textAlign = align === "center" ? "text-center items-center" : "text-left";
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className={cn("flex flex-col gap-1", textAlign)}>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-widest text-primary/80">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        {description ? <p className="text-sm text-slate-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

type DashboardShellProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  width?: Width;
};

export function DashboardShell({
  title,
  description,
  actions,
  children,
  width = "xl",
}: DashboardShellProps) {
  return (
    <div className="bg-slate-50">
      <PageShell width={width} className="py-10 space-y-8">
        <SectionHeader title={title} description={description} actions={actions} />
        {children}
      </PageShell>
    </div>
  );
}

