## Required Deliverables

1. Produce the candidate extraction exactly as defined by `candidate_extraction.md`
   (schema: `CandidateExtractionOutput`).

2. Produce the evaluation report exactly as defined by `final_report_structure.md`
   (schema: `ResumeEvaluationReportLLMOutput`). Note that `metadata` in this section
   contains **only** `schema_version` — no other metadata fields, and no
   `resume_match_score` / `requirement_coverage` / `recruiter_weighted_priorities`
   anywhere in the evaluation object. Those are computed downstream, not by you.

## Output Requirements

Return exactly one valid JSON object with this top-level structure, matching
`ResumeAnalysisLLMResponse`:

{
  "candidate": { ... },
  "evaluation": { ... }
}

The top-level keys **must** be named `candidate` and `evaluation` — no other top-level
keys are permitted. The service later adds backend-computed scores; do not emit them.

Do not rename, omit, wrap, or add top-level or nested sections. Every object in both
schemas is `extra="forbid"`: any field not defined in `candidate_extraction.md` or
`final_report_structure.md` for a given entity will cause the response to be rejected, and any
required field that is missing will do the same.

All nested field names, object structures, enum values, and data types must exactly
match their respective contracts — no renamed keys, no restructured nesting, no
substituted enum values.

Return only the JSON object: no Markdown, no code fences, no explanations, no comments,
no text before or after the JSON.
