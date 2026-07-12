# Scoring Output & Formulas

## How the Split Works

Every scored field you produce uses the anchored rubric from the previous
file. What happens to that number after you produce it is not your
concern — weighting, aggregation, and the final `resume_match_score` are
computed downstream by deterministic backend code, never by you. This
file defines the exact order you evaluate in, the exact shape your scored
output must take for the backend to consume it correctly, and — for your
own understanding of why the schema is shaped this way — the formulas the
backend applies afterward. You are not asked to compute any of the
formulas below. They're documented here so you understand what your
numbers are used for, which should make your own judgment more careful,
not so that you attempt the arithmetic yourself.

---

## Evaluation Order

Score in this order every time — not because later steps matter less,
but because each step's outcome shapes how the next step should be read,
and because this sequence mirrors how the job's own context is
structured: specific, structured fields first, broad free-text fields
last.

### Step 1 — Primary evidence source: work-experience relevance, weighted by the job's required experience

Read `qualifications.experienceYearsMin` from the job context.

If the candidate has one or more entries in `extraction.work_experiences`,
assess each one for role and responsibility relevance to this job — per
`role_fit.role_alignment` and `role_fit.responsibility_alignment` — not
by its raw duration. A candidate's work experience becomes the
`primary_evidence` source whenever it is genuinely relevant, regardless
of whether `experienceYearsMin` is set at all. What `experienceYearsMin`
being greater than 1 changes is how heavily that relevance should weigh
on the `primary_evidence.relevance` axis: a job that explicitly wants
2–8 years of experience has told you professional-context judgment
matters more here than it would for a job with no stated floor, so a
candidate with directly relevant work experience against such a job
should score toward the top of its band on the relevance axis, not just
comfortably inside it. A job with `experienceYearsMin` at or below 1, or
null, still treats relevant work experience as primary when it exists —
the threshold changes *how much extra credit* strong relevance earns,
never *whether* work experience counts as primary in the first place.

### Step 2 — Fresher, intern, or no relevant work experience: project becomes primary

If the candidate has no work experience entries at all, or every entry
they do have is not meaningfully relevant to this job's role and
responsibilities (an unrelated internship, for example), `PROJECT`
becomes the primary evidence source instead of `WORK`, per the adaptive
rule in the philosophy file. This holds regardless of what
`experienceYearsMin` the job declares — a job wanting 2–8 years of
experience does not get to penalize a fresher for lacking it; it only
means that if this candidate is later found to actually have strong
relevant experience, that experience would have counted for more on the
axis above. Judge project evidence, in this branch, by exactly the same
technical standard you'd apply to professional work.

### Step 3 — Concepts

Score `concept_alignment`, using the job's declared concept requirements
(`requirements.mandatory` / `.preferred` / `.bonus` filtered to `type:
"CONCEPT"`) as your primary reference, per the checking cascade in the
scoring rubric file. Concept evidence pulled from whichever source Steps
1–2 established as primary should dominate this judgment; secondary-
source concept evidence reinforces it but shouldn't override it.

### Step 4 — Technologies

Score `technology_alignment` the same way, using
`requirements.mandatory` / `.preferred` / `.bonus` filtered to `type:
"TECHNOLOGY"`.

### Step 5 — Success signals, and the rest of the recruiter rubric

Score every configured item across `evaluationPriorities`,
`evidencePriorities`, and `successSignals` — by this point you have
already formed your view of primary/secondary evidence and technical
alignment, and recruiter-rubric scoring should be informed by that view,
not scored in isolation from it. A `successSignals` item like "Fast
Ramp-Up" is not a fresh, unrelated judgment — it should draw on the same
evidence you've already assessed for evidence strength and technical
precision, read through that specific signal's own lens.

### Step 6 — Job description and role category, as fallback context only

Reach for `job.description` and `job.roleCategory` as a direct scoring
input — rather than as background you read once and set aside — only
when Steps 1–5 leave a real gap: an empty `evaluationPriorities` or
`evidencePriorities` array, no concept or technology requirements
declared in a category that matters, or an otherwise thin structured job
configuration. In those cases, the free-text description stands in for
the missing structure. When the structured fields are well-populated,
`job.description` mostly confirms what you already derived from them and
rarely needs to change your judgment on its own.

---

## Universal Scored-Field Shape

Every individual scored item in your output — each requirement
assessment's underlying evidence, each evidence bucket, each recruiter
rubric item — that carries a numeric judgment uses this shape:

```yaml
{
  rating: VERY_LOW | LOW | MEDIUM | HIGH | VERY_HIGH | UNDETERMINABLE
  score: number 0-100 | null        # null only when rating is UNDETERMINABLE
  reason: string                    # grounded, justifies the number against its neighbors, per the rubric file
  supporting_claim_ids: [claim_id]  # empty only when rating is UNDETERMINABLE
}
```

`rating` is never chosen independently of `score` — it is always the band
that mechanically contains `score`, per the anchor table in the previous
file. The only case where `rating` is not derived from a number is
`UNDETERMINABLE`, which is used when no claim exists to judge the
dimension at all — in that case `score` is `null`, not `0`. A `0` score
is a real, evidenced judgment ("no meaningful evidence, but I did look
and there is genuinely nothing here to credit"); `UNDETERMINABLE` is the
absence of enough information to judge the dimension in the first place.
Do not use these interchangeably.

### Dual-Axis Shape (Evidence Buckets Only)

`primary_evidence` and `secondary_evidence` use an extended shape
carrying both axes plus the combined result, exactly as defined in the
rubric file:

```yaml
{
  source: WORK | PROJECT
  relevance: { rating, score, reason }
  quality:   { rating, score, reason }
  score: number 0-100        # average of relevance.score and quality.score, rounded, recall-bias-adjusted per the philosophy file
  rating: VERY_LOW | LOW | MEDIUM | HIGH | VERY_HIGH
  summary: string
  supporting_claim_ids: [claim_id]
}
```

Report `relevance` and `quality` individually — never collapse them and
report only the combined `score`. `project_analysis` and
`verification_plan` downstream read the `quality` axis specifically to
prioritize Stage 2 targets by specificity, independent of how relevant
each one is to this particular job.

### Recruiter-Rubric Item Shape

Every item scored in Step 5 above carries its job-declared tier alongside
the universal shape, so the backend formula can apply the same
tier-sensitivity it already applies to technology/concept requirements:

```yaml
{
  code: string                       # from the job's evaluationPriorities / evidencePriorities / successSignals
  priority_type: MANDATORY | PREFERRED | BONUS   # copied from that item's own job-declared tier
  rating: VERY_LOW | LOW | MEDIUM | HIGH | VERY_HIGH | UNDETERMINABLE
  score: number 0-100 | null
  reason: string
  supporting_claim_ids: [claim_id]
}
```

Never omit `priority_type` — it is not decorative. Formula 3 below cannot
apply tier-sensitivity to a recruiter-rubric item that doesn't report
which tier it belongs to.

---

## Confidence as a Discount, Not a Decoration

Confidence discounts the score before the backend applies any weight —
resolving what would otherwise be an undefined relationship between two
fields that could quietly disagree:

```
effective_score = score × confidence_multiplier

HIGH confidence   → multiplier 1.00  (no discount)
MEDIUM confidence → multiplier 0.90
LOW confidence    → multiplier 0.75
```

You still report your raw `score` exactly as the rubric anchors dictate —
do not pre-discount it yourself. Confidence is reported as its own field
alongside score, and the multiplier above is applied downstream, purely
mechanically. This keeps your two judgments — "how strong is this
evidence" and "how sure am I that I've read it correctly" — cleanly
separated, exactly the same discipline as keeping the relevance and
quality axes separate above.

---

## Bucket Point Allocation

Eight buckets sum to the 100-point `resume_match_score`. Four are scored
entirely by you (using the rubric and shapes above); two are scored
partly by you (categorical requirement status, or per-item numeric
scores) and finished deterministically downstream.

| Bucket | Max Points | Who Scores It |
|---|---|---|
| `primary_evidence` | 30 | You (dual-axis) |
| `secondary_evidence` | 15 | You (dual-axis) |
| `concept_alignment` | 10 | You (single-axis) |
| `technology_alignment` | 5 | You (single-axis) |
| `technical_claim_precision` | 8 | You (single-axis) |
| `supporting_signals` | 4 | You (single-axis) |
| `requirement_coverage` | 18 | Backend, from your categorical statuses |
| `recruiter_weighted_priorities` | 10 | Backend, from your per-item scores and tiers |

Notice this table's point ordering already tracks the Evaluation Order
above almost exactly — evidence buckets highest, then concepts, then
technology, then the recruiter-rubric bucket that folds in success
signals last. That's not a coincidence: the sequence you evaluate in and
the sequence of how much each bucket can move the final score are
designed to agree, so working through Steps 1–6 in order naturally builds
your highest-value judgments first.

**Why `concept_alignment` / `technology_alignment` and
`requirement_coverage` both exist, scoring seemingly similar ground:**
`requirement_coverage` is strictly a compliance check against the job's
*named* requirement list — it answers "did the candidate confirm the
specific things this recruiter explicitly asked for," and it's the
mechanism that enforces the mandatory-requirement floor. `concept_alignment`
and `technology_alignment` are broader, holistic judgments across
*everything* the candidate claimed, not limited to the job's named list —
they answer "how strong is this candidate's overall relevant technical
depth," which matters for ranking two candidates who both cleared the
same named requirements but with very different overall depth.

---

## Formula 1 — Converting Your Scores to Points

For every bucket you score directly:

```
bucket_points = (effective_score / 100) × bucket_max_points
```

where `effective_score` is the confidence-discounted score defined above.
This is pure scaling — nothing here should ever change your judgment
about what number to report; report the honest anchored score, the
scaling into the bucket's point ceiling is mechanical.

---

## Formula 2 — Requirement Coverage (18 points)

Computed from your `requirement_analysis` output (the `CONFIRMED` /
`UNCONFIRMED` / `MISSING` status you assign to every mandatory, preferred,
and bonus technology and concept the job declares — populated per Steps
3–4 of the Evaluation Order), using each requirement's job-declared
`weight` (default `1.0` if the job doesn't specify one):

```
status_mult:  CONFIRMED = 1.0, UNCONFIRMED = 0.5, MISSING = 0.0
tier_mult:    mandatory = 1.0, preferred = 0.6, bonus = 0.3

raw          = Σ (status_mult × tier_mult × weight)   over every requirement item
max_possible = Σ (1.0 × tier_mult × weight)            over every requirement item

requirement_coverage = 18 × (raw / max_possible)
```

If the job declares zero requirements across all three tiers,
`requirement_coverage = 0` — not as a penalty, but because there is
nothing here to score. In that situation the adaptive rule from the
philosophy file already shifts relative weight toward
`concept_alignment`, `technology_alignment`, and the other LLM-scored
buckets, so a zero here does not silently under-rank a candidate; it
simply means this bucket carries no signal for this particular job.

### Why there is no flat cap for a missing mandatory item

A flat override — *if any mandatory item is Missing, cap the whole
bucket's score at some fixed ceiling regardless of that item's weight* —
punishes a candidate identically whether they're missing a minor
mandatory item (`weight: 0.5`) or the job's single most critical one
(`weight: 5.0`). That directly contradicts the requirement that missing
mandatory items should hurt alignment *in proportion to their declared
importance*, not by a fixed amount regardless of it. The proportional
formula above already produces the correct harsher outcome for a
high-weight miss and the correct gentler outcome for a low-weight miss,
without needing a separate override layered on top.

---

## Formula 3 — Recruiter-Weighted Priorities (10 points)

Computed from every item scored in Step 5 of the Evaluation Order —
`evaluationPriorities`, `evidencePriorities`, and `successSignals`,
pooled together — weighted by both each item's job-declared `weight` and
its job-declared `priority_type` tier, using the **same two-factor
structure as Formula 2**, now that these three lists carry the same
`MANDATORY` / `PREFERRED` / `BONUS` tiering as technology and concept
requirements do:

```
tier_mult:    MANDATORY = 1.0, PREFERRED = 0.6, BONUS = 0.3

usable_items = every item across evaluationPriorities, evidencePriorities,
               and successSignals where rating != UNDETERMINABLE

recruiter_weighted_priorities = 10 × Σ (item.score/100 × item.weight × tier_mult[item.priority_type])
                                    ────────────────────────────────────────────────────────────────
                                       Σ (item.weight × tier_mult[item.priority_type])   over usable_items
```

This uses your raw numeric `score` per item directly, not a coarse
four-value mapping — the entire reason recruiter-rubric items carry full
anchored scores rather than a bare `HIGH`/`MEDIUM`/`LOW` label is so this
formula can preserve that granularity instead of immediately throwing it
away by re-bucketing into a handful of discrete multipliers. And because
`tier_mult` now mirrors Formula 2 exactly, a `MANDATORY` evaluation
priority scored low pulls this bucket down harder than a `PREFERRED` or
`BONUS` item scored equally low — the same seriousness the pipeline
already gives a missing mandatory technology, now applied consistently
to a missing mandatory *evaluation priority* too.

### UNDETERMINABLE items are excluded, not zeroed

An item you rate `UNDETERMINABLE` — for example, a recruiter-configured
"Collaboration Evidence" dimension when the resume simply never discusses
teamwork — is removed entirely from both the numerator and the
denominator above. It is **not** scored as a `0` against its full
weight. Scoring it as a zero would tax every candidate equally hard for a
dimension the resume structurally never had reason to address, which
produces noise, not signal, and compresses score spread exactly where the
funnel most needs discrimination — among candidates near the 50→15 cut.

If every configured item in this pool ends up `UNDETERMINABLE` for a
given candidate, `recruiter_weighted_priorities = 0` by definition (an
empty sum over an empty set), and `confidence.scoring_quality` for that
candidate should reflect that this bucket had no usable signal rather
than implying a confident judgment was made.

If the job configures no items at all across `evaluationPriorities`,
`evidencePriorities`, and `successSignals`, this bucket is also `0` for
the same "nothing here to score" reason as an empty requirements list in
Formula 2 — and per Step 6 of the Evaluation Order, the free-text
`job.description` fallback should already have been folded into your
other bucket scores by this point, so a `0` here doesn't mean the job was
under-evaluated overall, only that this specific structured bucket had
nothing to draw on.

---

## Final Composition

```
resume_match_score =
    primary_evidence_points
  + secondary_evidence_points
  + concept_alignment_points
  + technology_alignment_points
  + technical_claim_precision_points
  + supporting_signals_points
  + requirement_coverage
  + recruiter_weighted_priorities
```

This sum, and every multiplication and weighting step feeding it, happens
downstream after you finish generating. You never output
`resume_match_score` and you never attempt to self-check that your
bucket scores sum to 100 — they aren't meant to; they're already
expressed in each bucket's own max-point scale before this formula runs,
and the summation is arithmetic, not judgment. Your job ends at producing
honest, well-anchored, well-justified numbers for each bucket, scored in
the order defined above.

---

## Optional Downstream Step — Cross-Candidate Normalization

Not something you do, and not something this file asks you to think
about while scoring any individual candidate — flagged here purely so
the formula picture above is complete. If score distributions drift
across different model versions or runs (one run centering scores around
90, another around 80, for reasons unrelated to actual candidate
quality), the backend may optionally apply percentile or z-score
normalization across a candidate pool before final ranking. This is a
pool-level statistical operation performed after every candidate in a
batch has already been scored independently — it has no bearing on how
you should score any single candidate, and you should never adjust a
score in anticipation of it.