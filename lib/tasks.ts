import type { Task as PrismaTask } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { Task, TaskStatus } from "@/lib/types";

function toTask(row: PrismaTask): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status as TaskStatus,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listTasks(userId: number) {
  const rows = await prisma.task.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  return rows.map(toTask);
}

export async function createTask(
  userId: number,
  input: { title: string; description: string; status: TaskStatus },
) {
  const task = await prisma.task.create({
    data: { userId, ...input },
  });

  return toTask(task);
}

export async function findTask(userId: number, taskId: number) {
  // Scoping by owner here keeps every caller from having to remember the access check.
  const row = await prisma.task.findFirst({
    where: { id: taskId, userId },
  });

  return row ? toTask(row) : null;
}

export async function updateTask(
  userId: number,
  taskId: number,
  input: Partial<{ title: string; description: string; status: TaskStatus }>,
) {
  const result = await prisma.task.updateMany({
    where: { id: taskId, userId },
    data: input,
  });

  return result.count > 0 ? findTask(userId, taskId) : null;
}

export async function deleteTask(userId: number, taskId: number) {
  const result = await prisma.task.deleteMany({
    where: { id: taskId, userId },
  });

  return result.count > 0;
}
