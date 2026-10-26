"use client";

import {
  CheckCircle2,
  CircleDashed,
  ClipboardList,
  ListTodo,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

import { DeleteTaskDialog } from "@/components/delete-task-dialog";
import { TaskDialog } from "@/components/task-dialog";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import {
  taskStatusLabels,
  TASK_STATUSES,
  type Task,
  type TaskStatus,
} from "@/lib/types";

const badgeVariant: Record<TaskStatus, "neutral" | "info" | "success"> = {
  todo: "neutral",
  in_progress: "info",
  completed: "success",
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function TaskManager({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const counts = useMemo(
    () => ({
      all: tasks.length,
      active: tasks.filter((task) => task.status !== "completed").length,
      completed: tasks.filter((task) => task.status === "completed").length,
    }),
    [tasks],
  );

  function openCreateDialog() {
    setEditingTask(null);
    setTaskDialogOpen(true);
  }

  function openEditDialog(task: Task) {
    setEditingTask(task);
    setTaskDialogOpen(true);
  }

  function saveTask(savedTask: Task) {
    setTasks((current) => {
      const exists = current.some((task) => task.id === savedTask.id);
      return exists
        ? current.map((task) => (task.id === savedTask.id ? savedTask : task))
        : [savedTask, ...current];
    });
  }

  async function changeStatus(task: Task, status: TaskStatus) {
    setError("");
    setUpdatingId(task.id);

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = (await response.json()) as { task?: Task; message?: string };

      if (!response.ok || !result.task) {
        setError(result.message ?? "Unable to update the task status.");
        return;
      }

      saveTask(result.task);
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Tasks</h1>
          <p className="mt-2 text-sm text-slate-500">Create, organise, and track your team responsibilities.</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="size-4" /> New task
        </Button>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <SummaryCard label="All tasks" value={counts.all} icon={ClipboardList} />
        <SummaryCard label="Active" value={counts.active} icon={CircleDashed} />
        <SummaryCard label="Completed" value={counts.completed} icon={CheckCircle2} />
      </div>

      {error ? <Alert className="mb-4">{error}</Alert> : null}

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-semibold text-slate-900">Task list</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {tasks.length === 1 ? "1 task" : `${tasks.length} tasks`} in your workspace
            </p>
          </div>
          <MoreHorizontal className="size-5 text-slate-400" aria-hidden="true" />
        </div>

        {tasks.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <ListTodo className="size-6" />
            </span>
            <h3 className="font-semibold text-slate-900">No tasks yet</h3>
            <p className="mb-5 mt-1 max-w-sm text-sm leading-6 text-slate-500">
              Create your first task to start keeping track of work in this workspace.
            </p>
            <Button variant="secondary" onClick={openCreateDialog}>
              <Plus className="size-4" /> Create task
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tasks.map((task) => (
              <article
                className="grid gap-4 px-5 py-5 transition-colors hover:bg-slate-50/70 sm:grid-cols-[minmax(0,1fr)_160px_110px] sm:items-center sm:px-6"
                key={task.id}
              >
                <div className="min-w-0">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-semibold text-slate-900">{task.title}</h3>
                    <Badge variant={badgeVariant[task.status]}>{taskStatusLabels[task.status]}</Badge>
                  </div>
                  <p className="line-clamp-2 text-sm leading-6 text-slate-500">
                    {task.description || "No description provided."}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">Updated {formatDate(task.updatedAt)}</p>
                </div>

                <div>
                  <label className="sr-only" htmlFor={`status-${task.id}`}>
                    Status for {task.title}
                  </label>
                  <Select
                    id={`status-${task.id}`}
                    value={task.status}
                    disabled={updatingId === task.id}
                    onChange={(event) => changeStatus(task, event.target.value as TaskStatus)}
                    className="h-9 rounded-md border-slate-200 pl-2.5 text-slate-700"
                  >
                    {TASK_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {taskStatusLabels[status]}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(task)}
                    aria-label={`Edit ${task.title}`}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-500 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setDeletingTask(task)}
                    aria-label={`Delete ${task.title}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>

      <TaskDialog
        open={taskDialogOpen}
        task={editingTask}
        onOpenChange={setTaskDialogOpen}
        onSaved={saveTask}
      />
      <DeleteTaskDialog
        task={deletingTask}
        onOpenChange={(open) => (open ? undefined : setDeletingTask(null))}
        onDeleted={(taskId) => setTasks((current) => current.filter((task) => task.id !== taskId))}
      />
    </>
  );
}

type SummaryCardProps = {
  label: string;
  value: number;
  icon: typeof ClipboardList;
};

function SummaryCard({ label, value, icon: Icon }: SummaryCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{value}</p>
        </div>
        <span className="flex size-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}
