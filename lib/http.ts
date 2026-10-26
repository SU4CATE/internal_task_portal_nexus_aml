import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export function apiError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { message: error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  console.error(error);
  return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
}

export function hasSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return !origin || origin === request.nextUrl.origin;
}

export function rejectCrossOrigin(request: NextRequest) {
  if (hasSameOrigin(request)) return null;
  return NextResponse.json({ message: "Invalid request origin" }, { status: 403 });
}
