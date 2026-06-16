import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  detail: string;
}

export function StatCard({ label, value, icon: Icon, detail }: StatCardProps) {
  return (
    <Card className="orbit-shell overflow-hidden">
      <CardContent className="p-5">
        <div className="mb-5 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="flex size-9 items-center justify-center rounded-md bg-white/10 text-primary">
            <Icon className="size-4" />
          </span>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-semibold tracking-normal">{value}</p>
          <p className="text-xs text-muted-foreground">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}
