import { NextRequest, NextResponse } from "next/server";

import { deleteSession, SESSION_COOKIE } from "@/lib/auth";
import { rejectCrossOrigin } from "@/lib/http";

export async function POST(request: NextRequest) {
  const originError = rejectCrossOrigin(request);
  if (originError) return originError;

  await deleteSession(request.cookies.get(SESSION_COOKIE)?.value);

  const response = NextResponse.json({ message: "Signed out" });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
