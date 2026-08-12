
"use client";

import { useEffect, type ReactNode } from "react";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Check, Circle } from "lucide-react";
import { JOB_ROLE_POLICY, type JobRole } from "@trace/shared/contracts/jobpolicy";

import { useAuth } from "@/providers/auth-provider";


export const step2Schema = z
  .object({
    currency: z.string().trim().min(1, "Select a currency"),
    salary_min: z.number().nonnegative("Minimum salary is required"),
    salary_max: z.number().nonnegative("Maximum salary is required"),
    experience_min_years: z.number().min(0, "Enter a valid minimum experience"),
    experience_ideal_years: z.number().min(0, "Enter an ideal experience"),
    experience_max_years: z.number().min(0, "Enter a maximum experience"),
    notice_period_ideal_days: z.number().int().min(0, "Ideal notice period is required"),
    notice_period_max_days: z.number().int().min(0, "Maximum notice period is required"),
    relocation_assistance: z.boolean(),
    visa_sponsorship: z.boolean(),
    work_authorization_required: z.boolean(),
    minimum_education_level: z.enum(["NONE", "HIGH_SCHOOL", "DIPLOMA", "UNDERGRADUATE", "POSTGRADUATE"]),
  })
  .superRefine((data, ctx) => {
    if (data.salary_max < data.salary_min) {
      ctx.addIssue({
        code: "custom",
        path: ["salary_max"],
        message: "Maximum must be greater than or equal to minimum",
      });
    }
    if (data.experience_ideal_years < data.experience_min_years) {
      ctx.addIssue({
        code: "custom",
        path: ["experience_ideal_years"],
        message: "Ideal must be ≥ minimum",
      });
    }
    if (data.experience_max_years < data.experience_ideal_years) {
      ctx.addIssue({
        code: "custom",
        path: ["experience_max_years"],
        message: "Maximum must be ≥ ideal",
      });
    }
    if (data.notice_period_max_days < data.notice_period_ideal_days) {
      ctx.addIssue({
        code: "custom",
        path: ["notice_period_max_days"],
        message: "Maximum must be ≥ ideal",
      });
    }
  });

export type Step2Input = z.input<typeof step2Schema>;

// ---------- Constants ----------
const CURRENCIES = ["USD", "EUR", "GBP", "INR", "CAD", "AUD"] as const;

const EDUCATION_LEVELS = [
  { value: "NONE", label: "No requirement" },
  { value: "HIGH_SCHOOL", label: "High school" },
  { value: "DIPLOMA", label: "Diploma" },
  { value: "UNDERGRADUATE", label: "Undergraduate" },
  { value: "POSTGRADUATE", label: "Postgraduate" },
] as const;

// ---------- Reusable field styles ----------
const inputClassName =
  "w-full border-0 border-b border-forest/20 bg-transparent px-0 py-3 text-[1.3rem] text-ink outline-none transition-colors placeholder:text-olive/45 focus:border-forest disabled:cursor-not-allowed disabled:opacity-40";

// ---------- Component ----------
export function CreateJobStep2({
  role = "MID",
  initialData,
  onContinue,
  onBack,
}: {
  role?: JobRole;
  initialData?: Record<string, unknown>;
  onContinue?: (data: Step2Input) => void;
  onBack?: () => void;
}) {
  const { activeOrg } = useAuth();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { isValid },
  } = useForm<Step2Input>({
    resolver: zodResolver(step2Schema),
    mode: "onChange",
    defaultValues: {
      currency: "USD",
      salary_min: 80000,
      salary_max: 120000,
      experience_min_years: JOB_ROLE_POLICY[role].experience.minYears,
      experience_ideal_years: Math.min(JOB_ROLE_POLICY[role].experience.maxYears ?? JOB_ROLE_POLICY[role].experience.minYears, JOB_ROLE_POLICY[role].experience.minYears + 1),
      experience_max_years: JOB_ROLE_POLICY[role].experience.maxYears ?? JOB_ROLE_POLICY[role].experience.minYears + 2,
      notice_period_ideal_days: 15,
      notice_period_max_days: 60,
      relocation_assistance: false,
      visa_sponsorship: false,
      work_authorization_required: true,
      minimum_education_level: "UNDERGRADUATE",
    },
  });

  const values = useWatch({ control });

  // Pre‑fill from draft
  useEffect(() => {
    const savedData = initialData;
    if (savedData) {
      for (const [key, value] of Object.entries(savedData)) {
        if (key in step2Schema.shape) {
          setValue(key as keyof Step2Input, value as never, { shouldDirty: false, shouldValidate: true });
        }
      }
    }
  }, [initialData, setValue]);

  const onSubmit: SubmitHandler<Step2Input> = (data) => {
    onContinue?.(data);
  };

  return (
    <main className="min-h-svh bg-paper text-ink lg:grid lg:grid-cols-[4.5rem_minmax(0,1fr)]">
      {/* Left step indicator */}
      <aside className="hidden border-r border-forest/12 bg-warm lg:flex lg:flex-col lg:items-center lg:py-6">
        <span className="grid size-8 place-items-center border border-forest/30 font-mono text-[0.75rem] text-forest">T</span>
        <div className="mt-24 flex flex-1 flex-col items-center gap-4">
          <span className="font-mono text-[0.8125rem] text-olive/40">01</span>
          <span className="h-14 w-px bg-forest" />
          <span className="font-mono text-[0.8125rem] text-forest">02</span>
          <span className="font-mono text-[0.8125rem] text-olive/40">03</span>
          <span className="font-mono text-[0.8125rem] text-olive/40">04</span>
        </div>
        <span className="[writing-mode:vertical-rl] font-mono text-[0.75rem] uppercase tracking-[0.2em] text-olive">
          Eligibility
        </span>
      </aside>

      <div className="min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-forest/12 bg-paper/95 px-6 py-5 backdrop-blur md:px-10 lg:px-14">
          <div className="mx-auto flex max-w-6xl items-baseline justify-between gap-6">
            <span className="font-mono text-[0.8125rem] font-medium uppercase tracking-[0.2em] text-forest lg:hidden">Trace</span>
            <span className="hidden font-mono text-[0.8125rem] uppercase tracking-[0.17em] text-olive sm:block">
              {activeOrg?.orgName ?? "Hiring workspace"} · Step 2 of 6
            </span>
            <span className="ml-auto flex items-center gap-2 font-mono text-[0.8125rem] uppercase tracking-[0.16em] text-olive">
              <Check className="size-3 text-forest" aria-hidden="true" />
              Ready
            </span>
          </div>
        </header>

        <main className="px-6 pb-28 md:px-10 lg:px-14">
          <div className="mx-auto max-w-6xl">
            {/* Hero */}
            <section className="border-b border-forest/12 py-16 md:py-20">
              <p className="font-mono text-[0.8125rem] uppercase tracking-[0.2em] text-olive">Trace · Eligibility</p>
              <h1 className="mt-6 max-w-[20ch] text-5xl leading-[0.96] tracking-[-0.045em] text-ink md:text-6xl" style={{ fontFamily: "var(--font-primary)", fontWeight: 400 }}>
                Don’t review candidates who can’t take the job.
              </h1>
              <p className="mt-4 max-w-[45ch] text-[1.625rem] font-light leading-snug tracking-[-0.005em] text-olive" style={{ fontFamily: "var(--font-primary)" }}>
                Set the boundaries before applications arrive. Trace uses these constraints to remove obvious mismatches before you spend human time evaluating evidence.
              </p>
              <p className="mt-6 font-mono text-[0.8125rem] uppercase tracking-[0.14em] text-olive/70">
                Salary · Experience · Availability · Authorization · Education
              </p>
            </section>

            <div className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-20">
              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <section aria-labelledby="eligibility-heading" className="space-y-14">
                  {/* Compensation */}
                  <section>
                    <h2 className="font-mono text-[0.8125rem] uppercase tracking-[0.18em] text-forest">Compensation</h2>
                    <p className="mt-1 text-[1.625rem] font-light tracking-[-0.025em]">What are you willing to pay?</p>
                    <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_1fr_1fr]">
                      <Field index="01" label="Currency" htmlFor="currency">
                        <select {...register("currency")} id="currency" className={inputClassName}>
                          {CURRENCIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </Field>
                      <Field index="02" label="Minimum salary" htmlFor="salary_min">
                        <input {...register("salary_min", { valueAsNumber: true })} id="salary_min" type="number" className={inputClassName} />
                      </Field>
                      <Field index="03" label="Maximum salary" htmlFor="salary_max">
                        <input {...register("salary_max", { valueAsNumber: true })} id="salary_max" type="number" className={inputClassName} />
                      </Field>
                    </div>
                    <p className="mt-3 text-[1.1375rem] text-olive">Candidates outside this range shouldn’t consume review time unless you explicitly choose otherwise.</p>
                  </section>

                  {/* Experience */}
                  <section>
                    <h2 className="font-mono text-[0.8125rem] uppercase tracking-[0.18em] text-forest">Experience</h2>
                    <p className="mt-1 text-[1.625rem] font-light tracking-[-0.025em]">How much experience does this role actually require?</p>
                    <div className="mt-6 grid gap-6 sm:grid-cols-3">
                      <Field index="04" label="Minimum acceptable" htmlFor="experience_min_years" hint="The lowest experience level you would realistically consider.">
                        <input {...register("experience_min_years", { valueAsNumber: true })} id="experience_min_years" type="number" className={inputClassName} />
                      </Field>
                      <Field index="05" label="Ideal" htmlFor="experience_ideal_years" hint="Your target. Useful for ranking, not automatic rejection.">
                        <input {...register("experience_ideal_years", { valueAsNumber: true })} id="experience_ideal_years" type="number" className={inputClassName} />
                      </Field>
                      <Field index="06" label="Maximum" htmlFor="experience_max_years" hint="Above this level, the role may no longer be the right fit.">
                        <input {...register("experience_max_years", { valueAsNumber: true })} id="experience_max_years" type="number" className={inputClassName} />
                      </Field>
                    </div>
                    <p className="mt-3 text-[1.1375rem] text-olive">A candidate with more years isn’t automatically better. This defines the shape of the role.</p>
                  </section>

                  {/* Availability */}
                  <section>
                    <h2 className="font-mono text-[0.8125rem] uppercase tracking-[0.18em] text-forest">Availability</h2>
                    <p className="mt-1 text-[1.625rem] font-light tracking-[-0.025em]">How soon do you need them?</p>
                    <div className="mt-6 grid gap-6 sm:grid-cols-2">
                      <Field index="07" label="Ideal notice period (days)" htmlFor="notice_period_ideal_days">
                        <input {...register("notice_period_ideal_days", { valueAsNumber: true })} id="notice_period_ideal_days" type="number" className={inputClassName} />
                      </Field>
                      <Field index="08" label="Maximum acceptable (days)" htmlFor="notice_period_max_days">
                        <input {...register("notice_period_max_days", { valueAsNumber: true })} id="notice_period_max_days" type="number" className={inputClassName} />
                      </Field>
                    </div>
                    <p className="mt-3 text-[1.1375rem] text-olive">Don’t reject someone because they’re not available tomorrow. Tell Trace where the boundary actually is.</p>
                  </section>

                  {/* Work Authorization */}
                  <section>
                    <h2 className="font-mono text-[0.8125rem] uppercase tracking-[0.18em] text-forest">Work authorization</h2>
                    <p className="mt-1 text-[1.625rem] font-light tracking-[-0.025em]">Can they legally work in this role?</p>
                    <div className="mt-6 space-y-4">
                      <ToggleField index="09" label="Work authorization required" description="Candidate must already be authorized to work in the relevant employment location.">
                        <input {...register("work_authorization_required")} type="checkbox" className="sr-only peer" />
                      </ToggleField>
                      <ToggleField index="10" label="Visa sponsorship available" description="You are willing to sponsor a candidate who otherwise qualifies.">
                        <input {...register("visa_sponsorship")} type="checkbox" className="sr-only peer" />
                      </ToggleField>
                      <ToggleField index="11" label="Relocation assistance" description="You are willing to support relocation for candidates who need it.">
                        <input {...register("relocation_assistance")} type="checkbox" className="sr-only peer" />
                      </ToggleField>
                    </div>
                  </section>

                  {/* Education */}
                  <section>
                    <h2 className="font-mono text-[0.8125rem] uppercase tracking-[0.18em] text-forest">Education</h2>
                    <p className="mt-1 text-[1.625rem] font-light tracking-[-0.025em]">Does education actually matter?</p>
                    <div className="mt-6">
                      <Field index="12" label="Minimum education level" htmlFor="minimum_education_level">
                        <select {...register("minimum_education_level")} id="minimum_education_level" className={inputClassName}>
                          {EDUCATION_LEVELS.map((level) => (
                            <option key={level.value} value={level.value}>{level.label}</option>
                          ))}
                        </select>
                      </Field>
                      <p className="mt-3 text-[1.1375rem] leading-relaxed text-olive">
                        <strong className="font-medium text-ink">Only set this if it is genuinely a constraint.</strong> If someone can succeed without a degree, don’t turn a credential into an artificial filter.
                      </p>
                    </div>
                  </section>
                </section>

                {/* Footer */}
                <footer className="mt-16 flex flex-wrap items-center justify-between gap-6 border-t border-forest pt-7">
                  <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-[1.1375rem] text-olive transition-colors hover:text-forest">
                    <ArrowLeft className="size-4" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={!isValid}
                    className="group inline-flex items-center gap-8 bg-forest px-5 py-3.5 font-mono text-[0.89375rem] uppercase tracking-[0.16em] text-paper transition-colors hover:bg-moss disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Define what matters
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </footer>
              </form>

              {/* Sidebar – Live eligibility summary */}
              <aside className="lg:pt-[3.55rem]">
                <div className="bg-forest p-6 text-paper lg:sticky lg:top-24">
                  <Circle className="size-3 fill-sage text-sage" aria-hidden="true" />
                  <p className="mt-8 font-mono text-[0.8125rem] uppercase tracking-[0.18em] text-sage">Your eligibility boundary</p>
                  <div className="mt-4 space-y-2 text-[1.1375rem] leading-relaxed">
                    <p>{values.salary_min?.toLocaleString()}–{values.salary_max?.toLocaleString()} {values.currency}</p>
                    <p>{values.experience_min_years}–{values.experience_max_years} years experience (ideal: {values.experience_ideal_years})</p>
                    <p>Notice: ≤ {values.notice_period_max_days} days</p>
                    <p>Authorization: {values.work_authorization_required ? "Required" : "Not required"}</p>
                    <p>Visa: {values.visa_sponsorship ? "Available" : "No"}</p>
                    <p>Relocation: {values.relocation_assistance ? "Yes" : "No"}</p>
                    <p>Education: {EDUCATION_LEVELS.find((l) => l.value === values.minimum_education_level)?.label}</p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </main>
  );
}

// ---------- Helper Components (same style as Step 1) ----------
function Field({ index, label, htmlFor, hint, children, optional }: { index: string; label: string; htmlFor?: string; hint?: string; children: ReactNode; optional?: boolean }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="flex items-baseline gap-3 font-mono text-[0.8125rem] font-medium uppercase tracking-[0.17em] text-forest">
        <span className="text-olive">{index}</span> {label}
        {optional && <span className="ml-auto text-[0.73125rem] font-normal text-olive/60">Optional</span>}
      </label>
      <div className="mt-2">{children}</div>
      {hint && <p className="mt-2 text-[0.975rem] leading-relaxed text-olive">{hint}</p>}
    </div>
  );
}

function ToggleField({ index, label, description, children }: { index: string; label: string; description: string; children: ReactNode }) {
  void index;
  return (
    <div className="flex items-start gap-4">
      <label className="relative inline-flex cursor-pointer items-center mt-1">
        {children}
        <div className="h-6 w-11 rounded-full border border-forest/30 bg-transparent transition peer-checked:bg-forest peer-checked:border-forest peer-focus:ring-1 peer-focus:ring-forest" />
      </label>
      <div>
        <p className="text-[1.1375rem] text-ink">{label}</p>
        <p className="text-[0.975rem] text-olive">{description}</p>
      </div>
    </div>
  );
}
