import type { ReactNode } from "react";
import { PageShell } from "./Shell";
import { Card } from "@/components/ui/card";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthShell({ title, subtitle, badge, children, footer }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <PageShell width="lg" padded>
        <div className="mx-auto max-w-md py-12">
          <Card className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
            <div className="flex flex-col gap-2 border-b border-slate-200 pb-4">
              {badge ? (
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">{badge}</p>
              ) : null}
              <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
              {subtitle ? <p className="text-sm text-slate-600">{subtitle}</p> : null}
            </div>
            <div className="mt-6 space-y-4">{children}</div>
            {footer ? <div className="mt-6 text-sm text-slate-600">{footer}</div> : null}
          </Card>
        </div>
      </PageShell>
    </div>
  );
}

