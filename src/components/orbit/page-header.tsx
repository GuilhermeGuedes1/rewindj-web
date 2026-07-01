import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-3">
        {eyebrow ? (
          <Badge
            variant="outline"
            className="w-fit px-4 py-1.5 text-base font-semibold">
            {eyebrow}
          </Badge>
        ) : null}

        <div className="space-y-2">
          <h1 className="text-3xl font-semibold leading-tight tracking-normal text-orbit-silver sm:text-4xl">
            {title}
          </h1>

          {description ? (
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
