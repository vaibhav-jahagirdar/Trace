# Candidate Extraction Contract - v2

## Purpose

Extract structured candidate information from the supplied application and parsed resume.

The extracted data becomes the canonical candidate profile used by downstream systems.

The objective is to normalize candidate information into a consistent schema suitable for PostgreSQL storage.

Extraction must be independent of any specific job.

Do not evaluate the candidate.

Do not rank the candidate.

Do not verify candidate claims.

Do not estimate engineering ability.

Only extract, normalize and classify candidate claims.

---

# Claim Registry

Every atomic statement extracted from the application or resume is a **claim**, and every claim receives a **stable `claim_id`**.

This is the single mechanism that makes Stage 1's evaluation report auditable: every `supporting_claim_ids` reference in the final report (`final_report_structure.md`) points back to a `claim_id` defined here. Without this registry, evaluation citations have nothing to reference.

## What counts as a claim

A claim is the smallest unit of extracted information that could independently be cited as evidence. This is **finer-grained than a section** — a single work experience entry is not one claim, it is a claim *container* holding several individual claims (its responsibilities, its achievements, its implementation claims, each technology/concept usage).

Concretely, each of the following is its own claim with its own `claim_id`:

* Each individual responsibility statement within a work experience
* Each individual achievement statement within a work experience
* Each individual implementation claim within a work experience or project
* Each individual architectural claim within a project
* Each individual major feature within a project
* Each normalized technology entry (top-level, in the Technologies section)
* Each normalized concept entry (top-level, in the Concepts section)
* Each education entry
* Each certification entry
* Each publication entry
* Each achievement entry (top-level, not tied to a specific work experience)
* Each miscellaneous claim
* The candidate profile summary, if it contains claim-bearing content (e.g. "led backend team of 4")

A `work_experience` or `project` entity is a **container**: it has its own `claim_id` for citing "this experience as a whole" (e.g. for role/responsibility alignment), and it separately holds a list of child `claim_id`s for its individual responsibilities, achievements, and implementation claims. Both levels are citable — downstream evaluation may need to reference "this specific claim about replay detection" (a child) or "this work experience in general" (the container), and these are different citations.

## ID format

`claim_id` values follow the pattern `claim_{4-digit sequence}` — e.g. `claim_0001`, `claim_0002`.

* Assigned in the order claims are extracted, reading the resume/application top to bottom.
* Sequence numbers are unique and unbroken within a single extraction output.
* IDs are assigned by the extraction step itself (this is a simple ordinal counter, not a content hash) — the LLM does not need to compute anything, only number claims sequentially as it extracts them.
* IDs are stable **within one extraction run** but are not guaranteed stable **across re-extractions** of the same resume (a re-run may order or split claims slightly differently). If a downstream system needs cross-run stability (e.g. deduplicating re-parsed resumes), that is a separate deterministic resolution step performed outside this LLM extraction — the same principle already applied to technology/concept name resolution against canonical DB rows (see Technologies/Concepts below).

## Traceability between normalized entries and their source claims

Top-level normalized `technologies`/`concepts` entries do not just have their own `claim_id` — they must also record which raw claim(s) they were derived from, via `source_claim_ids`. This closes a gap in the previous version of this contract: a technology mentioned inside a work experience's implementation claim and the same technology's canonical entry in the top-level `technologies` list were previously two disconnected pieces of text with no link between them. Now the top-level entry is the canonical citable claim, and `source_claim_ids` shows its provenance.

---

# General Principles

Extract explicit information whenever available.

Preserve original meaning.

Normalize values whenever possible.

Never invent information.

Never discard potentially useful information.

If confidence is low, preserve the information and mark confidence appropriately.

Every extracted entity should retain its source.

Every extracted claim must have a `claim_id`.

---

# Metadata

Extract:

* schema_version
* extraction_timestamp
* parser_version
* overall_extraction_confidence
* claim_count (total number of claim_ids assigned in this extraction)

---

# Candidate Profile

Extract:

* current_title
* current_company
* claimed_total_experience_years
* current_location
* summary
* summary_claim_id (claim_id if the summary contains independently citable claim content, e.g. "led backend team of 4"; null if summary is purely descriptive with no new claim beyond what's captured elsewhere)
* domains
* industries
* career_focus
* github_url
* portfolio_url
* linkedin_url
* website_url

---

# Work Experience

Extract every professional experience separately.

For each experience extract:

* claim_id (identifies this experience as a citable container — used for role/responsibility/domain alignment citations)
* company
* role
* employment_type
* start_date
* end_date
* current
* duration
* domains
* responsibilities: list of { claim_id, text, confidence, explicit_or_inferred }
* achievements: list of { claim_id, text, confidence, explicit_or_inferred }
* technologies: list of claim_id (references into the top-level Technologies registry — see Technologies section)
* concepts: list of claim_id (references into the top-level Concepts registry — see Concepts section)
* implementation_claims: list of { claim_id, text, confidence, explicit_or_inferred }
* source_text
* confidence

Do not merge multiple work experiences.

---

# Projects

Extract every project independently.

For each project extract:

* claim_id (identifies this project as a citable container)
* title
* description
* role
* project_type
* domain
* technologies: list of claim_id (references into the top-level Technologies registry)
* concepts: list of claim_id (references into the top-level Concepts registry)
* implementation_claims: list of { claim_id, text, confidence, explicit_or_inferred }
* architectural_claims: list of { claim_id, text, confidence, explicit_or_inferred }
* major_features: list of { claim_id, text, confidence, explicit_or_inferred }
* repository_url
* live_url
* source_text
* confidence

Projects should remain independent entities.

---

# Technologies

Extract every claimed technology **once** as a normalized top-level entry. This is the canonical registry — `work_experience.technologies` and `project.technologies` reference these entries by `claim_id` rather than duplicating them.

For every technology extract:

* claim_id
* normalized_name
* raw_name
* source_claim_ids (list of claim_id — the work-experience/project implementation claims, skills-section mention, or summary claim this technology was derived from)
* confidence
* explicit_or_inferred
* contexts

Contexts may include:

* Work Experience
* Project
* Skills Section
* Summary
* Other

Do not create duplicate technologies. If the same normalized technology appears in multiple contexts (e.g. both a work experience and a project), it is **one** entry here with multiple `source_claim_ids` and multiple `contexts` — not multiple entries.

---

# Concepts

Extract every engineering concept claimed by the candidate, following the same registry pattern as Technologies.

For every concept extract:

* claim_id
* normalized_name
* raw_name
* source_claim_ids (list of claim_id)
* confidence
* explicit_or_inferred
* contexts

Concepts should represent engineering knowledge rather than tools.

Do not create duplicate concepts — same dedup rule as Technologies.

---

# Education

Extract every education entry.

Fields:

* claim_id
* degree
* specialization
* institution
* grade
* start_date
* end_date
* current

---

# Certifications

Extract:

* claim_id
* title
* issuer
* issue_date
* expiry_date
* credential_url

---

# Achievements

Extract:

* claim_id
* title
* description
* category
* source_text

---

# Publications

Extract:

* claim_id
* title
* publisher
* publication_date
* url

---

# Languages

Extract:

* language
* proficiency

(No `claim_id` — language proficiency is self-reported metadata, not independently used as evaluation evidence in any downstream scoring bucket. If this changes, add `claim_id` here following the same pattern.)

---

# Links

Extract all publicly available links.

Supported types:

* GitHub
* Portfolio
* LinkedIn
* Website
* Blog
* Other

(No `claim_id` — links are pointers, not claims. The content at the link, if analyzed, is out of scope for this extraction stage.)

---

# Miscellaneous Claims

If the resume contains information that does not belong to any canonical section, preserve it.

For every miscellaneous claim extract:

* claim_id
* category
* title
* claim
* source_text
* confidence

Never discard potentially useful information.

---

# Confidence

Every extracted entity must include confidence.

Allowed values:

* HIGH
* MEDIUM
* LOW

Confidence reflects extraction certainty only.

It does not represent truthfulness.

---

# Explicit vs Inferred

Every extracted entity must specify whether it is:

* EXPLICIT
* INFERRED

Prefer explicit extraction.

Infer only when the information is strongly supported by surrounding context.

Never infer speculative information.

---

# Source Tracking

Every extracted entity must preserve:

* raw_text
* source_section

This enables complete auditability, in addition to the `claim_id` reference itself.

---

# Normalization Rules

Normalize common aliases into canonical values.

Examples include:

* technology names
* programming languages
* frameworks
* databases
* cloud providers
* engineering concepts

Always preserve the original value alongside the normalized value.

This extraction step produces normalized **name strings** only, not database foreign keys. Resolving a `normalized_name` against an existing `technologies.id`/`concepts.id` row — including alias matching, fuzzy dedup, and create-if-missing — is a separate deterministic resolution step performed downstream, not part of this extraction.

---

# Extraction Report

Produce a report containing:

* missing_sections
* ambiguous_entities
* low_confidence_entities
* duplicate_entities
* ignored_content
* parsing_notes

---

# Output Requirements

The extraction output must satisfy the following properties:

* deterministic
* machine readable
* relational
* normalized
* auditable
* reproducible
* reusable across different jobs
* every claim independently citable via a stable claim_id

The extracted candidate profile should be suitable for direct insertion into normalized PostgreSQL tables without requiring additional LLM processing, aside from the deterministic name-to-ID resolution step described under Normalization Rules.

---

