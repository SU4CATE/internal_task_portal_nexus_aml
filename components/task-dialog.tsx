"use client";

import { LoaderCircle } from "lucide-react";
import { FormEvent, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { taskStatusLabels, TASK_STATUSES, type Task } from "@/lib/types";

type TaskDialogProps = {
  open: boolean;
  task: Task | null;
  onOpenChange: (open: boolean) => void;
  onSaved: (task: Task) => void;
};

export function TaskDialog({ open, task, onOpenChange, onSaved }: TaskDialogProps) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) setError("");
    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const body = Object.fromEntries(formData.entries());
    const url = task ? `/api/tasks/${task.id}` : "/api/tasks";

    try {
      const response = await fetch(url, {
        method: task ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = (await response.json()) as { task?: Task; message?: string };

      if (!response.ok || !result.task) {
        setError(result.message ?? "Unable to save this task.");
        return;
      }

      onSaved(result.task);
      handleOpenChange(false);
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? "Edit task" : "Create a new task"}</DialogTitle>
          <DialogDescription>
            {task ? "Update the task details or current status." : "Add a clear title and any useful context."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" key={task?.id ?? "new"} onSubmit={handleSubmit}>
          {error ? <Alert>{error}</Alert> : null}

          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              name="title"
              defaultValue={task?.title}
              placeholder="e.g. Review onboarding checks"
              maxLength={120}
              autoFocus
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              name="description"
              defaultValue={task?.description}
              placeholder="Add context, requirements, or next steps..."
              maxLength={1000}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-status">Status</Label>
            <Select
              id="task-status"
              name="status"
              defaultValue={task?.status ?? "todo"}
            >
              {TASK_STATUSES.map((status) => (
                <option value={status} key={status}>
                  {taskStatusLabels[status]}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
              {task ? "Save changes" : "Create task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
