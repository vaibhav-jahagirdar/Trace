
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation"; 
import { useState } from "react";
import { ArrowRightIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  loginSchema,
  type LoginInput,
} from "@trace/shared/contracts/auth";

import { useLogin } from "../../hooks/use-login";

export function LoginForm() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const loginMutation = useLogin();
  const isPending = loginMutation.isPending;
  const router = useRouter(); 

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<LoginInput> = (data) => {
    if (loginMutation.isPending) return;

    
    loginMutation.mutate(data, {
      onSuccess: () => {
        router.push("/create-org");
      },
    });
  };

  const mutationError = loginMutation.error;
  const errorMessage =
    mutationError instanceof Error
      ? mutationError.message
      : mutationError
        ? "Invalid email or password. Please try again."
        : null;

  return (
    <main className="min-h-svh bg-paper text-ink">
      <div className="grid min-h-svh lg:grid-cols-[minmax(0,1fr)_minmax(32rem,0.82fr)]">
        {/* ===== Brand Sidebar ===== */}
        <aside className="relative hidden overflow-hidden bg-moss px-10 py-10 text-paper lg:flex lg:flex-col xl:px-16 xl:py-14">
          <div className="pointer-events-none absolute -left-32 top-24 size-[32rem] rounded-full border border-paper/10" />
          <div className="pointer-events-none absolute -bottom-72 -right-48 size-[42rem] rounded-full border border-paper/10" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_12%,oklch(0.65_0.06_145_/_0.24),transparent_28%),linear-gradient(135deg,transparent_30%,oklch(0.18_0.03_154_/_0.42))]" />

          <Link
            href="/"
            className="relative z-10 inline-flex w-fit items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.25em] text-paper/90 transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-paper"
          >
            <span className="grid size-7 place-items-center border border-paper/40 text-sm tracking-normal">
              T
            </span>
            Trace
          </Link>

          <div className="relative z-10 my-auto max-w-xl py-24">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-sage">
              Pick up where you left off
            </p>
            <h1 className="mt-7 font-heading text-6xl font-extrabold leading-[0.88] tracking-[-0.06em] xl:text-7xl">
              Welcome
              <br />
              <span className="font-serif font-semibold italic text-sage">
                back.
              </span>
            </h1>
            <p className="mt-9 max-w-[38ch] text-lg leading-relaxed text-paper/70">
              Sign in to continue building evidence‑first hiring.
            </p>
          </div>

          <div className="relative z-10 border-t border-paper/20 pt-6">
            <p className="max-w-sm text-sm leading-relaxed text-paper/65">
              Secure, private, and built for teams that value rigour.
            </p>
          </div>
        </aside>


        <section className="relative flex min-h-svh flex-col px-6 py-6 sm:px-10 sm:py-10 lg:px-12 xl:px-20">

          <header className="flex items-center justify-between lg:hidden">
            <Link
              href="/"
              className="inline-flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.25em] text-primary"
            >
              <span className="grid size-7 place-items-center border border-primary/40 text-sm tracking-normal">
                T
              </span>
              Trace
            </Link>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-olive">
              01 / Account
            </span>
          </header>

          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-14 lg:py-10">
            <div className="flex items-center justify-between gap-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                01 / Account
              </p>
              <div className="h-px flex-1 bg-rule" />
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-olive">
                Sign in
              </p>
            </div>

            <h2 className="mt-9 font-heading font-extrabold leading-[0.9] tracking-[-0.055em] sm:text-6xl">
              Sign in to
              <br />
              <span className="font-serif font-semibold italic text-primary">
                Trace.
              </span>
            </h2>
            <p className="mt-6 max-w-[39ch] text-base leading-relaxed text-olive">
              Enter your credentials to access your workspace.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-6" noValidate>
              <Field id="email" label="Work email" error={errors.email?.message}>
                <input
                  {...register("email")}
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="alex@company.com"
                  aria-invalid={Boolean(errors.email)}
                  className={inputClassName}
                />
              </Field>

              <Field id="password" label="Password" error={errors.password?.message}>
                <div className="relative">
                  <input
                    {...register("password")}
                    id="password"
                    type={isPasswordVisible ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Your password"
                    aria-invalid={Boolean(errors.password)}
                    className={`${inputClassName} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible((visible) => !visible)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-olive transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                  >
                    {isPasswordVisible ? (
                      <EyeOffIcon className="size-4" />
                    ) : (
                      <EyeIcon className="size-4" />
                    )}
                  </button>
                </div>
              </Field>

              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="font-mono text-[10px] uppercase tracking-[0.16em] text-olive transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Forgot password?
                </Link>
              </div>

              {errorMessage && (
                <p className="border-l-2 border-destructive bg-destructive/5 px-4 py-3 text-sm leading-relaxed text-destructive" role="alert">
                  {errorMessage}
                </p>
              )}

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting || isPending}
                  className="group inline-flex w-full items-center justify-between bg-primary px-5 py-4 text-left text-primary-foreground transition-colors hover:bg-forest disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em]">
                    {isPending ? "Signing in…" : "Sign in"}
                  </span>
                  <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                </button>
              </div>
            </form>

            <p className="mt-8 text-center text-sm leading-relaxed text-olive">
              Don’t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-primary underline underline-offset-4 transition-colors hover:text-forest"
              >
                Sign up
              </Link>
            </p>
          </div>


          <footer className="flex items-center justify-between gap-4 border-t border-rule pt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-olive">
            <span>Evidence‑first hiring</span>
            <span className="hidden sm:inline">Private by design</span>
          </footer>
        </section>
      </div>
    </main>
  );
}


const inputClassName =
  "w-full border-0 border-b border-rule bg-transparent px-0 py-3 text-base text-ink outline-none transition-colors placeholder:text-olive/45 focus:border-primary focus:ring-0";

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
};

function Field({ id, label, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-olive">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {error && (
        <p className="mt-2 text-xs leading-relaxed text-destructive" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}