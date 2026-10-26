import { compare } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

import {
  createSession,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";
import { apiError, rejectCrossOrigin } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const originError = rejectCrossOrigin(request);
  if (originError) return originError;

  try {
    const input = loginSchema.parse(await request.json());
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true, passwordHash: true },
    });

    const passwordIsValid = user
      ? await compare(input.password, user.passwordHash)
      : false;

    if (!user || !passwordIsValid) {
      return NextResponse.json(
        { message: "Email or password is incorrect" },
        { status: 401 },
      );
    }

    const session = await createSession(user.id);
    const response = NextResponse.json({ message: "Signed in" });
    response.cookies.set(
      SESSION_COOKIE,
      session.token,
      sessionCookieOptions(session.expiresAt),
    );

    return response;
  } catch (error) {
    return apiError(error);
  }
}
