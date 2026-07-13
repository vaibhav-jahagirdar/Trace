# Final Evaluation Report Structure (v3)

Contract between the LLM's output and `ResumeEvaluationReport` in PostgreSQL.
Section order = generation order = dependency order: evidence and analysis
sections come before the scores that summarize them.

---

### Open dependency (not fixable in this file)

Formula 3 assumes every item in `evaluationPriorities` / `evidencePriorities`
/ `successSignals` carries a `priority_type` (`MANDATORY`/`PREFERRED`/
`BONUS`). The sample job JSONs seen so far only carry `weight`, no
`priority_type`. Until the job-context schema actually populates that
field, `recruiter_rubric` items below have nothing to copy it from —
confirm with whoever owns the job-context DTO before this ships.

---

## Governing Rules

- Terminology (`CONFIRMED` / `UNCONFIRMED` / `MISSING` / `UNDETERMINABLE`)
  follows `definitions.md` exactly.
- Every `supporting_claim_ids` entry is a real `claim_id` (`claim_0001`
  format) from the extraction. No free-text citations, no invented IDs. No
  supporting claim → no conclusion.
- `resume_match_score` is never LLM-generated. Computed downstream as:

  ```
  resume_match_score =
      primary_evidence.points + secondary_evidence.points
    + concept_alignment.points + technology_alignment.points
    + technical_claim_precision.points + supporting_signals.points
    + requirement_coverage            # Formula 2, from §3
    + recruiter_weighted_priorities   # Formula 3, from §6
  ```

- **Metadata is system-populated**, except `schema_version`. `job_id`,
  `application_id`, `extraction_id`, `model`, `timestamp`,
  `evaluation_duration_ms` are never model output — a model can't know a
  UUID or its own wall-clock duration.

### Shared shapes

**`ScoredField`** — every single-axis scored item in this report:

```yaml
rating: VERY_LOW | LOW | MEDIUM | HIGH | VERY_HIGH | UNDETERMINABLE
score: number 0-100 | null    # null only when rating is UNDETERMINABLE
confidence: HIGH | MEDIUM | LOW
summary: string               # grounded reason, justified against neighboring scores, not just its band
supporting_claim_ids: list[claim_id]   # empty only when rating is UNDETERMINABLE
```

`rating` is mechanically derived from `score` via the anchored band table —
never chosen independently. A `0` score is a real judgment ("looked, found
nothing to credit"); `UNDETERMINABLE` is "no basis to judge this at all."
Don't conflate them.

`confidence` discounts the score downstream, before bucket-point scaling:

```
effective_score = score × { HIGH: 1.00, MEDIUM: 0.90, LOW: 0.75 }[confidence]
```

Report the honest raw `score`; the discount is applied mechanically after
generation, on every `ScoredField` and `RubricItem` alike (this now applies
uniformly — the prior formulas file only stated it for bucket scores and
left recruiter-rubric items ambiguous).

**`DualAxisScoredField`** — `primary_evidence` / `secondary_evidence` only:

```yaml
relevance: ScoredField   # how directly this evidence matches this job's role/responsibilities/domain
quality:   ScoredField   # how well-documented and mechanism-specific the evidence is, independent of relevance
score: number 0-100      # avg(relevance.score, quality.score), recall-bias-adjusted per the philosophy file
rating: VERY_LOW | LOW | MEDIUM | HIGH | VERY_HIGH
confidence: HIGH | MEDIUM | LOW
summary: string
supporting_claim_ids: list[claim_id]
```

Report both axes — never collapse to just the combined score.
`project_analysis` / `verification_plan` downstream want to prioritize by
`quality` specifically, independent of how relevant a claim is to this job.

**`RubricItem`** — every item in `recruiter_rubric`:

```yaml
code: string                                     # from the job's evaluationPriorities / evidencePriorities / successSignals
priority_type: MANDATORY | PREFERRED | BONUS     # copied from that item's job-declared tier — see Open Dependency above
rating: VERY_LOW | LOW | MEDIUM | HIGH | VERY_HIGH | UNDETERMINABLE
score: number 0-100 | null
confidence: HIGH | MEDIUM | LOW
summary: string
supporting_claim_ids: list[claim_id]
```

`weight` is not repeated here — the backend looks it up from the job
context by `code`, same as requirement weights in §3.

---

## 1. Metadata

```yaml
metadata:
  schema_version: string          # only field the model may emit
  job_id: uuid                    # system-populated
  application_id: uuid            # system-populated
  extraction_id: uuid             # system-populated
  model: string                   # system-populated
  timestamp: datetime             # system-populated
  evaluation_duration_ms: integer # system-populated
```

---

## 2. Role Fit

Categorical only — no numeric score, no bucket. Feeds the `relevance` axis
judgment in §7's `primary_evidence` / `secondary_evidence`, and the
work-vs-project decision in §4.

```yaml
role_fit:
  role_alignment_evidence: list[claim_id]
  role_alignment_summary: string          # ≤ 25 words
  role_alignment: HIGH | MEDIUM | LOW | UNDETERMINABLE

  responsibility_alignment_evidence: list[claim_id]
  responsibility_alignment_summary: string
  responsibility_alignment: HIGH | MEDIUM | LOW | UNDETERMINABLE

  domain_alignment_evidence: list[claim_id]
  domain_alignment_summary: string
  domain_alignment: HIGH | MEDIUM | LOW | UNDETERMINABLE
```

---

## 3. Requirement Analysis

Feeds Formula 2 (`requirement_coverage`, §7). Mirrors the job context's own
`requirements.mandatory/.preferred/.bonus` shape.

```yaml
requirement_analysis:
  mandatory:
    technologies: list[RequirementAssessment]
    concepts: list[RequirementAssessment]
  preferred:
    technologies: list[RequirementAssessment]
    concepts: list[RequirementAssessment]
  bonus:
    technologies: list[RequirementAssessment]
    concepts: list[RequirementAssessment]
```

```yaml
RequirementAssessment:
  name: string
  status: CONFIRMED | UNCONFIRMED | MISSING
  supporting_claim_ids: list[claim_id]   # empty when status is MISSING
  note: string                            # ≤ 20 words
```

`weight` isn't repeated here — Formula 2 pulls it from the job context by
`name`. Every mandatory/preferred/bonus × technology/concept item appears
exactly once.

---

## 4. Experience Analysis

Declares `primary_source` / `secondary_source` once — §7 references these
rather than re-declaring them.

```yaml
experience_analysis:
  primary_source: WORK | PROJECT
  secondary_source: WORK | PROJECT   # always the other one
  relevant_experiences:
    - experience_id: claim_id
      relevance_evidence: list[claim_id]
      relevance_summary: string          # ≤ 30 words
  experience_summary: string             # ≤ 50 words, synthesis only — no new claims
```

---

## 5. Project Analysis

Feeds `verification_plan` (§9) and Stage 2 directly.

```yaml
project_analysis:
  prioritized_projects:
    - project_id: claim_id
      relevance_evidence: list[claim_id]
      summary: string                    # ≤ 30 words
      verification_value: HIGH | MEDIUM | LOW
      priority: integer                  # 1 = highest
      repository_url: string | null      # system-populated
      live_url: string | null            # system-populated
  ignored_projects: list[claim_id]       # extracted but not job-relevant; no penalty implied
```

---

## 6. Recruiter Rubric Alignment

One `RubricItem` per configured item in the job's `evaluationPriorities`,
`evidencePriorities`, and `successSignals` — no invented dimensions. This
section is the sole input to Formula 3 (`recruiter_weighted_priorities`).

```yaml
recruiter_rubric:
  evaluation_dimensions: list[RubricItem]
  evidence_categories: list[RubricItem]
  success_signals: list[RubricItem]
```

An item rated `UNDETERMINABLE` is excluded from Formula 3's numerator and
denominator entirely — not scored as a zero. Taxing every candidate for a
dimension their resume had no structural reason to address would compress
score spread exactly where the funnel needs discrimination most.

---

## 7. Bucket Scores

Six buckets, all `ScoredField` or `DualAxisScoredField`, all citing back
into §2–§6 rather than re-deriving. Two more buckets
(`requirement_coverage`, `recruiter_weighted_priorities`) are computed
downstream from §3 and §6 and do **not** appear here.

```yaml
bucket_scores:
  primary_evidence: DualAxisScoredField      # max 30 pts
  secondary_evidence: DualAxisScoredField    # max 15 pts
  concept_alignment: ScoredField             # max 10 pts
  technology_alignment: ScoredField &        # max 5 pts
    { mandatory_technologies_present: boolean }
  technical_claim_precision: ScoredField     # max 8 pts
  supporting_signals: ScoredField            # max 4 pts
```

`primary_evidence` / `secondary_evidence` don't carry their own `source`
field — see §4. Why `concept_alignment` / `technology_alignment` exist
alongside `requirement_coverage`: the latter is strict compliance against
the job's *named* list ("did they confirm what was explicitly asked for");
these two are holistic depth across *everything* claimed, which is what
separates two candidates who both cleared the same named requirements with
very different overall depth.

---

## 8. Strengths & Gaps

```yaml
strengths:
  - category: string
    supporting_claim_ids: list[claim_id]
    summary: string                      # ≤ 25 words

gaps:
  - category: string
    supporting_claim_ids: list[claim_id]  # empty allowed for MISSING-type gaps
    summary: string
    impact: HIGH | MEDIUM | LOW
```

---

## 9. Verification Plan

Consumed directly by Stage 2.

```yaml
verification_plan:
  verification_targets:
    - claim_id: claim_id
      claim_type: RESPONSIBILITY | ACHIEVEMENT | IMPLEMENTATION | ARCHITECTURAL | MAJOR_FEATURE
      claim_summary: string              # ≤ 20 words
      related_project_id: claim_id | null
      importance: CRITICAL | HIGH | MEDIUM
      why_verify: string                 # ≤ 25 words
      search_hints: list[string]         # ≤ 3, grounded in the claim, never invented
  repository_strategy: string            # ≤ 40 words
```

---

## 10. Technical Outlier

Never affects score. May override repository-analysis gating.

```yaml
technical_outlier:
  is_outlier: boolean
  supporting_claim_ids: list[claim_id]   # required when is_outlier is true
  justification: string                  # ≤ 40 words
  missing_requirements: list[string]
  repository_analysis_recommended: boolean
```

---

## 11. Confidence (report-level)

Distinct from per-field `confidence` in §7/§6 — those discount individual
scores before aggregation. This is a report-level rollup for downstream
triage (e.g. "does this report need a human sanity-check"), and is never
an input to any scoring formula.

```yaml
confidence:
  extraction_quality: HIGH | MEDIUM | LOW   # copied from extraction.overall_extraction_confidence, not re-judged
  scoring_quality: HIGH | MEDIUM | LOW      # LLM's own view of this report's internal coherence
  overall: HIGH | MEDIUM | LOW              # min(extraction_quality, scoring_quality) — computed downstream
```

---

## 12. Overall Evaluation

```yaml
overall:
  overall_role_fit: EXCEPTIONAL | STRONG | GOOD | MODERATE | WEAK | POOR
  repository_priority: CRITICAL | HIGH | MEDIUM | LOW
```

No `resume_match_score` (computed downstream) and no
`proceed_to_repository_analysis` field — downstream treats
`repository_priority != LOW` as the default proceed signal, with
`technical_outlier.repository_analysis_recommended` as the explicit
override.

---

## 13. Executive Summary

```yaml
executive_summary:
  recruiter_summary: string        # ≤ 60 words
  top_strengths: list[string]      # ≤ 3, each ≤ 12 words, each traceable to a §8 strengths[].category
  primary_risks: list[string]      # ≤ 3, each ≤ 12 words, each traceable to a §8 gaps[].category
```

No `recommendation` field — Stage 1 doesn't make hiring decisions.
`repository_priority` (§12) already carries the actionable signal.

---

# Worked Example

Same candidate as the Candidate Extraction Contract example (Backend
Engineer, ABC Technologies, OrgOps project). Job: Node.js (mandatory),
PostgreSQL (mandatory), RBAC (mandatory concept), Redis (preferred),
Refresh Token Rotation (preferred concept), Docker (bonus) — plus, for this
worked example only, illustrative `evaluationPriorities` (Technical Depth,
weight 70) / `evidencePriorities` (GitHub Activity, weight 60) /
`successSignals` (Ownership Indicators, weight 50), each carrying an
assumed `priority_type` per the Open Dependency note above.

```yaml
metadata:
  schema_version: "3.0"
  job_id: <system-populated>
  application_id: <system-populated>
  extraction_id: <system-populated>
  model: <system-populated>
  timestamp: <system-populated>
  evaluation_duration_ms: <system-populated>

role_fit:
  role_alignment_evidence: ["claim_0002"]
  role_alignment_summary: "Title and responsibilities directly match Backend Engineer scope."
  role_alignment: HIGH
  responsibility_alignment_evidence: ["claim_0002", "claim_0011"]
  responsibility_alignment_summary: "Built auth and org-management services — core backend ownership."
  responsibility_alignment: HIGH
  domain_alignment_evidence: []
  domain_alignment_summary: "No domain/industry claims present to compare."
  domain_alignment: UNDETERMINABLE

requirement_analysis:
  mandatory:
    technologies:
      - { name: "Node.js", status: CONFIRMED, supporting_claim_ids: ["claim_0006"], note: "Used in work experience and project." }
      - { name: "PostgreSQL", status: CONFIRMED, supporting_claim_ids: ["claim_0012"], note: "Explicit in OrgOps." }
    concepts:
      - { name: "RBAC", status: CONFIRMED, supporting_claim_ids: ["claim_0013"], note: "Explicitly implemented in OrgOps." }
  preferred:
    technologies:
      - { name: "Redis", status: CONFIRMED, supporting_claim_ids: ["claim_0007"], note: "Used in work and project." }
    concepts:
      - { name: "Refresh Token Rotation", status: CONFIRMED, supporting_claim_ids: ["claim_0009"], note: "Explicit implementation claim." }
  bonus:
    technologies:
      - { name: "Docker", status: MISSING, supporting_claim_ids: [], note: "Not present anywhere." }
    concepts: []

experience_analysis:
  primary_source: WORK
  secondary_source: PROJECT
  relevant_experiences:
    - experience_id: "claim_0002"
      relevance_evidence: ["claim_0002", "claim_0003", "claim_0004"]
      relevance_summary: "Directly relevant backend role with matching tech/concept claims."
  experience_summary: "Two years of directly relevant backend work at ABC Technologies, closely matching this job's stack."

project_analysis:
  prioritized_projects:
    - project_id: "claim_0011"
      relevance_evidence: ["claim_0011", "claim_0016"]
      summary: "OrgOps: RBAC, audit logging, DB transactions — high-value verification target."
      verification_value: HIGH
      priority: 1
      repository_url: "https://github.com/candidate/orgops"
      live_url: null
  ignored_projects: []

recruiter_rubric:
  evaluation_dimensions:
    - code: "TECHNICAL_DEPTH"
      priority_type: MANDATORY
      rating: VERY_HIGH
      score: 90
      confidence: HIGH
      summary: "Multiple distinct mechanisms (rotation, replay detection, RBAC, locking) with real mechanism detail."
      supporting_claim_ids: ["claim_0004", "claim_0016"]
    - code: "COLLABORATION_EVIDENCE"
      priority_type: PREFERRED
      rating: UNDETERMINABLE
      score: null
      confidence: LOW
      summary: "No claims describing teamwork or cross-functional work."
      supporting_claim_ids: []
  evidence_categories:
    - code: "GITHUB_ACTIVITY"
      priority_type: MANDATORY
      rating: HIGH
      score: 88
      confidence: HIGH
      summary: "Claims are specific enough to check directly against source code."
      supporting_claim_ids: ["claim_0004", "claim_0016"]
  success_signals:
    - code: "OWNERSHIP_INDICATORS"
      priority_type: PREFERRED
      rating: MEDIUM
      score: 70
      confidence: MEDIUM
      summary: "Sole-ownership language used for OrgOps; no team-context claims to corroborate further."
      supporting_claim_ids: ["claim_0011"]

bucket_scores:
  primary_evidence:
    relevance: { rating: HIGH, score: 85, confidence: HIGH, summary: "Auth work directly matches backend role.", supporting_claim_ids: ["claim_0002"] }
    quality:   { rating: HIGH, score: 88, confidence: HIGH, summary: "Replay detection + rotation named with real mechanism detail.", supporting_claim_ids: ["claim_0004", "claim_0005"] }
    score: 87
    rating: HIGH
    confidence: HIGH
    summary: "2 years professional backend work with specific auth implementation claims."
    supporting_claim_ids: ["claim_0002", "claim_0003", "claim_0004"]

  secondary_evidence:
    relevance: { rating: HIGH, score: 82, confidence: HIGH, summary: "OrgOps directly reinforces backend/RBAC claims.", supporting_claim_ids: ["claim_0011"] }
    quality:   { rating: HIGH, score: 85, confidence: HIGH, summary: "RBAC, audit logging, transactions all named with mechanism.", supporting_claim_ids: ["claim_0016"] }
    score: 84
    rating: HIGH
    confidence: HIGH
    summary: "OrgOps reinforces primary evidence with RBAC and audit logging."
    supporting_claim_ids: ["claim_0011", "claim_0016"]

  concept_alignment:
    rating: HIGH
    score: 88
    confidence: HIGH
    summary: "RBAC (mandatory) and Refresh Token Rotation (preferred) both explicitly implemented."
    supporting_claim_ids: ["claim_0009", "claim_0013"]

  technology_alignment:
    mandatory_technologies_present: true
    rating: HIGH
    score: 84
    confidence: HIGH
    summary: "Node.js and PostgreSQL confirmed with implementation context, not bare mentions."
    supporting_claim_ids: ["claim_0006", "claim_0012"]

  technical_claim_precision:
    rating: HIGH
    score: 86
    confidence: HIGH
    summary: "Specific mechanisms named rather than generic 'built auth system' phrasing."
    supporting_claim_ids: ["claim_0004", "claim_0005"]

  supporting_signals:
    rating: LOW
    score: 45
    confidence: HIGH
    summary: "B.Tech CS — relevant baseline, no further differentiation."
    supporting_claim_ids: ["claim_0017"]

strengths:
  - category: "Technical Claim Specificity"
    supporting_claim_ids: ["claim_0004"]
    summary: "Replay detection and token rotation named as explicit mechanisms, not generic 'secure auth.'"
  - category: "Mandatory Requirement Coverage"
    supporting_claim_ids: ["claim_0006", "claim_0012", "claim_0013"]
    summary: "All three mandatory requirements confirmed with implementation-level evidence."

gaps:
  - category: "Collaboration Evidence"
    supporting_claim_ids: []
    summary: "No claims address teamwork or cross-functional work."
    impact: LOW

verification_plan:
  verification_targets:
    - claim_id: "claim_0004"
      claim_type: IMPLEMENTATION
      claim_summary: "Refresh token rotation with replay detection."
      related_project_id: "claim_0002"
      importance: CRITICAL
      why_verify: "Check for token blacklist/rotation logic and replay-guard middleware."
      search_hints: ["rotateRefreshToken", "replay", "token blacklist"]
    - claim_id: "claim_0016"
      claim_type: IMPLEMENTATION
      claim_summary: "RBAC and audit logging in OrgOps."
      related_project_id: "claim_0011"
      importance: HIGH
      why_verify: "Check for role-based middleware and an audit-log write path."
      search_hints: ["RBAC", "audit_log", "middleware"]
  repository_strategy: "Prioritize the OrgOps repo; focus on auth middleware and RBAC enforcement first."

technical_outlier:
  is_outlier: false
  supporting_claim_ids: []
  justification: ""
  missing_requirements: []
  repository_analysis_recommended: true

confidence:
  extraction_quality: HIGH
  scoring_quality: HIGH
  overall: HIGH

overall:
  overall_role_fit: STRONG
  repository_priority: HIGH

executive_summary:
  recruiter_summary: "Strong backend candidate with confirmed mandatory coverage and specific, verifiable implementation claims. No collaboration evidence present."
  top_strengths:
    - "All mandatory requirements confirmed with implementation depth"
    - "Specific, mechanism-level security implementation claims"
  primary_risks:
    - "No evidence of collaborative or cross-functional work"
```

### Downstream computation (illustrative — not part of LLM output)

```
primary_evidence:            87/100 × 1.00 × 30 = 26.10
secondary_evidence:          84/100 × 1.00 × 15 = 12.60
concept_alignment:           88/100 × 1.00 × 10 =  8.80
technology_alignment:        84/100 × 1.00 ×  5 =  4.20
technical_claim_precision:   86/100 × 1.00 ×  8 =  6.88
supporting_signals:          45/100 × 1.00 ×  4 =  1.80
                                          subtotal = 60.38

requirement_coverage (Formula 2):
  mandatory: (1.0+1.0+1.0) / (1.0+1.0+1.0)        = 3.0 / 3.0
  preferred: (0.6+0.6) / (0.6+0.6)                = 1.2 / 1.2   [weight=1.0 default on both]
  bonus:     0 / 0.3
  raw = 4.2, max = 4.5 → ratio 0.933 → 18 × 0.933 = 16.80

recruiter_weighted_priorities (Formula 3, COLLABORATION_EVIDENCE excluded — UNDETERMINABLE):
  TECHNICAL_DEPTH:      (90/100)×70×1.0 = 63.0   / 70×1.0 = 70.0
  GITHUB_ACTIVITY:      (88/100)×60×1.0 = 52.8   / 60×1.0 = 60.0
  OWNERSHIP_INDICATORS: (70/100×0.90)×50×0.6 = 18.9 / 50×0.6 = 30.0
  ratio = 134.7 / 160 = 0.842 → 10 × 0.842 = 8.42

resume_match_score = 60.38 + 16.80 + 8.42 = 85.60
```