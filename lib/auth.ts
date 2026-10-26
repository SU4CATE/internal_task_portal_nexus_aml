import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, SESSION_DURATION_SECONDS } from "@/lib/session";
import type { CurrentUser } from "@/lib/types";

export { SESSION_COOKIE } from "@/lib/session";

function hashToken(token: string) {
  // A database leak should not expose a session token that can be reused directly.
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: number) {
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_SECONDS * 1000);

  await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      expiresAt,
      createdAt: now,
    },
  });

  return { token, expiresAt };
}

export async function deleteSession(token: string | undefined) {
  if (!token) return;
  await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
}

export async function findUserBySessionToken(
  token: string | undefined,
): Promise<CurrentUser | null> {
  if (!token) return null;

  const session = await prisma.session.findFirst({
    where: {
      tokenHash: hashToken(token),
      expiresAt: { gt: new Date() },
    },
    select: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return session?.user ?? null;
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  return await findUserBySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

export function sessionCookieOptions(expires: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires,
  };
}
