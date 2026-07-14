# Candidate Extraction Contract — v3 (schema-locked)

## Purpose

Extract structured candidate information from the supplied application and parsed resume into
the canonical candidate profile used by downstream systems.

Extraction must be independent of any specific job.

Do not evaluate the candidate. Do not rank the candidate. Do not verify candidate claims.
Do not estimate engineering ability. Only extract, normalize, and classify candidate claims.

---

## STRICT OUTPUT CONTRACT — read this before extracting anything

The `candidate` object in the final response is normalized into
`CandidateExtractionOutput`. Apply this contract to that nested object; the
Start Directive defines the outer response wrapper.
Every model in that schema is declared with `model_config = ConfigDict(extra="forbid")`. That means:

- **If a field is not listed below for a given entity, do not emit it.** Adding a field that
  doesn't exist on that entity's model (e.g. `raw_text` on an `Education` entry) is a hard
  validation failure, not a warning.
- **If a field is listed as required below, it must be present**, even if empty (`""`, `[]`) —
  omitting a required field is also a hard validation failure.
- Field names are exact, case-sensitive, snake_case, and must not be renamed, abbreviated, or
  restructured (e.g. it is `claimed_total_experience_years`, not `total_experience_years` or
  `years_of_experience`).

Top-level keys, exactly, no others:

```
{
  "metadata": ExtractionMetadata,
  "candidate_profile": CandidateProfile,
  "work_experience": [WorkExperience, ...],
  "projects": [Project, ...],
  "technologies": [Technology, ...],
  "concepts": [Concept, ...],
  "education": [Education, ...],
  "certifications": [Certification, ...],
  "achievements": [Achievement, ...],
  "publications": [Publication, ...],
  "languages": [Language, ...],
  "links": [Link, ...],
  "miscellaneous_claims": [MiscellaneousClaim, ...],
  "extraction_report": ExtractionReport
}
```

`metadata`, `candidate_profile`, and `extraction_report` are required objects (always present).
All list fields are required keys but may be empty arrays if nothing was found — never omit the
key itself.

---

## Claim Registry

Every atomic statement extracted from the application or resume is a **claim**, and every claim
receives a **stable `claim_id`**. This registry is what makes the Stage 2 evaluation report
(`final_report_structure.md`) auditable — every `supporting_claim_ids` entry there must resolve to a
`claim_id` defined here.

### What counts as a claim

A claim is the smallest unit of extracted information that could independently be cited as
evidence — finer-grained than a section. A single work experience entry is not one claim; it is
a claim **container** holding several individual claims (its responsibilities, its achievements,
its implementation claims).

Each of the following gets its own `claim_id`:

* Each individual responsibility statement within a work experience
* Each individual achievement statement within a work experience
* Each individual implementation claim within a work experience or project
* Each individual architectural claim within a project
* Each individual major feature within a project
* Each normalized technology entry (top-level, in `technologies`)
* Each normalized concept entry (top-level, in `concepts`)
* Each education entry
* Each certification entry
* Each publication entry
* Each top-level achievement entry (not tied to a specific work experience)
* Each miscellaneous claim
* The candidate profile summary, **only if** it contains claim-bearing content (e.g. "led backend
  team of 4") — see `summary_claim_id` below

A `work_experience` or `project` entity is **also** a container with its own `claim_id`, citable
as "this experience/project as a whole" (e.g. for role/domain alignment). This container
`claim_id` is separate from — and in addition to — the child `claim_id`s of its nested
responsibilities/achievements/implementation/architectural/feature claims. Both levels are
independently citable.

**Not claims, and must never receive a `claim_id`:** `languages` entries, `links` entries. Their
models have no `claim_id` field — do not add one.

**Do not create new claims for technology/concept mentions inside a work experience or project.**
A work experience's `technologies` / `concepts` lists hold `claim_id` *references* into the
top-level `technologies` / `concepts` registries (see below) — they are pointers, not new claim
containers.

### ID format

`claim_id` values match the pattern `^claim_\d{4}$` — e.g. `claim_0001`, `claim_0002`.

* Assigned in the order claims are extracted, reading the resume/application top to bottom.
* Sequence numbers are unique and unbroken within a single extraction output — **`claim_id` must
  be globally unique across the entire output.** Two entities sharing a `claim_id` is a hard
  validation failure.
* This is a simple ordinal counter, not a content hash — just number claims sequentially as you
  extract them.
* IDs are stable within one extraction run only; cross-run stability is a separate downstream
  deterministic resolution step, out of scope here (same principle as technology/concept
  name-to-database-row resolution — see Normalization Rules).

### `metadata.claim_count` must equal the actual number of claim_ids in the output

`claim_count` is validated by re-counting every `claim_id` actually present (container +
nested + registry + education + certifications + achievements + publications +
miscellaneous_claims + `summary_claim_id` if set) and rejecting the output if the numbers don't
match. Do not estimate this number — count the `claim_id`s you actually assigned.

### Technology/Concept provenance

Top-level `technologies` / `concepts` entries record which raw claim(s) they were derived from
via `source_claim_ids` (minimum one — this list cannot be empty). Every ID in `source_claim_ids`
must resolve to a real `claim_id` that exists elsewhere in the output; a dangling reference is a
hard validation failure.

---

## General Principles

* Extract explicit information whenever available; preserve original meaning.
* Normalize values whenever possible; never invent information; never discard potentially useful
  information.
* If confidence is low, preserve the information and mark confidence appropriately (see per-entity
  field reference below for which entities carry a `confidence` field).
* This extraction step produces normalized **name strings** only, not database foreign keys —
  resolving `normalized_name` against an existing `technologies.id`/`concepts.id` row (alias
  matching, fuzzy dedup, create-if-missing) is a separate deterministic step performed downstream.

---

## Per-entity field reference

`confidence` (`HIGH`/`MEDIUM`/`LOW`) and `explicit_or_inferred` (`EXPLICIT`/`INFERRED`) are
**not** universal — they only exist on the entities listed for them below. Do not add either
field to an entity that isn't listed. Likewise `source_text` only exists on the four entities
listed under it; no entity has a field called `raw_text` or `source_section` — those do not exist
anywhere in this schema.

| Entity | Required fields | Optional fields | Has `confidence`? | Has `explicit_or_inferred`? | Has `source_text`? |
|---|---|---|---|---|---|
| `ExtractionMetadata` | `schema_version`, `overall_extraction_confidence`, `claim_count` | — | n/a (it *is* a confidence enum field) | no | no |
| `CandidateProfile` | — (all fields optional) | all fields | no | no | no |
| `WorkExperience` (container) | `claim_id`, `source_text`, `confidence` | everything else | **yes** | no | **yes** |
| nested `ClaimItem` (responsibilities / achievements / implementation_claims) | `claim_id`, `text`, `confidence`, `explicit_or_inferred` | — | **yes** | **yes** | no (uses `text`, not `source_text`) |
| `Project` (container) | `claim_id`, `title`, `source_text`, `confidence` | everything else | **yes** | no | **yes** |
| nested `ClaimItem` (implementation_claims / architectural_claims / major_features) | `claim_id`, `text`, `confidence`, `explicit_or_inferred` | — | **yes** | **yes** | no |
| `Technology` / `Concept` (`NormalizedRegistryEntry`) | `claim_id`, `normalized_name`, `raw_name`, `source_claim_ids` (min 1), `confidence`, `explicit_or_inferred`, `contexts` (min 1) | — | **yes** | **yes** | no |
| `Education` | `claim_id` | `degree`, `specialization`, `institution`, `grade`, `start_date`, `end_date`, `current` | no | no | no |
| `Certification` | `claim_id`, `title` | `issuer`, `issue_date`, `expiry_date`, `credential_url` | no | no | no |
| `Achievement` (top-level) | `claim_id`, `title`, `source_text` | `description`, `category` | no | no | **yes** |
| `Publication` | `claim_id`, `title` | `publisher`, `publication_date`, `url` | no | no | no |
| `Language` | `language` | `proficiency` | no | no | no — **no `claim_id` either** |
| `Link` | `type`, `url` | — | no | no | no — **no `claim_id` either** |
| `MiscellaneousClaim` | `claim_id`, `title`, `claim`, `source_text`, `confidence` | `category` | **yes** | no | **yes** |
| `ExtractionReport` | — (all lists default empty) | all fields | no | no | no |

---

## Metadata

```
metadata:
  schema_version: string
  overall_extraction_confidence: HIGH | MEDIUM | LOW
  claim_count: integer   # must equal actual claim_id count — see Claim Registry above
```

Do **not** emit `extraction_timestamp` or `parser_version`. The service attaches both after
validation; you cannot know the wall-clock timestamp or parser implementation version.

---

## Candidate Profile

```
candidate_profile:
  current_title: string | null
  current_company: string | null
  claimed_total_experience_years: number | null
  current_location: string | null
  summary: string | null
  summary_claim_id: claim_id | null   # set only if summary has independently citable claim
                                       # content beyond what's captured elsewhere; else null
  domains: list[string]
  industries: list[string]
  career_focus: string | null
  github_url: string | null
  portfolio_url: string | null
  linkedin_url: string | null
  website_url: string | null
```

---

## Work Experience

Extract every professional experience separately. Do not merge multiple work experiences.

```
work_experience[]:
  claim_id: claim_id            # required — this experience as a citable container
  company: string | null
  role: string | null
  employment_type: string | null
  start_date: string | null
  end_date: string | null
  current: boolean              # defaults false if unstated
  duration: string | null
  domains: list[string]
  responsibilities: list[{ claim_id, text, confidence, explicit_or_inferred }]
  achievements:      list[{ claim_id, text, confidence, explicit_or_inferred }]
  technologies: list[claim_id]  # references into top-level `technologies`, NOT new claims
  concepts:     list[claim_id]  # references into top-level `concepts`, NOT new claims
  implementation_claims: list[{ claim_id, text, confidence, explicit_or_inferred }]
  source_text: string           # required
  confidence: HIGH | MEDIUM | LOW   # required
```

---

## Projects

Extract every project independently. Projects remain independent entities from work experience.

```
projects[]:
  claim_id: claim_id            # required — this project as a citable container
  title: string                 # required
  description: string | null
  role: string | null
  project_type: string | null
  domain: string | null
  technologies: list[claim_id]  # references into top-level `technologies`, NOT new claims
  concepts:     list[claim_id]  # references into top-level `concepts`, NOT new claims
  implementation_claims: list[{ claim_id, text, confidence, explicit_or_inferred }]
  architectural_claims:  list[{ claim_id, text, confidence, explicit_or_inferred }]
  major_features:        list[{ claim_id, text, confidence, explicit_or_inferred }]
  repository_url: string | null
  live_url: string | null
  source_text: string           # required
  confidence: HIGH | MEDIUM | LOW   # required
```

---

## Technologies

Extract every claimed technology **once** as a normalized top-level entry. This is the canonical
registry — `work_experience[].technologies` and `projects[].technologies` reference these entries
by `claim_id` rather than duplicating them.

```
technologies[]:
  claim_id: claim_id
  normalized_name: string
  raw_name: string
  source_claim_ids: list[claim_id]   # min 1 — must resolve to real claim_ids elsewhere in output
  confidence: HIGH | MEDIUM | LOW
  explicit_or_inferred: EXPLICIT | INFERRED
  contexts: list[ "Work Experience" | "Project" | "Skills Section" | "Summary" | "Other" ]  # min 1
```

Do not create duplicate technology entries. If the same normalized technology appears in multiple
contexts (e.g. a work experience and a project), it is **one** entry here with multiple
`source_claim_ids` and multiple `contexts` — not multiple entries.

---

## Concepts

Same registry pattern as Technologies. Represents engineering knowledge, not tools.

```
concepts[]:
  claim_id: claim_id
  normalized_name: string
  raw_name: string
  source_claim_ids: list[claim_id]   # min 1
  confidence: HIGH | MEDIUM | LOW
  explicit_or_inferred: EXPLICIT | INFERRED
  contexts: list[TechConceptContext]  # min 1
```

Do not create duplicate concept entries — same dedup rule as Technologies.

---

## Education

```
education[]:
  claim_id: claim_id      # required
  degree: string | null
  specialization: string | null
  institution: string | null
  grade: string | null
  start_date: string | null
  end_date: string | null
  current: boolean
```

No `confidence`, `explicit_or_inferred`, or `source_text` field on this entity — do not add them.

---

## Certifications

```
certifications[]:
  claim_id: claim_id      # required
  title: string           # required
  issuer: string | null
  issue_date: string | null
  expiry_date: string | null
  credential_url: string | null
```

No `confidence`, `explicit_or_inferred`, or `source_text` field — do not add them.

---

## Achievements (top-level)

Top-level achievements not tied to a specific work experience.

```
achievements[]:
  claim_id: claim_id      # required
  title: string           # required
  description: string | null
  category: string | null
  source_text: string     # required
```

No `confidence` or `explicit_or_inferred` field on this entity — do not add them.

---

## Publications

```
publications[]:
  claim_id: claim_id      # required
  title: string           # required
  publisher: string | null
  publication_date: string | null
  url: string | null
```

No `confidence`, `explicit_or_inferred`, or `source_text` field — do not add them.

---

## Languages

```
languages[]:
  language: string        # required
  proficiency: string | null
```

**No `claim_id` field** — language proficiency is self-reported metadata, not independently used
as evaluation evidence in any downstream scoring bucket.

---

## Links

```
links[]:
  type: "GitHub" | "Portfolio" | "LinkedIn" | "Website" | "Blog" | "Other"   # required
  url: string      # required
```

**No `claim_id` field** — links are pointers, not claims. The content at the link, if analyzed, is
out of scope for this extraction stage.

---

## Miscellaneous Claims

If the resume contains information that does not belong to any canonical section, preserve it
here rather than discarding it.

```
miscellaneous_claims[]:
  claim_id: claim_id      # required
  category: string | null
  title: string           # required
  claim: string           # required
  source_text: string     # required
  confidence: HIGH | MEDIUM | LOW   # required
```

No `explicit_or_inferred` field on this entity — do not add it.

---

## Confidence values

Wherever `confidence` appears (see table above for exactly which entities carry it), allowed
values are `HIGH`, `MEDIUM`, `LOW`. Confidence reflects extraction certainty only — it does not
represent truthfulness of the underlying claim.

## Explicit vs Inferred

Wherever `explicit_or_inferred` appears (only on nested `ClaimItem`s and on `Technology`/`Concept`
entries — see table above), allowed values are `EXPLICIT`, `INFERRED`. Prefer explicit extraction.
Infer only when strongly supported by surrounding context; never infer speculative information.

## Source text

Wherever `source_text` appears (only on `WorkExperience`, `Project`, top-level `Achievement`, and
`MiscellaneousClaim` — see table above), it holds the verbatim/near-verbatim source passage this
entity was extracted from. No other entity has a source-text-shaped field of any name.

---

## Normalization Rules

Normalize common aliases into canonical values (technology names, programming languages,
frameworks, databases, cloud providers, engineering concepts). Always preserve the original value
(`raw_name`) alongside the normalized value (`normalized_name`). This step produces normalized
**name strings** only — resolving a `normalized_name` against an existing database row (alias
matching, fuzzy dedup, create-if-missing) is a separate deterministic step performed downstream,
not part of this extraction.

---

## Extraction Report

```
extraction_report:
  missing_sections: list[string]
  ambiguous_entities: list[string]
  low_confidence_entities: list[claim_id]
  duplicate_entities: list[string]
  ignored_content: list[string]
  parsing_notes: list[string]
```

All six fields default to an empty list — include the key even when empty; do not omit it.

---

## Output Requirements

The extraction output must be:

* deterministic, machine readable, relational, normalized, auditable, reproducible
* reusable across different jobs (job-independent)
* every claim independently citable via a stable `claim_id`
* directly insertable into normalized PostgreSQL tables without further LLM processing, aside
  from the deterministic name-to-ID resolution step described under Normalization Rules

Hard validation failures to avoid (these will reject the output, not just lower its quality):

1. Any field not listed for an entity in the per-entity table above (extra fields are forbidden).
2. Any required field missing for an entity.
3. Two entities sharing the same `claim_id`.
4. `metadata.claim_count` not matching the actual number of `claim_id`s present.
5. A `technology`/`concept` entry with an empty `source_claim_ids`, or one containing a
   `claim_id` that doesn't exist elsewhere in the output.
6. A `technology`/`concept` entry with an empty `contexts` list.
7. Treating a `work_experience[].technologies` / `projects[].technologies` entry as a place to
   invent a new claim, instead of a reference to the top-level registry.

This `candidate_extraction` output becomes the `candidate` field of the combined
`ResumeAnalysisResponse` — see the note at the end of `final_report_structure.md`.
