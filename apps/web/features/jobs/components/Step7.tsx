"use client";

import { useState } from "react";
import { ArrowLeft, Check, Circle, FileCheck, Pencil } from "lucide-react";

export type JobDefinitionDraft = Record<string, unknown>;
export type SubmissionRequirements = {
  resume_required: boolean;
  github_required: boolean;
  portfolio_required: boolean;
  problem_solving_profile_required: boolean;
  linkedin_required: boolean;
  project_explanation_required: boolean;
  feature_explanation_required: boolean;
  zip_upload_allowed: boolean;
};

const DEFAULT_SUBMISSION_REQUIREMENTS: SubmissionRequirements = {
  resume_required: true,
  github_required: false,
  portfolio_required: false,
  problem_solving_profile_required: false,
  linkedin_required: false,
  project_explanation_required: false,
  feature_explanation_required: false,
  zip_upload_allowed: false,
};

const SUBMISSION_OPTIONS: { key: keyof SubmissionRequirements; label: string; description: string }[] = [
  { key: "resume_required", label: "Resume", description: "Require a resume or CV." },
  { key: "github_required", label: "GitHub profile", description: "Ask candidates to provide a GitHub profile." },
  { key: "portfolio_required", label: "Portfolio", description: "Require a portfolio or work sample." },
  { key: "problem_solving_profile_required", label: "Problem-solving profile", description: "Collect the candidate problem-solving profile." },
  { key: "linkedin_required", label: "LinkedIn profile", description: "Ask candidates to provide LinkedIn." },
  { key: "project_explanation_required", label: "Project explanation", description: "Require an explanation of a relevant project." },
  { key: "feature_explanation_required", label: "Feature explanation", description: "Require an explanation of a feature they built." },
  { key: "zip_upload_allowed", label: "ZIP upload allowed", description: "Allow candidates to attach a ZIP project archive." },
];

const SECTIONS = [
  { step: 1, label: "Role", key: "step1" },
  { step: 2, label: "Eligibility", key: "step2" },
  { step: 3, label: "Technical bar", key: "step3" },
  { step: 4, label: "Hiring lens", key: "step4" },
  { step: 5, label: "Evidence plan", key: "step5" },
  { step: 6, label: "Success signals", key: "step6" },
] as const;

export function CreateJobStep7({
  formData,
  onEdit,
  onCreateJob,
  isCreating,
  created,
}: {
  formData: JobDefinitionDraft;
  onEdit: (step: number) => void;
  onCreateJob: (submissionRequirements: SubmissionRequirements) => void;
  isCreating: boolean;
  created: boolean;
}) {
  const [submissionRequirements, setSubmissionRequirements] = useState<SubmissionRequirements>(DEFAULT_SUBMISSION_REQUIREMENTS);
  const title = getString(formData.step1, "title") ?? "Untitled role";
  const department = getString(formData.step1, "department");
  const requirements = getArray(formData.step3, "requirements").length;
  const evaluations = getArray(formData.step4, "evaluation_priorities").length;
  const evidence = getArray(formData.step5, "evidence_priorities").length;
  const signals = getArray(formData.step6, "success_signals").length;

  return (
    <main className="min-h-svh bg-paper text-ink">
      <header className="sticky top-0 z-20 border-b border-forest/12 bg-paper/95 px-6 py-6 backdrop-blur md:px-10 lg:px-14">
        <div className="mx-auto flex max-w-7xl items-baseline justify-between gap-6">
          <span className="font-mono text-sm font-medium uppercase tracking-[0.18em] text-forest lg:hidden">Trace</span>
          <span className="hidden font-mono text-sm uppercase tracking-[0.15em] text-olive sm:block">Hiring workspace · Final review</span>
          <span className="ml-auto flex items-center gap-2 font-mono text-sm uppercase tracking-[0.14em] text-forest"><Check className="size-4" /> Ready to create</span>
        </div>
      </header>

      <div className="px-6 pb-28 md:px-10 lg:px-14">
        <div className="mx-auto max-w-7xl">
          <section className="border-b border-forest/12 py-16 md:py-20">
            <p className="font-mono text-sm uppercase tracking-[0.16em] text-olive">07 · Review the definition</p>
            <div className="mt-6 grid gap-9 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-end">
              <div>
                <h1 className="max-w-[18ch] text-5xl leading-[0.94] tracking-[-0.045em] md:text-6xl" style={{ fontFamily: "var(--font-heading)", fontWeight: 300 }}>
                  A hiring decision, made explicit.
                </h1>
                <p className="mt-5 max-w-[50ch] text-2xl font-light leading-snug text-olive" style={{ fontFamily: "var(--font-heading)" }}>
                  Review the standard before it becomes the reference point for every candidate who follows.
                </p>
              </div>
              <p className="border-l border-forest/25 pl-6 text-base leading-relaxed text-olive">
                You can still edit any part of the definition. Creating the job stores the complete hiring definition as a draft for your team.
              </p>
            </div>
          </section>

          <div className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-20">
            <div>
              <div className="flex flex-wrap items-end justify-between gap-6 border-b border-forest/12 pb-6">
                <div><p className="font-mono text-sm uppercase tracking-[0.16em] text-forest">The complete brief</p><h2 className="mt-3 text-3xl font-light tracking-[-0.035em]" style={{ fontFamily: "var(--font-heading)" }}>{title}</h2></div>
                {department && <p className="font-mono text-sm uppercase tracking-[0.14em] text-olive">{department}</p>}
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {SECTIONS.map((section) => {
                  const data = formData[section.key];
                  const detail = section.step === 3 ? `${requirements} requirements` : section.step === 4 ? `${evaluations} evaluation dimensions` : section.step === 5 ? `${evidence} evidence categories` : section.step === 6 ? `${signals} success signals` : section.step === 1 ? title : section.step === 2 ? eligibilitySummary(data) : "";
                  return <article key={section.step} className="border border-forest/15 bg-warm p-6"><div className="flex items-start justify-between gap-4"><div><p className="font-mono text-sm uppercase tracking-[0.15em] text-forest">0{section.step} · {section.label}</p><p className="mt-3 text-xl font-light leading-snug text-ink" style={{ fontFamily: "var(--font-heading)" }}>{detail || "Not completed"}</p></div><button type="button" onClick={() => onEdit(section.step)} aria-label={`Edit ${section.label}`} className="grid size-10 place-items-center border border-forest/20 text-forest transition-colors hover:bg-paper"><Pencil className="size-4" /></button></div></article>;
                })}
              </div>

              <section className="mt-12 border-t border-forest/12 pt-8">
                <p className="font-serif text-3xl font-semibold italic leading-snug text-forest">This is your hiring standard—not another job description.</p>
                <p className="mt-4 max-w-[65ch] text-base leading-relaxed text-olive">Trace will use the role, boundaries, technical bar, judgment, evidence plan, and success definition together when candidates arrive.</p>
              </section>

              <section className="mt-12 border-t border-forest/12 pt-8" aria-labelledby="submission-heading">
                <p className="font-mono text-sm uppercase tracking-[0.16em] text-forest">Application requirements</p>
                <h2 id="submission-heading" className="mt-3 text-3xl font-light tracking-[-0.035em]" style={{ fontFamily: "var(--font-heading)" }}>What should every candidate provide?</h2>
                <p className="mt-3 max-w-[62ch] text-base leading-relaxed text-olive">These choices become the submission standard attached to this role.</p>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {SUBMISSION_OPTIONS.map((option) => (
                    <label key={option.key} className="flex cursor-pointer items-start gap-4 border border-forest/15 bg-warm p-5 transition-colors has-[:checked]:border-forest has-[:checked]:bg-forest/5">
                      <input type="checkbox" checked={submissionRequirements[option.key]} onChange={(event) => setSubmissionRequirements((current) => ({ ...current, [option.key]: event.target.checked }))} className="mt-1 size-4 accent-forest" />
                      <span><span className="block text-base text-ink">{option.label}</span><span className="mt-1 block text-sm leading-relaxed text-olive">{option.description}</span></span>
                    </label>
                  ))}
                </div>
              </section>

              <footer className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-forest pt-7">
                <button type="button" onClick={() => onEdit(6)} className="inline-flex items-center gap-2 text-base text-olive transition-colors hover:text-forest"><ArrowLeft className="size-5" /> Success signals</button>
                <div className="text-right"><button type="button" onClick={() => onCreateJob(submissionRequirements)} disabled={isCreating || created} className="group inline-flex items-center gap-8 bg-forest px-6 py-4 font-mono text-sm uppercase tracking-[0.13em] text-paper transition-colors hover:bg-moss disabled:cursor-not-allowed disabled:opacity-45">{isCreating ? "Creating job" : created ? "Job created" : "Create job"}<FileCheck className="size-5" /></button><p className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-olive">Creates the job as a draft</p></div>
              </footer>
            </div>

            <aside className="lg:pt-[4.25rem]"><div className="bg-forest p-8 text-paper lg:sticky lg:top-24"><Circle className="size-4 fill-sage text-sage" /><p className="mt-9 font-mono text-sm uppercase tracking-[0.16em] text-sage">Review complete</p><p className="mt-4 text-2xl font-light leading-tight" style={{ fontFamily: "var(--font-heading)" }}>Seven decisions. One shared hiring standard.</p><div className="mt-9 border-t border-paper/20 pt-6 text-base leading-relaxed text-paper/70">Save this review when the definition is ready for your team to return to and refine.</div></div></aside>
          </div>
        </div>
      </div>
    </main>
  );
}

function getString(value: unknown, key: string) { return typeof value === "object" && value !== null && typeof (value as Record<string, unknown>)[key] === "string" ? (value as Record<string, string>)[key] : undefined; }
function getArray(value: unknown, key: string) { return typeof value === "object" && value !== null && Array.isArray((value as Record<string, unknown>)[key]) ? (value as Record<string, unknown[]>)[key] : []; }
function eligibilitySummary(value: unknown) { const min = getNumber(value, "salary_min"); const max = getNumber(value, "salary_max"); return min !== undefined && max !== undefined ? `${min.toLocaleString()}–${max.toLocaleString()} salary range` : "Eligibility criteria"; }
function getNumber(value: unknown, key: string) { return typeof value === "object" && value !== null && typeof (value as Record<string, unknown>)[key] === "number" ? (value as Record<string, number>)[key] : undefined; }
