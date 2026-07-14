# Evaluation Report Contract

The `evaluation` value in the final response is a
`ResumeEvaluationReportLLMOutput`. The API supplies its exact JSON schema.
Follow that schema exactly: all required fields must be present, field names
and enum values are exact, and no unknown fields are allowed.

This document defines the judgment rules behind that structure. It does not
replace the schema and must not cause you to add fields the schema omits.

## Model-Owned Versus Backend-Owned Fields

Emit only the LLM evaluation object. Do not emit system metadata, weights,
derived points, `requirement_coverage`, `recruiter_weighted_priorities`, or
`resume_match_score`. The service computes those after validating this output.

`metadata` contains only `schema_version`. In `confidence`, copy the
candidate extraction's `overall_extraction_confidence` into
`extraction_quality`; choose `scoring_quality`; then set `overall` to the
lower of those two confidence levels (`LOW < MEDIUM < HIGH`).

## Grounding and Consistency

- Every cited ID must be a real `claim_id` from the `candidate` object
  produced in this same response. Never invent IDs.
- A non-`UNDETERMINABLE` scored field needs a score, matching rubric rating,
  non-empty grounding IDs, and a concise reason. `UNDETERMINABLE` requires
  `score: null` and no grounding IDs.
- `MISSING` requirement assessments have no supporting IDs. `CONFIRMED` and
  `UNCONFIRMED` assessments have at least one supporting ID.
- For every tier, list each job-configured requirement exactly once under its
  matching technology or concept list. Copy the requirement name exactly.
- For every configured recruiter item, emit exactly one matching rubric item
  in its matching array. Copy its `code` and `priority_type` exactly. Do not
  invent criteria or weights.
- `primary_source` and `secondary_source` must differ and must match the
  work-versus-project decision in the evaluation policy.

## Section Intent

`role_fit` is categorical evidence for role, responsibility, and domain
alignment. Do not use title or years alone.

`requirement_analysis` is a named-item coverage record. It is not a general
technical-depth score.

`experience_analysis` declares the one primary/secondary source decision and
the relevant work or project containers used to make it. `project_analysis`
orders only job-relevant projects for possible verification; ignored projects
are not a penalty.

`recruiter_rubric` evaluates the configured evaluation priorities, evidence
priorities, and success signals using grounded claims. A configured dimension
with no basis to judge is `UNDETERMINABLE`, not fabricated or assumed.

`bucket_scores` contains the raw evidence judgments consumed by backend
scoring. For the primary and secondary evidence buckets, score relevance and
quality separately and set the combined score to their rounded average.

`strengths`, `gaps`, `verification_plan`, `technical_outlier`, `overall`, and
`executive_summary` summarize the already-grounded analysis. They must not
introduce new candidate facts, create a hiring decision, or reverse a named
mandatory gap through unrelated impressive work.

Return only the root JSON object required by the Start Directive. No prose,
Markdown, comments, or code fences.
