"use client";

import { ArrowRight, Check, CircleHelp, LoaderCircle, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { meetsPasswordRequirements, PASSWORD_REQUIREMENTS } from "@/lib/password";

type AuthMode = "login" | "register";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const isRegister = mode === "register";
  const passwordsMatch = password === confirmPassword;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const body = Object.fromEntries(formData.entries());

    if (isRegister) {
      if (!meetsPasswordRequirements(password)) {
        setError("Your password does not meet all of the requirements.");
        setIsSubmitting(false);
        return;
      }

      if (!passwordsMatch) {
        setError("The passwords do not match.");
        setIsSubmitting(false);
        return;
      }

      delete body.confirmPassword;
    }

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(result.message ?? "Unable to continue. Please try again.");
        return;
      }

      router.push("/tasks");
      router.refresh();
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error ? <Alert>{error}</Alert> : null}

      {isRegister ? (
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" autoComplete="name" placeholder="Alex Morgan" required />
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email">Work email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="alex@company.com"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="password">Password</Label>
            {isRegister ? (
              <details className="group relative">
                <summary className="flex size-5 cursor-pointer list-none items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 [&::-webkit-details-marker]:hidden">
                  <CircleHelp className="size-4" />
                  <span className="sr-only">Show password requirements</span>
                </summary>
                <div className="absolute left-0 top-7 z-20 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                  <p className="mb-2 text-xs font-semibold text-slate-700">Password requirements</p>
                  <ul className="space-y-1.5">
                    {PASSWORD_REQUIREMENTS.map((requirement) => {
                      const isMet = requirement.test(password);
                      const Icon = isMet ? Check : X;

                      return (
                        <li
                          className={isMet ? "flex gap-2 text-xs text-emerald-700" : "flex gap-2 text-xs text-slate-500"}
                          key={requirement.label}
                        >
                          <Icon className="mt-0.5 size-3.5 shrink-0" />
                          {requirement.label}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </details>
            ) : null}
          </div>
          {isRegister ? <span className="text-xs text-slate-400">Use a strong password</span> : null}
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={isRegister ? "new-password" : "current-password"}
          minLength={isRegister ? 8 : undefined}
          maxLength={72}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-describedby={isRegister ? "password-guidance" : undefined}
          required
        />
        {isRegister ? (
          <p id="password-guidance" className="text-xs text-slate-400">
            Use uppercase, lowercase, a number, and a special character. Spaces are not allowed.
          </p>
        ) : null}
      </div>

      {isRegister ? (
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm password</Label>
          <Input
            id="confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            maxLength={72}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            aria-invalid={confirmPassword.length > 0 && !passwordsMatch}
            aria-describedby="confirm-password-message"
            required
          />
          <p
            id="confirm-password-message"
            className={confirmPassword.length > 0 && !passwordsMatch ? "text-xs text-red-600" : "sr-only"}
          >
            Passwords do not match.
          </p>
        </div>
      ) : null}

      <Button className="h-11 w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <>
            {isRegister ? "Create account" : "Sign in"}
            <ArrowRight className="size-4" />
          </>
        )}
      </Button>

      <p className="text-center text-sm text-slate-500">
        {isRegister ? "Already have an account?" : "New to the portal?"}{" "}
        <Link
          className="font-semibold text-slate-900 underline-offset-4 hover:underline"
          href={isRegister ? "/login" : "/signup"}
        >
          {isRegister ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
