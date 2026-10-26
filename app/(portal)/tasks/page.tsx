import type { Metadata } from "next";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { TaskManager } from "@/components/task-manager";
import { getCurrentUser } from "@/lib/auth";
import { listTasks } from "@/lib/tasks";

export const metadata: Metadata = { title: "Tasks" };

export default async function TasksPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tasks = await listTasks(user.id);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-7 flex items-center gap-2 text-xs text-slate-500">
        <Link href="/tasks" className="rounded-sm transition hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400">
          <Home className="size-3.5" />
          <span className="sr-only">Home</span>
        </Link>
        <ChevronRight className="size-3.5 text-slate-300" />
        <span className="font-medium text-slate-700" aria-current="page">Tasks</span>
      </nav>
      <TaskManager initialTasks={tasks} />
    </main>
  );
}
