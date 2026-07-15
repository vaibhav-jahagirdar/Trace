# EVALUATION POLICY (Selection Logic)

## 1. Evidence Priority (Strict Hierarchy)

Resolve competing evidence in this exact order. Higher priority always overrides lower priority:

1. **Structured Job Configuration** – Explicit `requirements`, `evaluationPriorities`, and `evidencePriorities`. Treat `MANDATORY`, `PREFERRED`, and `BONUS` tiers exactly as supplied.
2. **Relevant Professional Work** – Actual role scope, responsibilities, and domain matching this job. (Generic titles, total years, and company prestige are insufficient.)
3. **Relevant Projects** – Become primary **only** if the candidate has no relevant professional work (freshers, interns, or unrelated domains).
4. **Job-relevant Concepts** – Demonstrated through explicit implementation claims (e.g., "used `SELECT FOR UPDATE` for inventory locking").
5. **Job-relevant Technologies** – Implementation context (how/why) outweighs a passive skills-list mention.
6. **Configured Success Signals** – Evaluate using extracted claims; do not invent new capabilities just because a signal is configured.
7. **Free-Text Fallback** – Use `job.description` and `roleCategory` **only** when structured priorities (1–6) provide insufficient direction.

---

## 2. Primary vs. Secondary Source Selection

Select the primary evidence source **once** per candidate and use it consistently across all scoring buckets:

- **Relevant professional work exists** → `WORK` = Primary, `PROJECT` = Secondary.
- **No relevant professional work exists** → `PROJECT` = Primary, `WORK` = Secondary.

**Relevance is defined by:** The actual work's role, responsibilities, and domain matching the job. Generic title similarity or total years do not establish relevance. Partially relevant work remains primary, but its relevance score must reflect the partial fit honestly.

**Note:** The absence of professional work is **not** a negative score. A primary project is judged by the same standard as primary work: direct role fit, implementation detail, mechanisms, trade-offs, and ownership.

---

## 3. Core Judgment Rules (Apply to All Evidence)

Apply these rules strictly when scoring any evidence source:

- **Reward Mechanisms over Buzzwords:** Explicit design decisions, trade-offs, and implementation details outweigh skill lists or technology mentions.
- **Prioritize Job Relevance over Abstract Impressiveness:** Direct alignment with the job's structured requirements takes precedence over general technical brilliance.
- **Treat All Claims as Unverified:** Never strengthen a claim with assumptions, external knowledge, or benefit-of-the-doubt.
- **Do Not Search for Hidden Potential:** Score only the evidence explicitly present. Do not infer unstated depth or future capability.
- **Ignore Non-Technical Biases:** Ignore school prestige, employer prestige, resume design, writing fluency, protected characteristics, or any signal unrelated to job performance.

---

## 4. Handling Outliers & Conceptual Transfer (Anti-ATS Bias)

Trace must **not** behave like a keyword-matching ATS. Apply these specific rules to protect geniuses/outliers:

- **Do Not Penalize Missing Exact Keywords:** A candidate who deeply understands distributed systems, indexing, and transaction isolation (e.g., in DynamoDB or Cassandra) **should not** be heavily penalized for a job asking for PostgreSQL. Credit conceptual mastery of the underlying engineering domain.
- **Zero Fit is Not a Negative Judgment:** If a claim is technically profound but completely unrelated to the job's domain, it earns a `VERY_LOW` alignment score—but this reflects **a lack of fit for this specific role**, not a lack of ability. Do not label the candidate negatively in your qualitative summaries (e.g., avoid "weak engineer"). Use neutral phrasing: "Irrelevant to this job."
- **Surface Mentions = No Credit:** If a candidate merely lists the exact matching technology (e.g., "PostgreSQL") without any implementation mechanism or trade-off reasoning, score them at the bottom of the `LOW` band (30–40). They do not earn "genius" protection because they provided no evidence of depth.
- **Deep Mechanisms = Partial Credit:** If a candidate demonstrates deep mechanisms in a *different but comparable* technology stack, score them in the `MEDIUM` to `HIGH` band for conceptual alignment, depending on how directly the mechanism translates.

> **Summary Rule:** Reward depth of engineering reasoning. Do not reward buzzwords. Do not punish missing keywords. When relevance is zero, score it as zero—but never frame it as a character or ability flaw.