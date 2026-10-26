import { CircleAlert, CircleCheck } from "lucide-react";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "error" | "success";
};

export function Alert({ className, variant = "error", children, ...props }: AlertProps) {
  const Icon = variant === "success" ? CircleCheck : CircleAlert;

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm",
        variant === "error"
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-800",
        className,
      )}
      {...props}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
