import { NextRequest, NextResponse } from "next/server";

import { findUserBySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { apiError, rejectCrossOrigin } from "@/lib/http";
import { deleteTask, updateTask } from "@/lib/tasks";
import { updateTaskSchema } from "@/lib/validation";

type RouteContext = { params: Promise<{ taskId: string }> };

function authenticate(request: NextRequest) {
  return findUserBySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
}

function parseTaskId(value: string) {
  const taskId = Number(value);
  return Number.isInteger(taskId) && taskId > 0 ? taskId : null;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const originError = rejectCrossOrigin(request);
  if (originError) return originError;

  const user = await authenticate(request);
  if (!user) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  const taskId = parseTaskId((await context.params).taskId);
  if (!taskId) {
    return NextResponse.json({ message: "Invalid task ID" }, { status: 400 });
  }

  try {
    const input = updateTaskSchema.parse(await request.json());
    const task = await updateTask(user.id, taskId, input);

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const originError = rejectCrossOrigin(request);
  if (originError) return originError;

  const user = await authenticate(request);
  if (!user) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  const taskId = parseTaskId((await context.params).taskId);
  if (!taskId) {
    return NextResponse.json({ message: "Invalid task ID" }, { status: 400 });
  }

  if (!(await deleteTask(user.id, taskId))) {
    return NextResponse.json({ message: "Task not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
