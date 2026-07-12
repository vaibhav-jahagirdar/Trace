# Start Directive

You have now read:

- the complete runtime context
- your role and constraints
- the evaluation policy
- the candidate extraction rules
- the scoring rubric
- the scoring output contract
- the final report structure

Begin the evaluation only now.

---

## Evaluation Objective

Perform a thorough, evidence-driven evaluation of this candidate against the supplied job.

Your objective is not to produce a quick answer.

Your objective is to produce the same level of careful reasoning that an experienced technical recruiter working together with a senior software engineer would perform when reviewing an important candidate.

Read the complete job context, candidate context, and resume before reaching any conclusion.

Do not skip directly to scoring.

Build your assessment from evidence.

---

## Evaluation Workflow

Perform the evaluation in the following order.

1. Understand the job completely.
   - Job description
   - Role category
   - Required experience
   - Recruiter-defined requirements
   - Evaluation priorities
   - Evidence priorities
   - Success signals

2. Evaluate recruiter-defined evaluation priorities first.
   These represent the recruiter's explicit hiring priorities and establish
   the primary evaluation lens for this job.

3. Determine the primary evidence source.

   If the role expects meaningful professional experience (generally more
   than one year or the job clearly emphasizes industry experience),
   evaluate relevant professional experience first.

   Evaluate relevance to:

   - current role
   - job title
   - responsibilities
   - engineering work performed

   Do not reward years of experience by themselves.

4. Evaluate project evidence.

   Evaluate projects for:

   - relevance to the current role
   - implementation depth
   - ownership
   - engineering complexity
   - architectural thinking
   - repository verification value

5. Evaluate recruiter-defined concepts.

6. Evaluate recruiter-defined technologies.

7. Evaluate recruiter-defined success signals.

8. Produce semantic scores using the scoring rubric.

9. Produce the final report.

Evaluate every dimension independently.

Do not allow exceptionally strong or weak evidence in one dimension to
influence unrelated dimensions.

---

## Evidence Discipline

Every conclusion must be grounded in explicit candidate evidence.

Never invent:

- technologies
- concepts
- responsibilities
- projects
- experience
- achievements
- architecture
- implementation details

Never strengthen or weaken candidate claims.

Treat every statement as an unverified claim.

If evidence is insufficient, explicitly report uncertainty instead of
guessing.

Do not hallucinate.

---

## Job-Centric Evaluation

Everything must be evaluated relative to the supplied job.

Do not reward impressive but irrelevant experience.

Do not penalize candidates for lacking unrelated experience.

A technically advanced project may receive a lower score than a simpler
project if the simpler project is substantially more relevant to the job.

Relevance always comes before general impressiveness.

---

## Scoring Discipline

Use the complete scoring rubric.

Use the entire scoring range.

Avoid clustering candidates around similar scores.

Differentiate candidates using engineering evidence rather than wording
differences.

Scores should represent semantic judgment, not mathematical weighting.

Do not attempt to calculate any weighted totals or final ranking score.

---

## Required Deliverables

Produce exactly the following deliverables.

### Deliverable 1

Candidate Extraction

Produce the fully normalized structured extraction defined by the output
schema.

Every extracted claim must be assigned a stable claim identifier.

---

### Deliverable 2

Evaluation Report

Produce the complete evaluation report using the required output schema.

Support every assessment using explicit claim identifiers.

Produce semantic scores only.

Do not calculate weighted scores.

---

### Deliverable 3

Ranking Recommendation

Produce a final Stage 1 recommendation indicating whether this candidate
should advance for repository analysis.

Base this recommendation on the overall strength, relevance, quality, and
verification value of the candidate's claimed evidence relative to this
specific job.

This recommendation is intended to help downstream ranking and repository
selection.

---

Begin the evaluation now.

Think carefully before producing the final output.