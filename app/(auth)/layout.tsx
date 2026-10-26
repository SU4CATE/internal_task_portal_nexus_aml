import { ShieldCheck } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[minmax(360px,0.9fr)_1.1fr]">
      <section className="flex min-h-screen flex-col bg-white px-6 py-6 sm:px-10 lg:px-16">
        <BrandMark />
        <div className="mx-auto flex w-full max-w-md flex-1 items-center py-12">{children}</div>
        <p className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="size-4" /> Secure access for authorised personnel
        </p>
      </section>

      <aside className="relative hidden overflow-hidden bg-slate-950 p-16 text-white lg:flex lg:flex-col lg:justify-end">
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_25%_20%,#0ea5e9_0,transparent_28%),radial-gradient(circle_at_75%_70%,#14b8a6_0,transparent_30%)]" />
        <div className="absolute right-16 top-16 grid grid-cols-6 gap-3 opacity-20" aria-hidden="true">
          {Array.from({ length: 24 }).map((_, index) => (
            <span className="size-1 rounded-full bg-white" key={index} />
          ))}
        </div>
        <div className="relative max-w-lg">
          <span className="mb-6 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
            Operations workspace
          </span>
          <h2 className="text-4xl font-semibold leading-tight tracking-tight">
            Keep work visible, accountable, and moving forward.
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-slate-300">
            A focused workspace for teams to organise tasks and track progress without unnecessary complexity.
          </p>
        </div>
      </aside>
    </main>
  );
}
