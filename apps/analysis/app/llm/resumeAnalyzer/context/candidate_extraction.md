
# CANDIDATE EXTRACTION CONTRACT (Strict Schema)

## Purpose
- Extract structured candidate information from the `parsed_resume` into a canonical profile.
- **Job-independent**: Do not evaluate against the job here. Only extract, normalize, and classify claims.
- **No verification**: Treat every statement as a claim. Do not verify truthfulness.

---

## STRICT OUTPUT RULES (Hard Constraints)

1. **No Extra Fields**: Only emit the fields defined in the schemas below. Extra fields cause validation failure.
2. **Required Fields**: All required fields (marked below) must be present. Use `null` or `[]` if empty. Never omit a required key.
3. **Exact Names**: Field names are **case-sensitive snake_case** (e.g., `claimed_total_experience_years`).
4. **No Weights**: Do not calculate scores or weights. This is extraction only.

---

## Top-Level Structure (Root Object)
Only these top-level keys are allowed. All list fields are required (may be empty).

```json
{
  "metadata": { ... },
  "candidate_profile": { ... },
  "work_experience": [ ... ],
  "projects": [ ... ],
  "technologies": [ ... ],
  "concepts": [ ... ],
  "education": [ ... ],
  "certifications": [ ... ],
  "languages": [ ... ],
  "links": [ ... ],
  "miscellaneous_claims": [ ... ]
}
```

---

## Claim Registry (Audit IDs)

- **`claim_id` format**: `claim_0001`, `claim_0002`, etc. (zero-padded, 4 digits).
- **Globally Unique**: No two entities share the same `claim_id`.
- **What gets a `claim_id`**:
  - Work/Project **containers** (the entity as a whole).
  - Child claims (responsibilities, achievements, implementation/architectural claims).
  - Education, Certifications, Technologies, Concepts, Miscellaneous Claims.
- **What does NOT get a `claim_id`**: `languages` and `links` entries (they are metadata).
- **`metadata.claim_count`** must equal the exact number of `claim_id`s you assign. Count them. Do not estimate.
- **`source_claim_ids`**: For technologies/concepts, this must reference the `claim_id` of the work/project where they were mentioned. Minimum 1, no dangling references.

---

## Entity Schemas

### 1. Metadata (Required)
```json
{
  "schema_version": "v3",
  "overall_extraction_confidence": "HIGH | MEDIUM | LOW",
  "claim_count": 0  // Integer, must match actual number of claim_ids
}
```

### 2. Candidate Profile (All fields optional, defaults null)
```json
{
  "current_title": "string | null",
  "current_company": "string | null",
  "claimed_total_experience_years": "number | null",
  "current_location": "string | null",
  "summary": "string | null",
  "summary_claim_id": "claim_id | null",  // Set only if summary contains a citable claim (e.g., "led team of 4")
  "domains": ["string"],  // Industry verticals: Fintech, Ecommerce, Edtech, AI, etc.
  "industries": ["string"],
  "career_focus": "string | null"
}
```
*(Note: URL links like GitHub/LinkedIn are extracted into the top-level `links` array below to avoid duplication.)*

### 3. Work Experience (Extract each job separately)
```json
{
  "claim_id": "claim_xxxx",        // Required - Container ID
  "company": "string | null",
  "role": "string | null",
  "start_date": "string | null",   // Format: YYYY-MM or YYYY
  "end_date": "string | null",
  "current": false,                // Boolean, defaults false
  "domains": ["string"],           // Keep for granular vertical analytics
  "responsibilities": [
    { "claim_id": "claim_xxxx", "text": "...", "confidence": "HIGH|MEDIUM|LOW", "explicit_or_inferred": "EXPLICIT|INFERRED" }
  ],
  "achievements": [                // Work-specific achievements (same nested structure)
    { "claim_id": "claim_xxxx", "text": "...", "confidence": "...", "explicit_or_inferred": "..." }
  ],
  "implementation_claims": [       // Technical details: "SELECT FOR UPDATE", "row-level locking", etc.
    { "claim_id": "claim_xxxx", "text": "...", "confidence": "...", "explicit_or_inferred": "..." }
  ],
  "technologies": ["claim_id"],    // References to top-level Technologies registry
  "concepts": ["claim_id"],        // References to top-level Concepts registry
  "source_text": "string",         // Required - Verbatim source paragraph for audit
  "confidence": "HIGH|MEDIUM|LOW"  // Required - Extraction certainty
}
```
*Dropped: `employment_type`, `duration` (calculated by backend).*

### 4. Projects
```json
{
  "claim_id": "claim_xxxx",        // Required - Container ID
  "title": "string",               // Required
  "description": "string | null",
  "role": "string | null",
  "domain": "string | null",       // Keep for project-specific vertical analysis
  "implementation_claims": [       // "Built a transaction helper..."
    { "claim_id": "claim_xxxx", "text": "...", "confidence": "...", "explicit_or_inferred": "..." }
  ],
  "architectural_claims": [        // "Chose eventual consistency over strong consistency..."
    { "claim_id": "claim_xxxx", "text": "...", "confidence": "...", "explicit_or_inferred": "..." }
  ],
  "major_features": [              // "Inventory management", "User authentication"
    { "claim_id": "claim_xxxx", "text": "...", "confidence": "...", "explicit_or_inferred": "..." }
  ],
  "technologies": ["claim_id"],    // References to top-level Technologies registry
  "concepts": ["claim_id"],        // References to top-level Concepts registry
  "repository_url": "string | null",
  "live_url": "string | null",
  "source_text": "string",         // Required
  "confidence": "HIGH|MEDIUM|LOW"  // Required
}
```


### 5. Technologies (Normalized Registry - Deduplicated)
```json
{
  "claim_id": "claim_xxxx",
  "normalized_name": "PostgreSQL",   // Canonical DB name
  "raw_name": "Postgres",            // Original text from resume
  "source_claim_ids": ["claim_xxxx"], // Min 1 - Links back to Work/Project container
  "confidence": "HIGH|MEDIUM|LOW",
  "explicit_or_inferred": "EXPLICIT|INFERRED",
  "contexts": ["Work Experience", "Project", "Skills Section", "Summary", "Other"] // Min 1
}
```

### 6. Concepts (Normalized Registry - Deduplicated)
```json
{
  "claim_id": "claim_xxxx",
  "normalized_name": "Distributed Systems",
  "raw_name": "distributed systems",
  "source_claim_ids": ["claim_xxxx"], // Min 1
  "confidence": "HIGH|MEDIUM|LOW",
  "explicit_or_inferred": "EXPLICIT|INFERRED",
  "contexts": ["Work Experience", "Project", "Skills Section", "Summary", "Other"] // Min 1
}
```

### 7. Education
```json
{
  "claim_id": "claim_xxxx",       // Required
  "degree": "string | null",
  "specialization": "string | null",
  "institution": "string | null",
  "grade": "string | null",       // GPA or Percentage
  "start_date": "string | null",
  "end_date": "string | null",
  "current": false
}
```

### 8. Certifications
```json
{
  "claim_id": "claim_xxxx",       // Required
  "title": "string",              // Required
  "issuer": "string | null",
  "issue_date": "string | null",
  "expiry_date": "string | null",
  "credential_url": "string | null"
}
```

### 9. Languages
```json
{
  "language": "string",           // Required
  "proficiency": "string | null"  // Native, Fluent, etc.
}
```
*Note: No `claim_id` for languages.*

### 10. Links (Extracted from Resume Text/application data )

Since application forms are optional, extract these specific URLs from the parsed resume text. 
**Do not** use a generic `type` field—instead, assign the correct, known, dedicated type to each URL.

```json
{
  "github": "string | null",
  "portfolio": "string | null",
  "linkedin": "string | null",
  "website": "string | null",
  "blog": "string | null",
  "other": "string | null"
}
*Note: No `claim_id` for links.*

### 11. Miscellaneous Claims (Catch-all)
Use this for data that doesn't cleanly fit into Work/Projects (e.g., rare publications, volunteer work, random accolades).
```json
{
  "claim_id": "claim_xxxx",       // Required
  "category": "string | null",    // e.g., "Publication", "Award", "Volunteering"
  "title": "string",              // Required
  "claim": "string",              // Required - The actual text
  "source_text": "string",        // Required
  "confidence": "HIGH|MEDIUM|LOW" // Required
}
```
*(Note: Root-level `achievements` and `publications` arrays are dropped. Fold them here.)*

---

## Normalization Rules
- **Technologies**: Normalize `"NodeJS"` -> `"Node.js"`, `"PSQL"` -> `"PostgreSQL"`.
- **Concepts**: Normalize `"Auth"` -> `"Authentication"`.
- Always keep the original `raw_name` alongside the `normalized_name`.

---

## Hard Validation Failures (Avoid These)
1. Extra fields not defined in the schemas above.
2. Missing required fields.
3. Duplicate `claim_id` values (global uniqueness).
4. `metadata.claim_count` not matching the actual count of `claim_id`s.
5. A `Technology` or `Concept` with an empty `source_claim_ids` or referencing a non-existent `claim_id`.
6. A `Technology` or `Concept` with an empty `contexts` list.
7. Treating `work_experience[].technologies` or `projects[].technologies` as new claim containers (they are just references to the top-level registry).

---

## Final Output Directive
Produce only the root JSON object. No explanatory text, no Markdown code fences, no extra prose.
```