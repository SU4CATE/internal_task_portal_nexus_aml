"use client";

import { LoaderCircle } from "lucide-react";
import { useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Task } from "@/lib/types";

type DeleteTaskDialogProps = {
  task: Task | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: (taskId: number) => void;
};

export function DeleteTaskDialog({ task, onOpenChange, onDeleted }: DeleteTaskDialogProps) {
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  async function deleteTask() {
    if (!task) return;
    setError("");
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      if (!response.ok) {
        const result = (await response.json()) as { message?: string };
        setError(result.message ?? "Unable to delete this task.");
        return;
      }

      onDeleted(task.id);
      onOpenChange(false);
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={Boolean(task)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete task?</DialogTitle>
          <DialogDescription>
            “{task?.title}” will be permanently removed. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {error ? <Alert className="mb-4">{error}</Alert> : null}
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteTask} disabled={isDeleting}>
            {isDeleting ? <LoaderCircle className="size-4 animate-spin" /> : null}
            Delete task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
