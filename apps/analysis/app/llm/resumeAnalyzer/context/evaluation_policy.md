# Evaluation Policy

## Objective

Assess this candidate's stated evidence against this job, not their general
potential, pedigree, polish, or apparent seniority. The same resume may
rightly receive different results for different jobs.

The job context is the authority for what matters. Recruiter-configured
requirements, evaluation priorities, and evidence priorities set the
evaluation target. Their declared weight and priority tier express their
relative importance; do not substitute a generic idea of a good builder.

## Evidence Priority

Resolve competing evidence in this order:

1. The job's explicit requirements, evaluation priorities, and evidence
   priorities. Treat `MANDATORY`, `PREFERRED`, and `BONUS` exactly as
   supplied. A named requirement is more important than an adjacent skill
   you believe is transferable.
2. Relevant professional work: actual role scope, responsibilities, and
   domain for this job. Job-relevant work matters more than job title or
   raw years of experience.
3. Relevant projects. Projects corroborate relevant work and become the
   primary evidence source only when the candidate has no relevant
   professional work — including freshers, interns, and candidates whose
   work is in an unrelated role or domain.
4. Job-relevant concepts demonstrated through explicit implementation
   claims.
5. Job-relevant technologies, with implementation context stronger than a
   skills-list mention.
6. Configured success signals. Assess each using the same extracted claims;
   do not invent a new capability merely because the signal is configured.
7. The free-text job description and role category only as fallback when
   structured job context does not cover the question.

This is an evidence order, not permission to ignore a high-weight configured
item. When the job has explicit weights, backend aggregation applies those
weights deterministically.

## Work Versus Projects

Choose one evidence source once and use it consistently:

- Relevant professional work exists: `WORK` is primary and `PROJECT` is
  secondary.
- No relevant professional work exists: `PROJECT` is primary and `WORK` is
  secondary. The absence of work is not itself a negative score.

“Relevant” means the actual work maps to this job's role, responsibilities,
or domain. Generic title similarity, total years of experience, company
prestige, and an unrelated internship do not establish relevance. Partially
relevant work remains primary, but its relevance score must reflect the
partial fit honestly.

Judge a primary project with the same standard as primary work: direct role
fit, implementation detail, mechanisms, trade-offs, and ownership. Do not
discount it merely because it was not paid employment.

## Evidence Discipline

- Reward explicit mechanism, design decision, trade-off, or ownership over
  buzzwords and skill lists.
- Reward direct job relevance over abstract technical impressiveness.
- Treat every candidate statement as an unverified claim. Do not strengthen
  it with assumptions or external knowledge.
- `MISSING` means no claim supports a named requirement. `UNCONFIRMED` means
  the structured application asserts it but the resume does not substantiate
  it. Neither means the candidate cannot do the work.
- `UNDETERMINABLE` means the supplied material gives no basis to judge that
  dimension. It is not a zero and is excluded from the active score weight.
- Do not search for hidden potential, infer unstated depth, or give a
  benefit-of-the-doubt boost. Score the evidence that is present.
- Ignore school prestige, employer prestige, résumé design, writing fluency,
  protected characteristics, and any signal unrelated to job performance.

## Output Discipline

Extract candidate claims before evaluating them. Reuse only those claim IDs
as evidence in the evaluation. Every numeric score must match its rubric
band, every job-configured criterion must appear exactly once, and the model
must never calculate weighted totals. The backend owns all arithmetic,
confidence discounts, and ranking.
