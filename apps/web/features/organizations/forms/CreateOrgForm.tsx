// apps/web/features/organizations/components/forms/CreateOrgForm.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowRightIcon, CheckIcon } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createOrganizationSchema,
  type CreateOrganizationInput,
} from "@trace/shared/contracts/organizations";
import { useCreateOrg } from "../hooks/use-create-org";

/* A quiet, single fractal-noise texture — the "paper" in bg-paper made literal. */
const GRAIN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

export function CreateOrgForm() {
  const router = useRouter();
  const createOrgMutation = useCreateOrg();
  const isPending = createOrgMutation.isPending;

  // Page-load reveal — one orchestrated moment, not per-field fuss.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  const revealBase =
    "transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none";
  const revealFrom = "opacity-0 translate-y-3";
  const revealTo = "opacity-100 translate-y-0";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateOrganizationInput>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      title: "",
    },
  });

  const onSubmit: SubmitHandler<CreateOrganizationInput> = (data) => {
    if (createOrgMutation.isPending) return;

    createOrgMutation.mutate(data, {
      onSuccess: () => {
        router.push("/dashboard"); 
      },
    });
  };

  const mutationError = createOrgMutation.error;
  const errorMessage =
    mutationError instanceof Error
      ? mutationError.message
      : mutationError
        ? "We couldn't create your organization. Please try again."
        : null;

  return (
    <main className="relative min-h-svh bg-paper text-ink">
      {/* Literal paper grain — the single quiet texture tying the whole spread together */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.05] mix-blend-multiply"
        style={{ backgroundImage: `url("${GRAIN}")`, backgroundSize: "140px 140px" }}
      />

      <div className="relative z-10 grid min-h-svh lg:grid-cols-[minmax(0,1fr)_minmax(32rem,0.82fr)]">
        {/* ============================== PAGE I — CONTEXT ============================== */}
        <aside className="relative hidden overflow-hidden bg-moss px-10 py-10 text-paper lg:flex lg:flex-col xl:px-16 xl:py-14">
          <div className="pointer-events-none absolute -left-24 top-32 size-[28rem] rounded-full border border-paper/5" />
          <div className="pointer-events-none absolute -bottom-64 -right-32 size-[38rem] rounded-full border border-paper/5" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_18%,oklch(0.65_0.04_145_/_0.18),transparent_35%),linear-gradient(135deg,transparent_30%,oklch(0.17_0.03_155_/_0.5))]" />

          {/* Stitched binding — the spread's spine, drawn once, owned by the left page */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-12 right-0 hidden w-px lg:block"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, oklch(0.97 0.01 90 / 0.35) 0 5px, transparent 5px 11px)",
            }}
          />

          {/* Running header — mirrors the form panel's header exactly */}
          <div className="relative z-10 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex w-fit items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.25em] text-paper/85 transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-paper"
            >
              <span className="grid size-7 place-items-center border border-paper/30 text-sm tracking-normal">
                T
              </span>
              Trace
            </Link>
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-paper/40">
              Page I
            </span>
          </div>

          {/* Editorial body */}
          <div
            className={`relative z-10 my-auto max-w-xl py-24 ${revealBase} ${mounted ? revealTo : revealFrom}`}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-sage/80">
              Foundation
            </p>
            <h1 className="mt-7 font-heading text-6xl font-extrabold leading-[0.9] tracking-[-0.06em] xl:text-7xl">
              Set your
              <br />
              <span className="font-serif font-semibold italic text-sage">
                standards.
              </span>
            </h1>
            <blockquote className="mt-10 border-l-2 font-heading border-paper/20 pl-6 text-lg leading-relaxed text-paper/75">
              <p>Decide what matters before you decide who matters.</p>
              <footer className="mt-4 text-sm text-sage/80">
                Trace hiring philosophy
              </footer>
            </blockquote>
          </div>

          {/* Footer — same structure and rhythm as the form panel's footer */}
          <div className="relative z-10 flex items-end justify-between gap-6 border-t border-paper/15 pt-6">
            <p className="max-w-xs text-sm leading-relaxed text-paper/55">
              Once configured, every candidate decision stays grounded in your
              evidence standards.
            </p>
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-paper/35">
              01
            </span>
          </div>
        </aside>

        {/* ============================== PAGE II — RECORD ============================== */}
        <section className="relative flex min-h-svh flex-col px-6 py-6 shadow-[inset_18px_0_28px_-26px_rgba(20,24,16,0.18)] sm:px-10 sm:py-10 lg:px-12 lg:py-10 xl:px-20">
          {/* Running header — mirrors the aside's header exactly */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.25em] text-primary lg:hidden"
            >
              <span className="grid size-7 place-items-center border border-primary/40 text-sm tracking-normal">
                T
              </span>
              Trace
            </Link>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-olive lg:hidden">
              01 / Organization
            </span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.28em] text-olive/50 lg:inline">
              Continued from Page I
            </span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.28em] text-olive/50 lg:inline">
              Page II
            </span>
          </div>

          <div
            className={`mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-14 lg:py-10 ${revealBase} ${mounted ? revealTo : revealFrom}`}
            style={{ transitionDelay: mounted ? "120ms" : "0ms" }}
          >
            {/* Section heading */}
            <div className="mb-10">
              <div className="flex items-center gap-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                  01 / Organization
                </span>
                <span className="h-px flex-1 bg-rule" />
              </div>
              <h2 className="mt-6 font-heading text-5xl font-extrabold leading-[0.95] tracking-[-0.05em] sm:text-6xl">
                Build your
                <br />
                <span className="font-serif font-semibold italic text-primary">
                  hiring context.
                </span>
              </h2>
              <p className="mt-5 max-w-[40ch] text-base leading-relaxed text-olive">
                Define the organisation that will house your jobs, evaluations,
                and standards. You can fine‑tune every detail later.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              <Field
                id="name"
                index="01"
                label="Organization name"
                error={errors.name?.message}
              >
                <input
                  {...register("name")}
                  id="name"
                  autoComplete="organization"
                  placeholder="Acme Corp"
                  aria-invalid={Boolean(errors.name)}
                  className={inputClassName}
                />
              </Field>

              <Field
                id="slug"
                index="02"
                label="URL slug"
                hint="Letters, numbers, hyphens, or underscores. Used in your Trace address."
                error={errors.slug?.message}
              >
                <input
                  {...register("slug")}
                  id="slug"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="acme-corp"
                  aria-invalid={Boolean(errors.slug)}
                  className={inputClassName}
                />
              </Field>

              <Field
                id="description"
                index="03"
                label="Description"
                optional
                error={errors.description?.message}
              >
                <textarea
                  {...register("description")}
                  id="description"
                  rows={3}
                  placeholder="What does this organization do? A short overview helps your team align."
                  aria-invalid={Boolean(errors.description)}
                  className={`${inputClassName} resize-none`}
                />
              </Field>

              <Field
                id="title"
                index="04"
                label="Your title"
                optional
                hint="Shown in team lists. e.g., CTO, Head of Engineering."
                error={errors.title?.message}
              >
                <input
                  {...register("title")}
                  id="title"
                  placeholder="CTO"
                  aria-invalid={Boolean(errors.title)}
                  className={inputClassName}
                />
              </Field>

              {errorMessage && (
                <div
                  className="border-l-2 border-destructive bg-destructive/5 px-4 py-3 text-sm leading-relaxed text-destructive"
                  role="alert"
                >
                  {errorMessage}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || isPending}
                  className="group mt-2 inline-flex w-full items-center justify-between bg-primary px-6 py-4 text-left text-primary-foreground transition-all duration-300 hover:-translate-y-px hover:bg-forest hover:shadow-[0_16px_28px_-18px_oklch(0.17_0.03_155/0.65)] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-55 disabled:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] transition-[letter-spacing] duration-300 group-hover:tracking-[0.24em]">
                    {isPending ? "Creating…" : "Create organization"}
                  </span>
                  <ArrowRightIcon
                    className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </button>
                <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-olive">
                  <CheckIcon
                    className="mt-0.5 size-3.5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  Your Trace organization becomes the single source of truth for
                  every hire.
                </p>
              </div>
            </form>
          </div>

          {/* Footer — same structure and rhythm as the aside's footer */}
          <footer className="flex items-end justify-between gap-4 border-t border-rule pt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-olive">
            <span>Evidence‑first hiring</span>
            <span className="hidden sm:inline">Private by design</span>
            <span className="shrink-0 tracking-[0.18em] text-olive/60">02</span>
          </footer>
        </section>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared input style + Field component (identical to auth forms)    */
/* ------------------------------------------------------------------ */
const inputClassName =
  "w-full border-0 border-b border-rule bg-transparent px-0 py-3 text-base text-ink outline-none transition-colors placeholder:text-olive/45 focus:ring-0";

type FieldProps = {
  id: string;
  index: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
};

function Field({ id, index, label, optional, hint, error, children }: FieldProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label
          htmlFor={id}
          className="flex items-baseline gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-olive"
        >
          <span className="text-primary/55">{index}</span>
          {label}
        </label>
        {optional && (
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-olive/60">
            Optional
          </span>
        )}
      </div>
      <div className="group relative mt-1.5">
        {children}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-primary transition-transform duration-300 ease-out group-focus-within:scale-x-100"
        />
      </div>
      {error ? (
        <p
          className="mt-2 text-xs leading-relaxed text-destructive"
          id={`${id}-error`}
          role="alert"
        >
          {error}
        </p>
      ) : hint ? (
        <p className="mt-2 text-xs leading-relaxed text-olive/75">{hint}</p>
      ) : null}
    </div>
  );
}