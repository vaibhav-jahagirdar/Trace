
```markdown
# EVALUATION REPORT CONTRACT (1:1 Schema Contract)

## STRICT OUTPUT DIRECTIVE

Produce exactly the JSON structure defined below. 
- All required fields must be present. 
- Use `null` or `[]` where optional lists are empty.
- Do not add any fields not listed here. 
- All `supporting_claim_ids` must reference real `claim_id`s from your `candidate` extraction.

---

## CANONICAL JSON SCHEMA (THE EXACT SHAPE)

```json
{
  "metadata": {
    "schema_version": "v1"
  },
  "role_fit": {
    "role_alignment_evidence": ["claim_0001"],
    "role_alignment_summary": "string",
    "role_alignment": "HIGH | MEDIUM | LOW | UNDETERMINABLE",
    "responsibility_alignment_evidence": ["claim_0001"],
    "responsibility_alignment_summary": "string",
    "responsibility_alignment": "HIGH | MEDIUM | LOW | UNDETERMINABLE",
    "domain_alignment_evidence": ["claim_0001"],
    "domain_alignment_summary": "string",
    "domain_alignment": "HIGH | MEDIUM | LOW | UNDETERMINABLE"
  },
  "requirement_analysis": {
    "mandatory": {
      "technologies": [
        { "name": "PostgreSQL", "status": "CONFIRMED | UNCONFIRMED | MISSING", "supporting_claim_ids": ["claim_0001"], "note": "string" }
      ],
      "concepts": [
        { "name": "Distributed Systems", "status": "CONFIRMED | UNCONFIRMED | MISSING", "supporting_claim_ids": ["claim_0001"], "note": "string" }
      ]
    },
    "preferred": { "technologies": [], "concepts": [] },
    "bonus": { "technologies": [], "concepts": [] }
  },
  "experience_analysis": {
    "primary_source": "WORK | PROJECT",
    "secondary_source": "WORK | PROJECT",
    "relevant_experiences": [
      { "experience_id": "claim_0001", "relevance_evidence": ["claim_0001"], "relevance_summary": "string" }
    ],
    "experience_summary": "string"
  },
  "project_analysis": {
    "prioritized_projects": [
      { 
        "project_id": "claim_0001", 
        "relevance_evidence": ["claim_0001"], 
        "summary": "string", 
        "verification_value": "HIGH | MEDIUM | LOW", 
        "priority": 1,
        "repository_url": "string | null",
        "live_url": "string | null"
      }
    ],
    "ignored_projects": ["claim_0002"]
  },
  "recruiter_rubric": {
    "evaluation_dimensions": [
      { "code": "TECHNICAL_DEPTH", "priority_type": "MANDATORY | PREFERRED | BONUS", "rating": "HIGH", "score": 85, "confidence": "HIGH", "summary": "string", "supporting_claim_ids": ["claim_0001"] }
    ],
    "evidence_categories": [],
    "success_signals": []
  },
  "bucket_scores": {
    "primary_evidence": {
      "relevance": { "rating": "HIGH", "score": 80, "confidence": "HIGH", "summary": "string", "supporting_claim_ids": ["claim_0001"] },
      "quality": { "rating": "HIGH", "score": 80, "confidence": "HIGH", "summary": "string", "supporting_claim_ids": ["claim_0001"] },
      "score": 80,
      "rating": "HIGH",
      "confidence": "HIGH",
      "summary": "string",
      "supporting_claim_ids": ["claim_0001"]
    },
    "secondary_evidence": { "relevance": {...}, "quality": {...}, "score": 70, "rating": "MEDIUM", "confidence": "HIGH", "summary": "string", "supporting_claim_ids": ["claim_0001"] },
    "concept_alignment": { "rating": "HIGH", "score": 85, "confidence": "HIGH", "summary": "string", "supporting_claim_ids": ["claim_0001"] },
    "technology_alignment": { "rating": "HIGH", "score": 80, "confidence": "HIGH", "summary": "string", "supporting_claim_ids": ["claim_0001"], "mandatory_technologies_present": true },
    "technical_claim_precision": { "rating": "HIGH", "score": 80, "confidence": "HIGH", "summary": "string", "supporting_claim_ids": ["claim_0001"] },
    "supporting_signals": { "rating": "MEDIUM", "score": 60, "confidence": "HIGH", "summary": "string", "supporting_claim_ids": ["claim_0001"] }
  },
  "strengths": [
    { "category": "string", "supporting_claim_ids": ["claim_0001"], "summary": "string" }
  ],
  "gaps": [
    { "category": "string", "supporting_claim_ids": ["claim_0001"], "summary": "string", "impact": "HIGH | MEDIUM | LOW" }
  ],
  "verification_plan": {
    "verification_targets": [
      {
        "claim_id": "claim_0001",
        "claim_type": "RESPONSIBILITY | ACHIEVEMENT | IMPLEMENTATION | ARCHITECTURAL | MAJOR_FEATURE",
        "claim_summary": "string",
        "related_project_id": "claim_0001 | null",
        "importance": "CRITICAL | HIGH | MEDIUM",
        "why_verify": "string",
        "search_hints": ["hint1"]
      }
    ],
    "repository_strategy": "string"
  },
  "technical_outlier": {
    "is_outlier": false,
    "supporting_claim_ids": ["claim_0001"],
    "justification": "string",
    "missing_requirements": ["PostgreSQL"],
    "repository_analysis_recommended": false
  },
  "confidence": {
    "extraction_quality": "HIGH | MEDIUM | LOW",
    "scoring_quality": "HIGH | MEDIUM | LOW",
    "overall": "HIGH | MEDIUM | LOW"
  },
  "overall": {
    "overall_role_fit": "EXCEPTIONAL | STRONG | GOOD | MODERATE | WEAK | POOR",
    "repository_priority": "CRITICAL | HIGH | MEDIUM | LOW"
  },
  "executive_summary": {
    "recruiter_summary": "string",
    "top_strengths": ["string"],
    "primary_risks": ["string"]
  }
}
```

---

## ENFORCEMENT RULES (APPLY ALWAYS)
## CRITICAL: Evidence & Claim_ID Discipline (Strict Enforcement)

**1. Requirement Analysis (`requirement_analysis`)**
- For **CONFIRMED**: Cite the `claim_id` from the resume where the requirement was found.
- For **UNCONFIRMED**: Cite the `claim_id` from the `candidate_context.claimedTechnologies` or `candidate_context.claimedConcepts` array. **Never** leave `supporting_claim_ids` empty for UNCONFIRMED items.
- For **MISSING**: Use an empty array `[]`.

**2. Bucket Scores (`bucket_scores`)**
- If you assign a **numeric score (0-100)** to ANY `ScoredField`, you **MUST** provide at least one `supporting_claim_id`.
- If you have **no evidence** for a scored bucket, set `rating` to `UNDETERMINABLE`, `score` to `null`, and `supporting_claim_ids` to `[]`. Do **not** use score `0` with an empty array.

**3. Executive Summary (`executive_summary.primary_risks`)**
- Write each risk as a **concise, scannable headline**.
- **Hard Limit:** Each risk string **must be ≤ 12 words**.
- ✅ Correct: *"No professional work history."* (4 words)
- ❌ Wrong: *"Complete lack of professional work history on the resume despite claiming 5 years of experience."* (15 words)

### A. Grounding & Truth
- Every `supporting_claim_ids` must reference a real `claim_id` generated in your `candidate` extraction. 
- **Never invent IDs.** If a field lacks evidence, mark it `UNDETERMINABLE` (which forces `score: null` and empty `supporting_claim_ids`).

### B. `UNDETERMINABLE` Discipline
- If `rating` is `UNDETERMINABLE`:
  - `score` must be `null`.
  - `supporting_claim_ids` must be an empty array `[]`.
  - Add a clear reason in the `summary`.
- **Zero (`0`) is not a substitute for `UNDETERMINABLE`.** Zero means "meaningful evidence is present but very poor."

### C. Rating & Score Consistency
- For non-`UNDETERMINABLE` fields, the `score` and `rating` must match this band:
  - `VERY_HIGH`: 90–100
  - `HIGH`: 75–89
  - `MEDIUM`: 55–74
  - `LOW`: 30–54
  - `VERY_LOW`: 0–29

### D. Backend-Owned Fields (DO NOT EMIT)
- **Never** emit `requirement_coverage`, `recruiter_weighted_priorities`, or `resume_match_score`. 
- **Never** emit system metadata like `extraction_id`, `job_id`, or `timestamp`. These are injected downstream.

### E. Project Sorting Logic
- In `project_analysis.prioritized_projects`, set `priority` as `1` for the highest-priority project, `2` for the next, etc.
- Sort strictly by **relevance** (descending). If relevance ties, sort by **quality** (descending).
- Only include projects with a `verification_value` of `HIGH` or `MEDIUM` in the `prioritized_projects` list. Projects that are irrelevant belong in `ignored_projects`.

### F. Neutral Framing for Outliers
- If `technical_outlier.is_outlier` is `true`, ensure your `executive_summary.recruiter_summary` and `overall.overall_role_fit` reflect that the candidate has exceptional depth in an **orthogonal domain**.
- Use phrasing like: *"Expertise is orthogonal to this specific role."* 
- **Never** write: *"Weak candidate"* or *"Lacks required skills"* for an outlier. Always frame it as a mismatch, not a deficiency.

---

## FINAL OUTPUT DIRECTIVE
Return **only** the root JSON object matching the schema above. 
No prose, no Markdown code fences, no explanatory text, no comments.
```