import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/tasks");

  return (
    <div className="w-full">
      <p className="mb-3 text-sm font-semibold text-blue-700">Welcome back</p>
      <h1 className="text-3xl font-bold tracking-tight text-slate-950">Sign in to your workspace</h1>
      <p className="mb-8 mt-3 text-sm leading-6 text-slate-500">
        Enter your account details to manage your tasks.
      </p>
      <AuthForm mode="login" />
    </div>
  );
}
