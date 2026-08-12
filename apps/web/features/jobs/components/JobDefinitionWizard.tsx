
"use client";

import { useState } from "react";
import type { JobRole } from "@trace/shared/contracts/jobpolicy";

import { CreateJobStep1 } from "@/features/jobs/components/CreateJobStep1";
import { CreateJobStep2 } from "@/features/jobs/components/Step2";
import { CreateJobStep3 } from "@/features/jobs/components/Step3";
import { CreateJobStep4 } from "@/features/jobs/components/Step4";
import { CreateJobStep5 } from "@/features/jobs/components/Step5";
import { CreateJobStep6 } from "@/features/jobs/components/Step6";
import {
  CreateJobStep7,
  type JobDefinitionDraft,
  type SubmissionRequirements,
} from "@/features/jobs/components/Step7";
import {
  useGetDraft,
  useSaveDraft,
  useSubmitJob,
} from "@/features/jobs/hooks/use-job-draft";

const STEPS = [
  "Role",
  "Eligibility",
  "Technical bar",
  "Hiring lens",
  "Evidence plan",
  "Success signals",
  "Review",
];

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

type JobDefinitionWizardProps = {
  orgId: string;
};

export function JobDefinitionWizard({
  orgId,
}: JobDefinitionWizardProps) {
  const { data: draft } = useGetDraft(orgId);
  const saveDraftMutation = useSaveDraft(orgId);
  const submitJobMutation = useSubmitJob(orgId);

  const [step, setStep] = useState<WizardStep>(1);
  const [formData, setFormData] = useState<JobDefinitionDraft>({});
  const [created, setCreated] = useState(false);
  const [hasLocalNavigation, setHasLocalNavigation] = useState(false);

  const currentStep = hasLocalNavigation
    ? step
    : draft
      ? clampStep(draft.currentStep)
      : step;

  const currentFormData = hasLocalNavigation
    ? formData
    : draft?.formData ?? formData;

  const role = getRole(currentFormData);

  const stepData = (number: number) => {
    const value = currentFormData[`step${number}`];

    return typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : undefined;
  };

  function completeStep(completedStep: WizardStep, data: unknown) {
    const nextFormData = {
      ...currentFormData,
      [`step${completedStep}`]: data,
    };

    const nextStep = clampStep(completedStep + 1);

    setFormData(nextFormData);
    setHasLocalNavigation(true);
    setStep(nextStep);

    saveDraftMutation.mutate({
      formData: nextFormData,
      currentStep: nextStep,
    });
  }

  function createReviewedJob(submissionRequirements: SubmissionRequirements) {
    const step1 = stepData(1);
    const step2 = stepData(2);
    const step3 = stepData(3);
    const step4 = stepData(4);
    const step5 = stepData(5);
    const step6 = stepData(6);

    if (
      !draft?.id ||
      !step1 ||
      !step2 ||
      !step3 ||
      !step4 ||
      !step5 ||
      !step6
    ) {
      return;
    }

    const jobData = { ...step1 };

    delete jobData.role_category_code;

    submitJobMutation.mutate(
      {
        draftId: draft.id,
        ...jobData,
        eligibility: step2,
        submission_requirements: submissionRequirements,
        requirements: step3.requirements,
        evaluation_priorities: step4.evaluation_priorities,
        evidence_priorities: step5.evidence_priorities,
        success_signals: step6.success_signals,
      },
      {
        onSuccess: () => setCreated(true),
      },
    );
  }

  function goToStep(nextStep: number) {
    setFormData(currentFormData);
    setHasLocalNavigation(true);
    setStep(clampStep(nextStep));
  }

  return (
    <div className="min-h-svh bg-paper lg:grid lg:grid-cols-[4.5rem_minmax(0,1fr)]">
      <WizardRail currentStep={currentStep} />

      <div className="min-w-0 [&>main]:block [&>main>aside:first-child]:hidden">
        {currentStep === 1 && (
          <CreateJobStep1
            initialData={stepData(1)}
            onContinue={(data) => completeStep(1, data)}
          />
        )}

        {currentStep === 2 && (
          <CreateJobStep2
            role={role}
            initialData={stepData(2)}
            onBack={() => goToStep(1)}
            onContinue={(data) => completeStep(2, data)}
          />
        )}

        {currentStep === 3 && (
          <CreateJobStep3
            role={role}
            initialData={stepData(3)}
            onBack={() => goToStep(2)}
            onContinue={(data) => completeStep(3, data)}
          />
        )}

        {currentStep === 4 && (
          <CreateJobStep4
            role={role}
            initialData={stepData(4)}
            onBack={() => goToStep(3)}
            onContinue={(data) => completeStep(4, data)}
          />
        )}

        {currentStep === 5 && (
          <CreateJobStep5
            role={role}
            initialData={stepData(5)}
            onBack={() => goToStep(4)}
            onContinue={(data) => completeStep(5, data)}
          />
        )}

        {currentStep === 6 && (
          <CreateJobStep6
            role={role}
            initialData={stepData(6)}
            onBack={() => goToStep(5)}
            onComplete={(data) => completeStep(6, data)}
          />
        )}

        {currentStep === 7 && (
          <CreateJobStep7
            formData={currentFormData}
            onEdit={goToStep}
            onCreateJob={createReviewedJob}
            isCreating={submitJobMutation.isPending}
            created={created}
          />
        )}
      </div>
    </div>
  );
}

function clampStep(step: number): WizardStep {
  if (!Number.isFinite(step)) {
    return 1;
  }

  return Math.min(
    Math.max(Math.trunc(step), 1),
    7,
  ) as WizardStep;
}

function getRole(formData: JobDefinitionDraft): JobRole {
  const step1 = formData.step1;

  const code =
    typeof step1 === "object" && step1 !== null
      ? (step1 as Record<string, unknown>).role_category_code
      : undefined;

  const normalized =
    typeof code === "string"
      ? code.trim().toUpperCase()
      : "";

  return isJobRole(normalized) ? normalized : "MID";
}

function isJobRole(value: string): value is JobRole {
  return [
    "INTERN",
    "FRESHER",
    "JUNIOR",
    "MID",
    "SENIOR",
    "STAFF",
    "PRINCIPAL",
  ].includes(value);
}

function WizardRail({
  currentStep,
}: {
  currentStep: WizardStep;
}) {
  return (
    <aside className="hidden border-r border-forest/12 bg-warm lg:flex lg:flex-col lg:items-center lg:py-6">
      <span className="grid size-8 place-items-center border border-forest/30 font-mono text-xs text-forest">
        T
      </span>

      <div className="mt-20 flex flex-1 flex-col items-center gap-3">
        {STEPS.map((label, index) => {
          const number = index + 1;
          const active = number === currentStep;
          const complete = number < currentStep;

          return (
            <div
              key={label}
              className="flex flex-col items-center gap-2"
            >
              <span
                className={`grid size-6 place-items-center rounded-full border font-mono text-[10px] transition-colors ${
                  active
                    ? "border-forest bg-forest text-paper"
                    : complete
                      ? "border-forest/35 text-forest"
                      : "border-forest/15 text-olive/45"
                }`}
              >
                {complete
                  ? "✓"
                  : String(number).padStart(2, "0")}
              </span>

              {number < STEPS.length && (
                <span
                  className={`h-5 w-px ${
                    complete
                      ? "bg-forest"
                      : "bg-forest/15"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      <span className="[writing-mode:vertical-rl] font-mono text-[9px] uppercase tracking-[0.2em] text-olive">
        Hiring definition
      </span>
    </aside>
  );
}
