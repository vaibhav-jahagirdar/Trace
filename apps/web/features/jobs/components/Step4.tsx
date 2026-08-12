"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Check, Circle, Minus, Plus, Search } from "lucide-react";

import { EVALUATION_WEIGHT_POLICY, JOB_ROLE_POLICY } from "@trace/shared/contracts/evaluationPolicy";
import { useAuth } from "@/providers/auth-provider";
import { getEvaluationDimensions, type EvaluationDimension } from "@/features/jobs/api/step4";

const evaluationPrioritySchema = z.object({
    evaluation_dimension_id: z.string().uuid(),
    weight: z.number().int().min(EVALUATION_WEIGHT_POLICY.MIN_WEIGHT).max(EVALUATION_WEIGHT_POLICY.MAX_WEIGHT),
});

export const step4Schema = z.object({
    evaluation_priorities: z.array(evaluationPrioritySchema),
});

export type Step4Input = z.infer<typeof step4Schema>;
type EvaluationRole = keyof typeof JOB_ROLE_POLICY;

const WEIGHT_STEP = 5;

export function CreateJobStep4({
    role = "MID",
    initialData,
    onContinue,
    onBack,
}: {
    role?: EvaluationRole;
    initialData?: Record<string, unknown>;
    onContinue?: (data: Step4Input) => void;
    onBack?: () => void;
}) {
    const { activeOrg } = useAuth();
    const { data: dimensions = [], isLoading: dimensionsLoading, isError: dimensionsError } = useQuery({
        queryKey: ["evaluation-dimensions"],
        queryFn: getEvaluationDimensions,
        staleTime: 5 * 60_000,
    });
    const [search, setSearch] = useState("");

    const policy = JOB_ROLE_POLICY[role];
    const {
        handleSubmit,
        setValue,
        control,
        formState: { errors },
    } = useForm<Step4Input>({
        mode: "onChange",
        defaultValues: { evaluation_priorities: [] },
    });
    const values = useWatch({ control });
    const priorities = useMemo(
        () => (values.evaluation_priorities ?? []) as Step4Input["evaluation_priorities"],
        [values.evaluation_priorities],
    );
    const allocated = priorities.reduce((sum, priority) => sum + priority.weight, 0);
    const countValid = priorities.length >= policy.minDimensions && priorities.length <= policy.maxDimensions;
    const totalValid = allocated === EVALUATION_WEIGHT_POLICY.REQUIRED_TOTAL;

    useEffect(() => {
        const savedData = initialData;
        const savedPriorities = savedData?.evaluation_priorities;
        if (!Array.isArray(savedPriorities)) return;

        const parsed = z.array(evaluationPrioritySchema).safeParse(savedPriorities);
        if (parsed.success) setValue("evaluation_priorities", parsed.data, { shouldDirty: false, shouldValidate: true });
    }, [initialData, setValue]);

    const selectedIds = new Set(priorities.map((priority) => priority.evaluation_dimension_id));
    const selectedDimensions = priorities.map((priority) => ({
        ...priority,
        dimension: dimensions.find((dimension) => dimension.id === priority.evaluation_dimension_id),
    }));
    const availableDimensions = dimensions.filter((dimension) => !selectedIds.has(dimension.id) && dimension.name.toLowerCase().includes(search.trim().toLowerCase()));

    function addDimension(dimension: EvaluationDimension) {
        if (priorities.length >= policy.maxDimensions) return;
        setValue("evaluation_priorities", distributeWeights([...priorities, { evaluation_dimension_id: dimension.id, weight: 1 }]), { shouldDirty: true, shouldValidate: true });
        setSearch("");
    }

    function removeDimension(id: string) {
        setValue("evaluation_priorities", distributeWeights(priorities.filter((priority) => priority.evaluation_dimension_id !== id)), { shouldDirty: true, shouldValidate: true });
    }

    function adjustWeight(id: string, direction: "increase" | "decrease") {
        const adjusted = rebalanceWeight(priorities, id, direction === "increase" ? WEIGHT_STEP : -WEIGHT_STEP);
        if (adjusted) setValue("evaluation_priorities", adjusted, { shouldDirty: true, shouldValidate: true });
    }

    const onSubmit: SubmitHandler<Step4Input> = () => {
        if (!countValid || !totalValid) return;

        const parsed = step4Schema.safeParse({
            evaluation_priorities: priorities,
        });

        if (parsed.success) {
            onContinue?.(parsed.data);
        }
    };

    const canContinue = countValid && totalValid;
    const isValid = canContinue;

    return (
        <main className="min-h-svh bg-paper text-ink lg:grid lg:grid-cols-[4.5rem_minmax(0,1fr)]">
            <StepRail />
            <div className="min-w-0">
                <WorkspaceHeader orgName={activeOrg?.orgName} saveLabel="Ready" />
                <main className="px-6 pb-28 md:px-10 lg:px-14">
                    <div className="mx-auto max-w-7xl">
                        <section className="border-b border-forest/12 py-16 md:py-20">
                            <p className="font-mono text-sm uppercase tracking-[0.16em] text-olive">04 · Evaluation</p>
                            <div className="mt-6 grid gap-9 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-end">
                                <div>
                                    <h1 className="max-w-[19ch] text-5xl leading-[0.94] tracking-[-0.045em] md:text-6xl" style={{ fontFamily: "var(--font-primary)", fontWeight: 300 }}>
                                        Not every signal deserves equal weight.
                                    </h1>
                                    <p className="mt-5 max-w-[50ch] text-2xl font-light leading-snug text-olive" style={{ fontFamily: "var(--font-heading)" }}>
                                        A strong candidate isn&apos;t a collection of checkboxes. Tell Trace what should matter most when the evidence starts coming in.
                                    </p>
                                </div>
                                <p className="border-l border-forest/25 pl-6 text-base leading-relaxed text-olive">
                                    You already make these judgments in interviews. We&apos;re making them explicit before the interview—so the shortlist isn&apos;t driven by whoever wrote the best resume.
                                </p>
                            </div>
                            <p className="mt-10 border-t border-forest/12 pt-5 font-mono text-sm uppercase tracking-[0.14em] text-olive">Your weights must total 100. Trace uses them consistently across candidates.</p>
                        </section>

                        <div className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-20">
                            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                                <section aria-labelledby="lens-heading">
                                    <div className="flex flex-wrap items-end justify-between gap-6 border-b border-forest/12 pb-6">
                                        <div>
                                            <p className="font-mono text-sm uppercase tracking-[0.16em] text-forest">Your hiring lens</p>
                                            <h2 id="lens-heading" className="mt-3 text-3xl font-light tracking-[-0.035em]" style={{ fontFamily: "var(--font-primary)" }}>What matters most?</h2>
                                        </div>
                                        <AllocationStatus allocated={allocated} />
                                    </div>

                                    <AllocationBar value={allocated} />
                                    <p className="mt-5 max-w-[62ch] text-base leading-relaxed text-olive"><strong className="font-medium text-ink">100 points. No ambiguity.</strong> Give more weight to what would change your hiring decision; less to signals that are useful but not decisive.</p>

                                    <div className="mt-12 space-y-5">
                                        {selectedDimensions.map(({ dimension, ...priority }) => (
                                            <WeightRow
                                                key={priority.evaluation_dimension_id}
                                                name={dimension?.name ?? "Selected dimension"}
                                                description={dimension?.description ?? "Evaluation dimension selected for this role."}
                                                weight={priority.weight}
                                                onIncrease={() => adjustWeight(priority.evaluation_dimension_id, "increase")}
                                                onDecrease={() => adjustWeight(priority.evaluation_dimension_id, "decrease")}
                                                onRemove={() => removeDimension(priority.evaluation_dimension_id)}
                                                canIncrease={priorities.some((item) => item.evaluation_dimension_id !== priority.evaluation_dimension_id && item.weight > EVALUATION_WEIGHT_POLICY.MIN_WEIGHT)}
                                                canDecrease={priority.weight > EVALUATION_WEIGHT_POLICY.MIN_WEIGHT}
                                            />
                                        ))}
                                    </div>

                                    {priorities.length === 0 && <div className="mt-10 border-l-2 border-forest bg-warm px-6 py-6"><p className="text-xl font-light" style={{ fontFamily: "var(--font-heading)" }}>Start with what you would defend in an interview.</p><p className="mt-2 max-w-[58ch] text-base leading-relaxed text-olive">What separates a genuinely strong candidate from someone who simply looks good on paper?</p></div>}

                                    <DimensionLibrary
                                        dimensions={availableDimensions}
                                        search={search}
                                        loading={dimensionsLoading}
                                        failed={dimensionsError}
                                        atLimit={priorities.length >= policy.maxDimensions}
                                        onSearch={setSearch}
                                        onAdd={addDimension}
                                    />

                                    {!countValid && priorities.length > 0 && <p className="mt-8 border-l-2 border-destructive bg-destructive/5 px-5 py-4 text-base text-destructive" role="alert">Choose between {policy.minDimensions} and {policy.maxDimensions} dimensions for this {role.toLowerCase()} role.</p>}
                                    {!totalValid && priorities.length > 0 && <p className="mt-4 border-l-2 border-destructive bg-destructive/5 px-5 py-4 text-base text-destructive" role="alert">Weights must total {EVALUATION_WEIGHT_POLICY.REQUIRED_TOTAL} before continuing.</p>}
                                    {errors.evaluation_priorities && <p className="mt-4 text-base text-destructive" role="alert">{errors.evaluation_priorities.message}</p>}
                                </section>

                                <section className="mt-16 border-t border-forest/12 pt-8">
                                    <p className="font-serif text-3xl font-semibold italic leading-snug text-forest">One job. One definition of good.</p>
                                    <p className="mt-4 max-w-[65ch] text-base leading-relaxed text-olive">Trace doesn&apos;t eliminate hiring judgment. It makes the judgment explicit—and applies it consistently to every candidate.</p>
                                </section>

                                <footer className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-forest pt-7">
                                    <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-base text-olive transition-colors hover:text-forest"><ArrowLeft className="size-5" /> Requirements</button>
                                    <div className="text-right"><button type="submit" disabled={!isValid || !countValid || !totalValid} className="group inline-flex items-center gap-8 bg-forest px-6 py-4 font-mono text-sm uppercase tracking-[0.13em] text-paper transition-colors hover:bg-moss disabled:cursor-not-allowed disabled:opacity-45">Define the hiring lens<ArrowRight className="size-5 transition-transform group-hover:translate-x-1" /></button><p className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-olive">03 / 06 completed</p></div>
                                </footer>
                            </form>

                            <aside className="lg:pt-[4.25rem]"><div className="bg-forest p-8 text-paper lg:sticky lg:top-24"><Circle className="size-4 fill-sage text-sage" /><p className="mt-9 font-mono text-sm uppercase tracking-[0.16em] text-sage">Calibration</p><p className="mt-4 text-2xl font-light leading-tight" style={{ fontFamily: "var(--font-heading)" }}>{policy.minDimensions}–{policy.maxDimensions} dimensions for this role.</p><div className="mt-9 border-t border-paper/20 pt-6"><p className="font-mono text-sm uppercase tracking-[0.14em] text-sage">Selected</p><p className="mt-2 text-4xl font-light" style={{ fontFamily: "var(--font-heading)" }}>{priorities.length}</p><p className="mt-5 text-base leading-relaxed text-paper/70">Trace will use these priorities consistently when comparing candidates against the role.</p></div></div></aside>
                        </div>
                    </div>
                </main>
            </div>
        </main>
    );
}

function WeightRow({ name, description, weight, onIncrease, onDecrease, onRemove, canIncrease, canDecrease }: { name: string; description: string; weight: number; onIncrease: () => void; onDecrease: () => void; onRemove: () => void; canIncrease: boolean; canDecrease: boolean }) {
    return <article className="border border-forest/15 bg-warm p-6 sm:p-7"><div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"><div><h3 className="text-2xl font-light tracking-[-0.03em]" style={{ fontFamily: "var(--font-heading)" }}>{name}</h3><p className="mt-2 max-w-[52ch] text-base leading-relaxed text-olive">{description}</p></div><div className="flex items-center gap-3"><button type="button" disabled={!canDecrease} onClick={onDecrease} aria-label={`Decrease ${name} weight`} className="grid size-12 place-items-center border border-forest/25 text-forest transition-colors hover:bg-paper disabled:cursor-not-allowed disabled:opacity-30"><Minus className="size-5" /></button><span className="min-w-24 text-center font-mono text-3xl tabular-nums text-ink">{weight}%</span><button type="button" disabled={!canIncrease} onClick={onIncrease} aria-label={`Increase ${name} weight`} className="grid size-12 place-items-center border border-forest/25 text-forest transition-colors hover:bg-paper disabled:cursor-not-allowed disabled:opacity-30"><Plus className="size-5" /></button></div></div><div className="mt-6 flex items-center justify-between gap-6 border-t border-forest/12 pt-4"><div className="h-2 flex-1 bg-paper"><div className="h-full bg-forest transition-[width]" style={{ width: `${weight}%` }} /></div><button type="button" onClick={onRemove} className="text-sm text-olive transition-colors hover:text-destructive">Remove</button></div></article>;
}

function DimensionLibrary({ dimensions, search, loading, failed, atLimit, onSearch, onAdd }: { dimensions: EvaluationDimension[]; search: string; loading: boolean; failed: boolean; atLimit: boolean; onSearch: (value: string) => void; onAdd: (dimension: EvaluationDimension) => void }) {
    return <section className="mt-12 border-t border-forest/12 pt-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono text-sm uppercase tracking-[0.16em] text-forest">Available dimensions</p><p className="mt-2 text-base text-olive">Build the lens from the judgments you actually make.</p></div>{atLimit && <p className="text-base text-olive">You&apos;ve reached this role&apos;s dimension limit.</p>}</div><label className="relative mt-7 block"><Search className="pointer-events-none absolute left-0 top-1/2 size-5 -translate-y-1/2 text-olive" /><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search evaluation dimensions..." className="w-full border-0 border-b border-forest/25 bg-transparent py-4 pl-9 text-lg outline-none placeholder:text-olive/45 focus:border-forest" /></label><div className="mt-6 grid gap-4 sm:grid-cols-2">{loading ? <p className="text-base text-olive">Loading dimensions…</p> : failed ? <p className="text-base text-destructive">Couldn&apos;t load dimensions. Update the Step 4 API endpoint when it is ready.</p> : dimensions.length === 0 ? <p className="text-base text-olive">No dimensions match this search.</p> : dimensions.map((dimension) => <article key={dimension.id} className="border border-forest/15 p-5"><h3 className="text-xl font-light" style={{ fontFamily: "var(--font-heading)" }}>{dimension.name}</h3><p className="mt-2 min-h-12 text-sm leading-relaxed text-olive">{dimension.description}</p><button type="button" disabled={atLimit} onClick={() => onAdd(dimension)} className="mt-5 font-mono text-sm uppercase tracking-[0.13em] text-forest transition-opacity hover:opacity-65 disabled:cursor-not-allowed disabled:opacity-35">+ Add dimension</button></article>)}</div></section>;
}

function AllocationStatus({ allocated }: { allocated: number }) { const remaining = EVALUATION_WEIGHT_POLICY.REQUIRED_TOTAL - allocated; const label = allocated === 100 ? "100% allocated" : allocated > 100 ? `${allocated}% — reduce ${Math.abs(remaining)}%` : `${allocated}% allocated · ${remaining}% remaining`; return <p className={`font-mono text-sm uppercase tracking-[0.13em] ${allocated === 100 ? "text-forest" : "text-olive"}`}>{label}</p>; }
function AllocationBar({ value }: { value: number }) { return <div className="mt-7 h-4 overflow-hidden bg-stone"><div className="h-full bg-forest transition-[width]" style={{ width: `${Math.min(value, 100)}%` }} /></div>; }

function WorkspaceHeader({ orgName, saveLabel }: { orgName?: string; saveLabel: string }) { return <header className="sticky top-0 z-20 border-b border-forest/12 bg-paper/95 px-6 py-6 backdrop-blur md:px-10 lg:px-14"><div className="mx-auto flex max-w-7xl items-baseline justify-between gap-6"><span className="font-mono text-sm font-medium uppercase tracking-[0.18em] text-forest lg:hidden">Trace</span><span className="hidden font-mono text-sm uppercase tracking-[0.15em] text-olive sm:block">{orgName ?? "Hiring workspace"} · Step 4 of 6</span><span className="ml-auto flex items-center gap-2 font-mono text-sm uppercase tracking-[0.14em] text-olive"><Check className="size-4 text-forest" />{saveLabel}</span></div></header>; }
function StepRail() { return <aside className="hidden border-r border-forest/12 bg-warm lg:flex lg:flex-col lg:items-center lg:py-6"><span className="grid size-8 place-items-center border border-forest/30 font-mono text-xs text-forest">T</span><div className="mt-24 flex flex-1 flex-col items-center gap-4"><span className="font-mono text-[10px] text-olive/40">01</span><span className="font-mono text-[10px] text-olive/40">02</span><span className="font-mono text-[10px] text-olive/40">03</span><span className="h-14 w-px bg-forest" /><span className="font-mono text-[10px] text-forest">04</span><span className="font-mono text-[10px] text-olive/40">05</span><span className="font-mono text-[10px] text-olive/40">06</span></div><span className="[writing-mode:vertical-rl] font-mono text-[9px] uppercase tracking-[0.2em] text-olive">Hiring lens</span></aside>; }

function distributeWeights(priorities: Step4Input["evaluation_priorities"]) { if (!priorities.length) return []; const base = Math.floor(EVALUATION_WEIGHT_POLICY.REQUIRED_TOTAL / priorities.length); const remainder = EVALUATION_WEIGHT_POLICY.REQUIRED_TOTAL % priorities.length; return priorities.map((priority, index) => ({ ...priority, weight: base + (index < remainder ? 1 : 0) })); }
function rebalanceWeight(priorities: Step4Input["evaluation_priorities"], targetId: string, delta: number) { const target = priorities.find((priority) => priority.evaluation_dimension_id === targetId); if (!target || priorities.length < 2) return null; if (delta < 0 && target.weight + delta < EVALUATION_WEIGHT_POLICY.MIN_WEIGHT) return null; const donors = priorities.filter((priority) => priority.evaluation_dimension_id !== targetId).sort((a, b) => b.weight - a.weight); if (delta > 0 && donors.reduce((sum, priority) => sum + Math.max(0, priority.weight - EVALUATION_WEIGHT_POLICY.MIN_WEIGHT), 0) < delta) return null; let remaining = Math.abs(delta); const next = priorities.map((priority) => ({ ...priority })); if (delta > 0) { for (const donor of donors) { const item = next.find((priority) => priority.evaluation_dimension_id === donor.evaluation_dimension_id)!; const move = Math.min(remaining, item.weight - EVALUATION_WEIGHT_POLICY.MIN_WEIGHT); item.weight -= move; remaining -= move; if (!remaining) break; } } else { const recipients = next.filter((priority) => priority.evaluation_dimension_id !== targetId).sort((a, b) => a.weight - b.weight); recipients[0]!.weight += remaining; } next.find((priority) => priority.evaluation_dimension_id === targetId)!.weight += delta; return next; }
