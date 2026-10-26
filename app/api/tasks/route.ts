import { NextRequest, NextResponse } from "next/server";

import { findUserBySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { apiError, rejectCrossOrigin } from "@/lib/http";
import { createTask, listTasks } from "@/lib/tasks";
import { createTaskSchema } from "@/lib/validation";

function authenticate(request: NextRequest) {
  return findUserBySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
}

export async function GET(request: NextRequest) {
  const user = await authenticate(request);
  if (!user) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  return NextResponse.json({ tasks: await listTasks(user.id) });
}

export async function POST(request: NextRequest) {
  const originError = rejectCrossOrigin(request);
  if (originError) return originError;

  const user = await authenticate(request);
  if (!user) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  try {
    const input = createTaskSchema.parse(await request.json());
    const task = await createTask(user.id, input);
    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
