import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

import { Prisma } from "@/generated/prisma/client";
import {
  createSession,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";
import { apiError, rejectCrossOrigin } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const originError = rejectCrossOrigin(request);
  if (originError) return originError;

  try {
    const input = registerSchema.parse(await request.json());
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await hash(input.password, 12);
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
      },
      select: { id: true },
    });

    const session = await createSession(user.id);
    const response = NextResponse.json({ message: "Account created" }, { status: 201 });
    response.cookies.set(
      SESSION_COOKIE,
      session.token,
      sessionCookieOptions(session.expiresAt),
    );

    return response;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { message: "An account with this email already exists" },
        { status: 409 },
      );
    }
    return apiError(error);
  }
}
