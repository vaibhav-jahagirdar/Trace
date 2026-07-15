
```markdown
# FINAL OUTPUT DIRECTIVE (Strict Contract)

## 1. Root Structure (Non‑Negotiable)
Return **exactly one valid JSON object** with this top-level shape:

```json
{
  "candidate": { ... },   // Must match CandidateExtractionOutput (candidate_extraction.md)
  "evaluation": { ... }   // Must match ResumeEvaluationReportLLMOutput (evaluation_report_contract.md)
}
```

- **No other top-level keys** are permitted.
- **Do not rename, omit, wrap, or add** any fields at any nesting level.

---

## 2. Metadata Restriction
In `evaluation.metadata`, include **only** `schema_version: "v1"`. 

**Never emit:**
- `resume_match_score`
- `requirement_coverage`
- `recruiter_weighted_priorities`
- Any system metadata (job_id, extraction_id, timestamps, model names, etc.)

All of these are computed downstream after your response is validated.

---

## 3. Schema Compliance (Hard Enforcement)
Every object in both schemas is declared with `extra="forbid"`. 
This means:

- **If a field is not defined** in the referenced schema for that object, do not emit it.
- **If a field is required** (as defined in the schema), it must be present (use `null` or `[]` for optional empty values).
- All nested field names, object structures, enum values, and data types must match **exactly**—no renamed keys, no restructured nesting, no substituted enum values.

---

## 4. Final Output Rule
Return **only** the raw JSON object.

- **No Markdown** (no ` ```json ` fences).
- **No prose**, explanations, or commentary before or after.
- **No comments** inside the JSON.
- No whitespace outside the JSON.

Your response must start with `{` and end with `}`.
```