import { CheckCheck } from "lucide-react";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
        <CheckCheck className="size-5" strokeWidth={2.25} />
      </span>
      {compact ? null : (
        <div>
          <p className="text-sm font-bold tracking-tight text-slate-950">Nexus AML</p>
          <p className="text-xs text-slate-500">Internal Task Portal</p>
        </div>
      )}
    </div>
  );
}
