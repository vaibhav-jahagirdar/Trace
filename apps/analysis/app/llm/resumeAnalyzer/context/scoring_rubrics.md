# Scoring Rubrics

This document defines how every evaluation bucket should be scored to produce a consistent, explainable, and auditable Resume Match Score.

The objective is to measure **resume-to-job alignment**, **not** engineering ability, hiring recommendation, future performance, or claim truthfulness.

Every score must be supported by explicit candidate claims and evaluated only relative to the supplied job.

---

# Universal Scoring Principles

Every evaluation must follow these principles.

* Score only against the supplied job context.
* Treat every candidate statement as an unverified claim.
* Never infer missing information.
* Never reward unrelated experience or technologies.
* Reward implementation over outcomes.
* Reward precision over buzzwords.
* Reward depth over breadth.
* Reward relevance over general impressiveness.
* Reward repeated evidence over isolated mentions.
* Reward internally consistent resumes.
* Preserve uncertainty whenever information is insufficient.

Every point awarded must be explainable using explicit resume or application claims.

---

# Bucket 1 — Primary Evidence Source (35 Points)

This is the most influential evaluation bucket.

Determine the primary evidence source before scoring.

## If Relevant Professional Experience Exists

Professional work becomes the Primary Evidence Source.

Projects become Secondary Evidence.

Evaluate:

* responsibility alignment
* implementation relevance
* ownership
* architectural involvement
* domain relevance
* technical complexity
* repository verification value

Years alone must never determine this score.

---

## If No Relevant Professional Experience Exists

Projects become the Primary Evidence Source.

Do not penalize freshers or interns for lacking professional work.

Evaluate projects using exactly the same technical standards applied to professional work wherever possible.

---

### Score Guidance

**31–35**

Exceptional alignment.

Primary evidence demonstrates repeated, highly relevant implementation experience with very little uncertainty.

Claims strongly suggest valuable repository verification.

---

**24–30**

Strong alignment.

Evidence is clearly relevant with meaningful implementation claims.

Some uncertainty remains.

---

**16–23**

Moderate alignment.

Evidence is partially relevant.

Implementation depth or responsibility overlap is limited.

---

**8–15**

Weak alignment.

Mostly generic work with limited relevance.

Implementation evidence is sparse.

---

**0–7**

Little or no meaningful alignment.

---

# Bucket 2 — Secondary Evidence Source (20 Points)

Evaluate whichever source was not used as Primary Evidence.

Projects should strengthen professional work.

Professional work should strengthen projects.

Secondary evidence should reinforce the overall assessment but should never outweigh stronger Primary Evidence.

---

### Score Guidance

17–20

Strong complementary evidence.

---

12–16

Meaningful supporting evidence.

---

6–11

Limited supporting evidence.

---

1–5

Weak supporting evidence.

---

0

No relevant supporting evidence.

---

# Bucket 3 — Concept Alignment (15 Points)

Evaluate only recruiter-defined concepts.

Concepts represent transferable engineering understanding.

Reward:

* direct implementation
* repeated use
* responsibility overlap
* project relevance
* explicit discussion

Reduce scores when concepts are:

* only listed
* weakly supported
* unrelated
* implied rather than claimed

---

### Score Guidance

13–15

Exceptional concept alignment.

---

10–12

Strong concept alignment.

---

6–9

Moderate concept alignment.

---

1–5

Weak concept alignment.

---

0

No meaningful concept alignment.

---

# Bucket 4 — Technology Alignment (8 Points)

Technology importance depends entirely on recruiter intent.

## Mandatory Technologies

When mandatory technologies exist:

Evaluate them as core technical requirements.

Strong implementation claims involving mandatory technologies should receive high scores.

Missing mandatory technologies should significantly reduce this bucket.

Unconfirmed technologies must never be treated as missing.

---

## Preferred Technologies

Preferred technologies strengthen alignment.

Do not allow preferred technologies to outweigh:

* projects
* responsibilities
* concepts
* implementation quality

---

## Bonus Technologies

Bonus technologies provide additional differentiation only.

---

## No Mandatory Technologies

When no mandatory technologies exist:

Reduce technology influence.

Prioritize:

* concepts
* implementation
* responsibilities
* projects

Technology names without implementation claims should contribute little.

---

### Score Guidance

7–8

Excellent technology alignment.

---

5–6

Strong alignment.

---

3–4

Moderate alignment.

---

1–2

Weak alignment.

---

0

No meaningful technology alignment.

---

# Bucket 5 — Technical Claim Quality (8 Points)

This bucket evaluates resume quality from an engineering perspective.

It does **not** evaluate writing ability.

Reward claims that explain:

* implementation
* engineering decisions
* mechanisms
* technical reasoning
* architecture
* trade-offs
* constraints
* design choices

Reduce scores for:

* buzzwords
* generic summaries
* unsupported adjectives
* vague accomplishments
* technology dumping

Implementation specificity should consistently outperform marketing language.

---

### Score Guidance

7–8

Highly precise technical communication.

---

5–6

Mostly implementation-oriented.

---

3–4

Mixed precision.

---

1–2

Mostly generic.

---

0

No meaningful technical detail.

---

# Bucket 6 — Recruiter Rubric Alignment (10 Points)

Evaluate all recruiter-defined:

* Evaluation Dimensions
* Success Signals
* Evidence Categories

Do not invent additional criteria.

Use only recruiter-provided definitions.

Support every assessment with candidate claims.

---

### Score Guidance

9–10

Exceptional alignment.

---

7–8

Strong alignment.

---

4–6

Moderate alignment.

---

1–3

Weak alignment.

---

0

No alignment.

---

# Bucket 7 — Supporting Signals (4 Points)

Includes:

* education
* certifications
* publications
* awards
* achievements

Only reward when directly relevant to the supplied job.

Supporting signals must never compensate for weak technical alignment.

---

# Potential Technical Outlier

This is **not** additional score.

A candidate may be flagged as a Potential Technical Outlier when:

* mandatory gaps are limited
* role remains reasonably adjacent
* concepts are exceptionally strong
* implementation claims are consistently high quality
* repository verification value is exceptionally high

Do not increase the Resume Match Score.

Instead recommend repository analysis despite the requirement gap.

---

# Overall Resume Match Score

The final score must represent:

**How strongly do the candidate's unverified claims align with this specific job?**

The score must never represent:

* engineering ability
* intelligence
* future success
* verified expertise
* hiring recommendation

---

# Score Calibration

95–100

Reserved for truly exceptional resume-to-job alignment.

Should be uncommon.

---

85–94

Strong candidate.

Clearly merits repository analysis.

---

70–84

Good alignment.

Competitive repository analysis candidate.

---

55–69

Moderate alignment.

Repository analysis depends on ranking threshold.

---

40–54

Weak alignment.

Meaningful gaps exist.

---

Below 40

Poor alignment.

Limited job relevance.

---

# Scoring Discipline

Use the full scoring range.

Avoid clustering candidates around similar scores.

Differentiate candidates based on meaningful technical signals rather than small wording differences.

Every bucket should be evaluated independently before producing the final score.

The final Resume Match Score must be:

* consistent
* explainable
* reproducible
* auditable
* grounded only in explicit candidate claims
* optimized for prioritizing repository analysis.
