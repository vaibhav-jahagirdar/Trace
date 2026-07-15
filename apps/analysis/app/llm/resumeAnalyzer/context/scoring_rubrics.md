# SCORING RUBRIC (Anchored Scale)

All scored fields use the same **0–100** integer scale. The `rating` (VERY_HIGH, HIGH, etc.) is mechanically determined by the number. **Never** output a `rating` of `HIGH` with a `score` of 60.

---

## 1. Pre-Scoring Directive (Job Context First)

Before scoring, check the job context arrays in this **strict order**. These override your default judgment:

1. **Evaluation & Evidence Priorities** → Score every item present.
2. **Concept Requirements** (`type: CONCEPT`) → Drives `concept_alignment`.
3. **Technology Requirements** (`type: TECHNOLOGY`) → Drives `technology_alignment`.
4. **Success Signals** → Score each one.

**If populated:** Score against these exact named items first.  
**If empty:** Fall back to `job.description` and `roleCategory`. Do not default to `UNDETERMINABLE`—reason from the free-text.

> **Priority Tier Rule:** Items carry `MANDATORY`, `PREFERRED`, or `BONUS`. A `MANDATORY` scored at 40 is a much worse signal than a `BONUS` scored at 40. Pass the `priority_type` to the backend.

---

## 2. The Anchored Band Table

| Band | Score Range | Operational Definition & Neutral Framing |
| :--- | :--- | :--- |
| **VERY_HIGH** | 90–100 | **Exceptional.** Multiple distinct hard problems solved with production-grade reasoning (concurrency, failure, scale, security). Explains *why* and *how*, not just *what*. |
| **HIGH** | 75–89 | **Strong.** At least one specific, well-described implementation with genuine mechanism detail. Visible architectural thinking. |
| **MEDIUM** | 55–74 | **Moderate.** Relevant work exists, but mostly describes outcomes/scope rather than internal mechanisms. |
| **LOW** | 30–54 | **Weak.** Nominal relevance, but claims are generic, brief, or indistinguishable from tutorial boilerplate. |
| **VERY_LOW** | 0–29 | **Minimal / Irrelevant.** No meaningful evidence for *this* job. **Crucially:** If a candidate has deep expertise in an unrelated domain (e.g., iOS for a Backend role), score 0–29 but frame it neutrally in your summary: *"Expertise is orthogonal to this role,"* not *"Candidate is weak."* |

---

## 3. Differentiating Within a Band (5 Signals)

Do not default to safe middle numbers (e.g., always 80). Use these 5 signals to place a candidate precisely:

1. **Count of distinct mechanisms** – More specific techniques = higher within the band.
2. **Depth of the "why"** – Explaining *why* it was needed (e.g., "to prevent double-booking") beats just naming it.
3. **Consistency** – The same mechanism corroborated in multiple sections (project + skills) boosts the score.
4. **Fabricability** – Generic boilerplate phrasing pulls the score down. Implementation-particular phrasing (e.g., "refresh token rotation") pulls it up.
5. **🆕 Conceptual Transfer (Anti-ATS Rule):** Depth in a *comparable but different* tech stack deserves credit. A deep explanation of DynamoDB transactions for a PostgreSQL job scores **higher** than a surface-level mention of PostgreSQL. If the domain is completely orthogonal (e.g., iOS for Backend), signal 5 does not apply—proceed to VERY_LOW with neutral framing.

> **Summary Rule:** Your `summary` must justify the specific number. "Strong evidence" is insufficient for an 86 vs an 83. State: *"Explains concurrency problem, but only one mechanism is detailed."*

---

## 4. Illustrative Contrasts (Do This, Not That)

**IMPORTANT DISCLAIMER:** These are illustrative archetypes, not rigid checklists. Always evaluate the actual mechanism depth provided.

| Scenario | How to Score | Why? |
| :--- | :--- | :--- |
| **Candidate A:** Deep expertise in Spanner/DynamoDB applying for a PostgreSQL job. Describes transaction isolation, indexing, and partitioning. | **Score: 75–85 (HIGH)** – Pass to Stage 2. | Conceptual transfer is confirmed. They understand databases deeply, even if they haven't touched PostgreSQL. |
| **Candidate B:** Lists "PostgreSQL, MongoDB, Redis" in a skills section. No implementation details. | **Score: 30–40 (LOW)** – Filter out. | Surface-level keyword match. No mechanism evidence. Does not deserve "genius" protection. |
| **Candidate C:** Deep expertise in iOS/Swift/ARKit applying for Backend role. | **Score: 10–15 (VERY_LOW)** – Filter out. | Domain is completely orthogonal. Summary must state: *"Excellent iOS depth, but irrelevant to this backend role."* (Neutral framing). |
| **Candidate D:** Built a high-scale CRUD API using Node.js. Describes pagination, indexing, and refresh token rotation. Applying for a Backend role. | **Score: 82-88 (HIGH)** – Pass to Stage 2. | Direct role relevance with solid mechanisms. |

---

## 5. Dual-Axis Scoring (Evidence Buckets Only)

For `primary_evidence` and `secondary_evidence`, score **two independent axes** and average them:

- **Relevance** – How directly does this work match the job's role and domain?
- **Quality** – How well-documented, mechanism-specific, and reasoned is the implementation?

> **Rule:** Report both axis scores individually, and report the rounded average as the final `score`.  
> *Example:* Relevance=90, Quality=60 → Final Score=75.

**All other buckets** (concept alignment, technology alignment, etc.) are scored on a single axis using the band table directly. Do not apply dual-axis logic to those fields.