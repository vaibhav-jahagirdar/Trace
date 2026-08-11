"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Check, Circle, Search, X } from "lucide-react";

import { JOB_ROLE_POLICY, type JobRole } from "@trace/shared/contracts/jobpolicy";
import { useAuth } from "@/providers/auth-provider";
import { useGetDraft, useSaveDraft } from "@/features/jobs/hooks/use-job-draft";
import { getRequirementLookups, type RequirementLookupItem } from "@/features/jobs/api/step3";

const prioritySchema = z.enum(["MANDATORY", "PREFERRED", "BONUS"]);
const requirementSchema = z.discriminatedUnion("requirement_type", [
  z.object({ requirement_type: z.literal("TECHNOLOGY"), technology_id: z.string().uuid(), priority_type: prioritySchema }),
  z.object({ requirement_type: z.literal("CONCEPT"), concept_id: z.string().uuid(), priority_type: prioritySchema }),
]);

export const step3Schema = z
  .object({ requirements: z.array(requirementSchema).min(1, "Add at least one technology or concept.") })
  .superRefine((data, context) => {
    if (!data.requirements.some((requirement) => requirement.requirement_type === "CONCEPT")) {
      context.addIssue({ code: "custom", path: ["requirements"], message: "Select at least one concept before continuing." });
    }
    if (!data.requirements.some((requirement) => requirement.priority_type === "PREFERRED")) {
      context.addIssue({ code: "custom", path: ["requirements"], message: "Add at least one preferred requirement." });
    }
  });

export type Step3Input = z.infer<typeof step3Schema>;
type RequirementType = "TECHNOLOGY" | "CONCEPT";
type Priority = z.infer<typeof prioritySchema>;

const PRIORITIES: { value: Priority; label: string; description: string }[] = [
  { value: "MANDATORY", label: "Mandatory", description: "They should have this." },
  { value: "PREFERRED", label: "Preferred", description: "A strong signal, not a blocker." },
  { value: "BONUS", label: "Bonus", description: "Useful additional evidence." },
];

const typeLabel: Record<RequirementType, string> = { TECHNOLOGY: "Technology", CONCEPT: "Concept" };
const typePlural: Record<RequirementType, string> = { TECHNOLOGY: "Technologies", CONCEPT: "Concepts" };

export function CreateJobStep3({
  role = "MID",
  initialData,
  onContinue,
  onBack,
}: {
  role?: JobRole;
  initialData?: Record<string, unknown>;
  onContinue?: (data: Step3Input) => void;
  onBack?: () => void;
}) {
  const { activeOrg } = useAuth();
  const orgId = activeOrg?.orgId;
  const { data: draft, isLoading: draftLoading } = useGetDraft(orgId);
  const saveDraftMutation = useSaveDraft(orgId);
  const { data: lookups, isLoading: lookupsLoading, isError: lookupsError } = useQuery({
    queryKey: ["job-requirement-lookups"],
    queryFn: getRequirementLookups,
    staleTime: 5 * 60_000,
  });
  const [autoSaveLabel, setAutoSaveLabel] = useState("Saved");
  const [activeType, setActiveType] = useState<RequirementType>("TECHNOLOGY");
  const [pickerPriority, setPickerPriority] = useState<Priority | null>(null);
  const [selectedItem, setSelectedItem] = useState<RequirementLookupItem | null>(null);
  const [search, setSearch] = useState("");

  const {
    handleSubmit,
    setValue,
    control,
    formState: { errors, isDirty, isValid },
  } = useForm<Step3Input>({
    resolver: zodResolver(step3Schema),
    mode: "onChange",
    defaultValues: { requirements: [] },
  });
  const values = useWatch({ control });
  const requirements = useMemo(
    () => (values.requirements ?? []) as Step3Input["requirements"],
    [values.requirements],
  );
  const hasConcept = requirements.some((requirement) => requirement.requirement_type === "CONCEPT");
  const rolePolicy = JOB_ROLE_POLICY[role];
  const counts = useMemo(() => countPriorities(requirements), [requirements]);
  const limits = {
    MANDATORY: rolePolicy.requirements.mandatory,
    PREFERRED: counts.MANDATORY > 0 ? rolePolicy.requirements.preferred : rolePolicy.requirements.preferredWithoutMandatory,
    BONUS: rolePolicy.requirements.bonus,
  } as const;

  useEffect(() => {
    const savedData = (initialData ?? draft?.formData?.step3 ?? draft?.formData) as Record<string, unknown> | undefined;
    const savedRequirements = savedData?.requirements;
    if (!Array.isArray(savedRequirements)) return;

    const parsed = z.array(requirementSchema).safeParse(savedRequirements);
    if (parsed.success) setValue("requirements", parsed.data, { shouldDirty: false, shouldValidate: true });
  }, [draft, initialData, setValue]);

  useEffect(() => {
    if (!isDirty || !orgId) return;

    const timeout = setTimeout(() => {
      setAutoSaveLabel("Saving");
      saveDraftMutation.mutate(
        { formData: { step3: { requirements } }, currentStep: 3 },
        { onSuccess: () => setAutoSaveLabel("Saved"), onError: () => setAutoSaveLabel("Not saved") },
      );
    }, 800);

    return () => clearTimeout(timeout);
  }, [requirements, isDirty, orgId, saveDraftMutation]);

  const items = activeType === "TECHNOLOGY" ? lookups?.technologies ?? [] : lookups?.concepts ?? [];
  const availableItems = items.filter((item) => !hasRequirement(requirements, activeType, item.id));
  const matchingItems = availableItems.filter((item) => item.name.toLowerCase().includes(search.trim().toLowerCase()));

  function openPicker(priority: Priority) {
    setPickerPriority(priority);
    setSelectedItem(null);
    setSearch("");
  }

  function closePicker() {
    setPickerPriority(null);
    setSelectedItem(null);
    setSearch("");
  }

  function addRequirement() {
    if (!selectedItem || !pickerPriority || counts[pickerPriority] >= limits[pickerPriority]) return;

    const next = activeType === "TECHNOLOGY"
      ? { requirement_type: "TECHNOLOGY" as const, technology_id: selectedItem.id, priority_type: pickerPriority }
      : { requirement_type: "CONCEPT" as const, concept_id: selectedItem.id, priority_type: pickerPriority };
    setValue("requirements", [...requirements, next], { shouldDirty: true, shouldValidate: true });
    closePicker();
  }

  function removeRequirement(type: RequirementType, id: string) {
    setValue("requirements", requirements.filter((requirement) => !matchesRequirement(requirement, type, id)), { shouldDirty: true, shouldValidate: true });
  }

  const onSubmit: SubmitHandler<Step3Input> = (data) => {
    onContinue?.(data);
    saveDraftMutation.mutate({ formData: { step3: data }, currentStep: 4 });
  };

  if (draftLoading) {
    return <div className="grid min-h-svh place-items-center bg-paper font-mono text-[11px] uppercase tracking-[0.2em] text-olive">Opening technical bar</div>;
  }

  return (
    <main className="min-h-svh bg-paper text-ink lg:grid lg:grid-cols-[4.5rem_minmax(0,1fr)]">
      <StepRail />
      <div className="min-w-0">
        <WorkspaceHeader orgName={activeOrg?.orgName} saveLabel={autoSaveLabel} />
        <main className="px-6 pb-28 md:px-10 lg:px-14">
          <div className="mx-auto max-w-7xl">
            <section className="border-b border-forest/12 py-16 md:py-20">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-olive">03 · Define the technical bar</p>
              <div className="mt-6 grid gap-9 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-end">
                <div>
                  <h1 className="max-w-[20ch] text-4xl leading-[0.96] tracking-[-0.045em] md:text-5xl" style={{ fontFamily: "var(--font-primary)", fontWeight: 300 }}>
                    What does someone actually need to bring to this job?
                  </h1>
                  <p className="mt-4 max-w-[48ch] text-xl font-light leading-snug text-olive" style={{ fontFamily: "var(--font-primary)" }}>
                    Most hiring systems collect keywords. Trace needs to know what should actually count.
                  </p>
                </div>
                <p className="border-l border-forest/25 pl-5 text-sm leading-relaxed text-olive">
                  Mark every requirement as mandatory, preferred, or bonus. Trace handles the scoring behind the scenes.
                </p>
              </div>
            </section>

            <div className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1fr)_14rem] lg:gap-20">
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <section aria-labelledby="bar-heading">
                  <div className="flex flex-wrap items-end justify-between gap-5 border-b border-forest/12 pb-5">
                    <div>
                      <p className="font-mono text-sm uppercase tracking-[0.16em] text-forest">Requirements workspace</p>
                      <h2 id="bar-heading" className="mt-3 text-3xl font-light tracking-[-0.035em]" style={{ fontFamily: "var(--font-heading)" }}>What matters for this role?</h2>
                    </div>
                    <p className="font-mono text-sm uppercase tracking-[0.14em] text-olive">{rolePolicy.label} calibration</p>
                  </div>

                  <div className="mt-8 flex border-b border-forest/12">
                    {(["TECHNOLOGY", "CONCEPT"] as RequirementType[]).map((type) => (
                      <button key={type} type="button" onClick={() => { setActiveType(type); closePicker(); }} className={`border-b-2 px-5 py-4 font-mono text-sm uppercase tracking-[0.15em] transition-colors ${activeType === type ? "border-forest text-forest" : "border-transparent text-olive hover:text-ink"}`}>
                        {typePlural[type]}
                      </button>
                    ))}
                  </div>

                  <div className="mt-10 space-y-9">
                    {PRIORITIES.map((priority) => (
                      <RequirementGroup
                        key={priority.value}
                        priority={priority}
                        type={activeType}
                        requirements={requirements}
                        items={items}
                        count={counts[priority.value]}
                        limit={limits[priority.value]}
                        onAdd={() => openPicker(priority.value)}
                        onRemove={(id) => removeRequirement(activeType, id)}
                      />
                    ))}
                  </div>

                  {!hasConcept && <p className="mt-8 border-l-2 border-destructive bg-destructive/5 px-5 py-4 text-base text-destructive" role="alert">Select at least one concept before continuing.</p>}
                  {errors.requirements && hasConcept && <p className="mt-8 border-l-2 border-destructive bg-destructive/5 px-5 py-4 text-base text-destructive" role="alert">{errors.requirements.message}</p>}

                  {pickerPriority && (
                    <RequirementPicker
                      type={activeType}
                      priority={pickerPriority}
                      items={matchingItems}
                      search={search}
                      selectedItem={selectedItem}
                      loading={lookupsLoading}
                      failed={lookupsError}
                      atLimit={counts[pickerPriority] >= limits[pickerPriority]}
                      onSearch={setSearch}
                      onSelect={setSelectedItem}
                      onPriority={setPickerPriority}
                      onClose={closePicker}
                      onAdd={addRequirement}
                    />
                  )}
                </section>

                <section className="mt-16 border-t border-forest/12 pt-8">
                  <p className="font-serif text-2xl font-semibold italic leading-snug text-forest">A candidate mentioning a technology isn&apos;t proof they can use it.</p>
                  <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-olive">Tell Trace what matters before candidates arrive. That gives every candidate the same technical definition instead of making you rebuild the criteria while reading resumes and projects.</p>
                </section>

                <footer className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-forest pt-7">
                  <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-base text-olive transition-colors hover:text-forest"><ArrowLeft className="size-5" /> Back</button>
                  <div className="text-right">
                    <button type="submit" disabled={!isValid || !hasConcept} className="group inline-flex items-center gap-8 bg-forest px-6 py-4 font-mono text-sm uppercase tracking-[0.14em] text-paper transition-colors hover:bg-moss disabled:cursor-not-allowed disabled:opacity-45">
                      Continue<ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                    </button>
                    <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-olive">Next: decide what evidence carries weight</p>
                  </div>
                </footer>
              </form>

              <TechnicalBarSummary requirements={requirements} roleLabel={rolePolicy.label} />
            </div>
          </div>
        </main>
      </div>
    </main>
  );
}

function RequirementGroup({ priority, type, requirements, items, count, limit, onAdd, onRemove }: {
  priority: (typeof PRIORITIES)[number]; type: RequirementType; requirements: Step3Input["requirements"]; items: RequirementLookupItem[]; count: number; limit: number; onAdd: () => void; onRemove: (id: string) => void;
}) {
  const selected = requirements.filter((requirement) => requirement.requirement_type === type && requirement.priority_type === priority.value);
  return <section className="border-t border-forest/12 pt-7"><div className="flex items-baseline justify-between gap-5"><div><p className="font-mono text-sm uppercase tracking-[0.16em] text-forest">{priority.label}</p><p className="mt-2 text-base text-olive">{priority.description}</p></div><p className={`font-mono text-sm tabular-nums ${count >= limit ? "text-primary" : "text-olive"}`}>{count} of {limit} slots used</p></div><div className="mt-6 flex flex-wrap gap-3">{selected.map((requirement) => { const id = requirement.requirement_type === "TECHNOLOGY" ? requirement.technology_id : requirement.concept_id; const item = items.find((candidate) => candidate.id === id); return <span key={id} className="inline-flex items-center gap-3 border border-forest/20 bg-warm px-4 py-3 text-base text-ink">{item?.name ?? "Selected requirement"}<button type="button" onClick={() => onRemove(id)} aria-label={`Remove ${item?.name ?? "requirement"}`} className="text-olive transition-colors hover:text-destructive"><X className="size-4" /></button></span>; })}</div><button type="button" disabled={count >= limit} onClick={onAdd} className="mt-5 font-mono text-sm uppercase tracking-[0.13em] text-forest transition-opacity hover:opacity-65 disabled:cursor-not-allowed disabled:opacity-35">+ Add {typeLabel[type].toLowerCase()}</button>{count >= limit && <p className="mt-3 text-sm text-olive">Keep the bar focused. This priority is at its limit.</p>}</section>;
}

function RequirementPicker({ type, priority, items, search, selectedItem, loading, failed, atLimit, onSearch, onSelect, onPriority, onClose, onAdd }: { type: RequirementType; priority: Priority; items: RequirementLookupItem[]; search: string; selectedItem: RequirementLookupItem | null; loading: boolean; failed: boolean; atLimit: boolean; onSearch: (value: string) => void; onSelect: (item: RequirementLookupItem) => void; onPriority: (priority: Priority) => void; onClose: () => void; onAdd: () => void }) {
  return <section className="mt-12 border border-forest/25 bg-warm p-7 sm:p-8" aria-label={`Add ${typeLabel[type]}`}><div className="flex items-center justify-between gap-4"><div><p className="font-mono text-sm uppercase tracking-[0.16em] text-forest">Add {typeLabel[type]}</p><p className="mt-2 text-base text-olive">Choose the requirement, then its importance.</p></div><button type="button" onClick={onClose} aria-label="Close picker" className="text-olive hover:text-ink"><X className="size-5" /></button></div><label className="relative mt-7 block"><Search className="pointer-events-none absolute left-0 top-1/2 size-5 -translate-y-1/2 text-olive" /><input value={search} onChange={(event) => onSearch(event.target.value)} autoFocus placeholder={`Search ${typePlural[type].toLowerCase()}...`} className="w-full border-0 border-b border-forest/25 bg-transparent py-4 pl-9 text-lg outline-none placeholder:text-olive/45 focus:border-forest" /></label><div className="mt-4 max-h-60 overflow-y-auto border-b border-forest/12">{loading ? <p className="py-5 text-base text-olive">Loading lookup options…</p> : failed ? <p className="py-5 text-base text-destructive">Couldn&apos;t load lookup options. Update the endpoint in the Step 3 API file when it is available.</p> : items.length === 0 ? <p className="py-5 text-base text-olive">No matching {typePlural[type].toLowerCase()} available.</p> : items.map((item) => <button key={item.id} type="button" onClick={() => onSelect(item)} className={`block w-full border-t border-forest/10 px-2 py-4 text-left text-base transition-colors ${selectedItem?.id === item.id ? "bg-paper text-forest" : "text-ink hover:bg-paper"}`}><span>{item.name}</span>{(item.category || item.description) && <span className="ml-2 text-sm text-olive">{item.category ?? item.description}</span>}</button>)}</div><div className="mt-7"><p className="font-mono text-sm uppercase tracking-[0.16em] text-forest">How important is it?</p><div className="mt-4 grid gap-3 sm:grid-cols-3">{PRIORITIES.map((option) => <button key={option.value} type="button" onClick={() => onPriority(option.value)} className={`border p-4 text-left transition-colors ${priority === option.value ? "border-forest bg-forest text-paper" : "border-forest/20 text-olive hover:border-forest/50"}`}><span className="block text-base font-medium">{option.label}</span><span className={`mt-2 block text-sm leading-snug ${priority === option.value ? "text-paper/70" : "text-olive"}`}>{option.description}</span></button>)}</div></div><div className="mt-7 flex items-center justify-end gap-6"><button type="button" onClick={onClose} className="text-base text-olive hover:text-ink">Cancel</button><button type="button" onClick={onAdd} disabled={!selectedItem || atLimit} className="inline-flex items-center gap-2 bg-forest px-5 py-4 font-mono text-sm uppercase tracking-[0.13em] text-paper disabled:cursor-not-allowed disabled:opacity-45">Add requirement <Check className="size-4" /></button></div></section>;
}

function TechnicalBarSummary({ requirements, roleLabel }: { requirements: Step3Input["requirements"]; roleLabel: string }) {
  return <aside className="lg:pt-[3.55rem]"><div className="bg-forest p-8 text-paper lg:sticky lg:top-24"><Circle className="size-4 fill-sage text-sage" aria-hidden="true" /><p className="mt-9 font-mono text-sm uppercase tracking-[0.16em] text-sage">Your technical bar</p><p className="mt-4 text-2xl font-light" style={{ fontFamily: "var(--font-heading)" }}>{roleLabel} role</p><div className="mt-9 space-y-6 border-t border-paper/20 pt-6">{PRIORITIES.map((priority) => <div key={priority.value}><p className="font-mono text-sm uppercase tracking-[0.14em] text-sage">{priority.label}</p><p className="mt-2 text-base text-paper/80">{countByType(requirements, priority.value, "TECHNOLOGY")} technologies · {countByType(requirements, priority.value, "CONCEPT")} concepts</p></div>)}</div><p className="mt-9 border-t border-paper/20 pt-6 text-base leading-relaxed text-paper/65">Trace will use this definition when comparing candidates against the role.</p></div></aside>;
}

function StepRail() { return <aside className="hidden border-r border-forest/12 bg-warm lg:flex lg:flex-col lg:items-center lg:py-6"><span className="grid size-8 place-items-center border border-forest/30 font-mono text-xs text-forest">T</span><div className="mt-24 flex flex-1 flex-col items-center gap-4"><span className="font-mono text-[10px] text-olive/40">01</span><span className="font-mono text-[10px] text-olive/40">02</span><span className="h-14 w-px bg-forest" /><span className="font-mono text-[10px] text-forest">03</span><span className="font-mono text-[10px] text-olive/40">04</span></div><span className="[writing-mode:vertical-rl] font-mono text-[9px] uppercase tracking-[0.2em] text-olive">Technical bar</span></aside>; }

function WorkspaceHeader({ orgName, saveLabel }: { orgName?: string; saveLabel: string }) { return <header className="sticky top-0 z-20 border-b border-forest/12 bg-paper/95 px-6 py-6 backdrop-blur md:px-10 lg:px-14"><div className="mx-auto flex max-w-7xl items-baseline justify-between gap-6"><span className="font-mono text-sm font-medium uppercase tracking-[0.18em] text-forest lg:hidden">Trace</span><span className="hidden font-mono text-sm uppercase tracking-[0.15em] text-olive sm:block">{orgName ?? "Hiring workspace"} · Step 3 of 6</span><span className="ml-auto flex items-center gap-2 font-mono text-sm uppercase tracking-[0.14em] text-olive"><Check className="size-4 text-forest" />{saveLabel}</span></div></header>; }

function countPriorities(requirements: Step3Input["requirements"]) { return { MANDATORY: requirements.filter((item) => item.priority_type === "MANDATORY").length, PREFERRED: requirements.filter((item) => item.priority_type === "PREFERRED").length, BONUS: requirements.filter((item) => item.priority_type === "BONUS").length }; }
function countByType(requirements: Step3Input["requirements"], priority: Priority, type: RequirementType) { return requirements.filter((item) => item.priority_type === priority && item.requirement_type === type).length; }
function matchesRequirement(requirement: Step3Input["requirements"][number], type: RequirementType, id: string) {
  if (requirement.requirement_type === "TECHNOLOGY") return type === "TECHNOLOGY" && requirement.technology_id === id;
  return type === "CONCEPT" && requirement.concept_id === id;
}
function hasRequirement(requirements: Step3Input["requirements"], type: RequirementType, id: string) { return requirements.some((requirement) => matchesRequirement(requirement, type, id)); }
