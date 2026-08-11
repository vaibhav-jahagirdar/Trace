"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ArrowRightIcon, CheckIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import {
  registerSchema,
  type RegisterInput,
} from "@trace/shared/contracts/auth";

import { useRegister } from "../../hooks/use-register";

export function RegisterForm() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const registerMutation = useRegister();
  const isPending = registerMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof registerSchema>, unknown, RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      phone: "",
      linkedin_url: "",
      avatar_url: "",
    },
  });

  const onSubmit: SubmitHandler<RegisterInput> = (data) => {
    if (registerMutation.isPending) return;

    setSuccessMessage(null);
    registerMutation.mutate(data, {
      onSuccess: () => {
        reset();
        setIsPasswordVisible(false);
        setShowProfileDetails(false);
        setSuccessMessage("Account created successfully.");
      },
    });
  };

  const mutationError = registerMutation.error;
  const errorMessage =
    mutationError instanceof Error
      ? mutationError.message
      : mutationError
        ? "We couldn't create your account. Please try again."
        : null;

  return (
    <main className="min-h-svh bg-paper text-ink">
      <div className="grid min-h-svh lg:grid-cols-[minmax(0,1fr)_minmax(32rem,0.82fr)]">
        <aside className="relative hidden overflow-hidden bg-forest px-10 py-10 text-paper lg:flex lg:flex-col xl:px-16 xl:py-14">
          <div className="pointer-events-none absolute -left-32 top-24 size-[32rem] rounded-full border border-paper/10" />
          <div className="pointer-events-none absolute -bottom-72 -right-48 size-[42rem] rounded-full border border-paper/10" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_12%,oklch(0.65_0.06_145_/_0.24),transparent_28%),linear-gradient(135deg,transparent_30%,oklch(0.18_0.03_154_/_0.42))]" />

          <Link
            href="/"
            className="relative z-10 inline-flex w-fit items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.25em] text-paper/90 transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-paper"
          >
            <span className="grid size-7 place-items-center border border-paper/40 text-sm tracking-normal">T</span>
            Trace
          </Link>

          <div className="relative z-10 my-auto max-w-xl py-24">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-sage">
              A better starting point
            </p>
            <h1 className="mt-7 font-heading text-6xl font-extrabold leading-[0.88] tracking-[-0.06em] xl:text-7xl">
              Make every
              <br />
              <span className="font-serif font-semibold italic text-sage">decision count.</span>
            </h1>
            <p className="mt-9 max-w-[38ch] text-lg leading-relaxed text-paper/70">
              A quieter, more rigorous way to find the people worth meeting.
            </p>
          </div>

          <div className="relative z-10 border-t border-paper/20 pt-6">
            <p className="max-w-sm text-sm leading-relaxed text-paper/65">
              Built for teams who prefer evidence over endless review.
            </p>
          </div>
        </aside>

        <section className="relative flex min-h-svh flex-col px-6 py-6 sm:px-10 sm:py-10 lg:px-12 xl:px-20">
          <header className="flex items-center justify-between lg:hidden">
            <Link
              href="/"
              className="inline-flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.25em] text-primary"
            >
              <span className="grid size-7 place-items-center border border-primary/40 text-sm tracking-normal">T</span>
              Trace
            </Link>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-olive">01 / Account</span>
          </header>

          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-14 lg:py-10">
            <div className="flex items-center justify-between gap-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">01 / Account</p>
              <div className="h-px flex-1 bg-rule" />
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-olive">A few details</p>
            </div>

            <h2 className="mt-9 font-heading  font-extrabold leading-[0.9] tracking-[-0.055em] sm:text-6xl">
              Create your
              <br />
              <span className="font-serif font-semibold italic text-primary">Trace account.</span>
            </h2>
            <p className="mt-6 max-w-[39ch] text-base leading-relaxed text-olive">
              Start with the essentials. You can complete your profile whenever you&apos;re ready.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-6" noValidate>
              <div className="grid gap-6 sm:grid-cols-2">
                <Field id="first_name" label="First name" error={errors.first_name?.message}>
                  <input
                    {...register("first_name")}
                    id="first_name"
                    autoComplete="given-name"
                    placeholder="Alex"
                    aria-invalid={Boolean(errors.first_name)}
                    className={inputClassName}
                  />
                </Field>
                <Field id="last_name" label="Last name" optional error={errors.last_name?.message}>
                  <input
                    {...register("last_name")}
                    id="last_name"
                    autoComplete="family-name"
                    placeholder="Morgan"
                    aria-invalid={Boolean(errors.last_name)}
                    className={inputClassName}
                  />
                </Field>
              </div>

              <Field id="username" label="Username" hint="Letters, numbers, hyphens, or underscores." error={errors.username?.message}>
                <input
                  {...register("username")}
                  id="username"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="alexmorgan"
                  aria-invalid={Boolean(errors.username)}
                  className={inputClassName}
                />
              </Field>

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

              <Field
                id="password"
                label="Password"
                hint="8+ characters, with upper- and lowercase letters, a number, and a symbol."
                error={errors.password?.message}
              >
                <div className="relative">
                  <input
                    {...register("password")}
                    id="password"
                    type={isPasswordVisible ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Create a secure password"
                    aria-invalid={Boolean(errors.password)}
                    className={`${inputClassName} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible((visible) => !visible)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-olive transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                  >
                    {isPasswordVisible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                  </button>
                </div>
              </Field>

              <details
                open={showProfileDetails}
                onToggle={(event) => setShowProfileDetails(event.currentTarget.open)}
                className="group border-t border-rule pt-5"
              >
                <summary className="cursor-pointer list-none font-mono text-[10px] uppercase tracking-[0.18em] text-olive marker:hidden transition-colors hover:text-primary">
                  <span className="inline-flex items-center gap-2">
                    Add profile details
                    <span className="text-base leading-none transition-transform group-open:rotate-45">+</span>
                    <span className="text-olive/65">Optional</span>
                  </span>
                </summary>
                <div className="space-y-6 pt-6">
                  <Field id="phone" label="Phone" optional error={errors.phone?.message}>
                    <input
                      {...register("phone")}
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+1 555 012 3456"
                      aria-invalid={Boolean(errors.phone)}
                      className={inputClassName}
                    />
                  </Field>
                  <Field id="linkedin_url" label="LinkedIn URL" optional error={errors.linkedin_url?.message}>
                    <input
                      {...register("linkedin_url")}
                      id="linkedin_url"
                      type="url"
                      autoComplete="url"
                      placeholder="https://linkedin.com/in/yourname"
                      aria-invalid={Boolean(errors.linkedin_url)}
                      className={inputClassName}
                    />
                  </Field>
                  <Field id="avatar_url" label="Avatar URL" optional error={errors.avatar_url?.message}>
                    <input
                      {...register("avatar_url")}
                      id="avatar_url"
                      type="url"
                      placeholder="https://…"
                      aria-invalid={Boolean(errors.avatar_url)}
                      className={inputClassName}
                    />
                  </Field>
                </div>
              </details>

              {errorMessage && (
                <p className="border-l-2 border-destructive bg-destructive/5 px-4 py-3 text-sm leading-relaxed text-destructive" role="alert">
                  {errorMessage}
                </p>
              )}

              {successMessage && (
                <p className="border-l-2 border-primary bg-primary/5 px-4 py-3 text-sm leading-relaxed text-primary" role="status">
                  {successMessage}
                </p>
              )}

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting || isPending}
                  className="group inline-flex w-full items-center justify-between bg-primary px-5 py-4 text-left text-primary-foreground transition-colors hover:bg-forest disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em]">
                    {isPending ? "Creating your account" : "Create account"}
                  </span>
                  <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                </button>
                <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-olive">
                  <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
                  Your details are used to set up your workspace and profile.
                </p>
              </div>
            </form>
            <p className="mt-8 text-center text-sm leading-relaxed text-olive">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary underline underline-offset-4 transition-colors hover:text-forest"
              >
                Sign in
              </Link>
            </p>
            
            
          </div>

          <footer className="flex items-center justify-between gap-4 border-t border-rule pt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-olive">
            <span>Evidence-first hiring</span>
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
  optional?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
};

function Field({ id, label, optional, hint, error, children }: FieldProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-olive">
          {label}
        </label>
        {optional && <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-olive/60">Optional</span>}
      </div>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p className="mt-2 text-xs leading-relaxed text-destructive" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-2 text-xs leading-relaxed text-olive/75">{hint}</p>
      ) : null}
    </div>
  );
}
