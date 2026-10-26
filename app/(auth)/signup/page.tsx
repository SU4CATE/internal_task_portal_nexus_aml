import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Create account" };

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/tasks");

  return (
    <div className="w-full">
      <p className="mb-3 text-sm font-semibold text-blue-700">Get started</p>
      <h1 className="text-3xl font-bold tracking-tight text-slate-950">Create your account</h1>
      <p className="mb-8 mt-3 text-sm leading-6 text-slate-500">
        Set up secure access to your internal task workspace.
      </p>
      <AuthForm mode="register" />
    </div>
  );
}
