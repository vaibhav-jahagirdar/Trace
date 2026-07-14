# Evaluation Order and Backend Scoring

## Evaluation Order

Apply this sequence for every candidate:

1. Extract all candidate claims independently of the job.
2. Read the job's configured requirements, evaluation priorities, and
   evidence priorities. Score every configured item exactly once.
3. Select `WORK` as primary when relevant professional work exists;
   otherwise select `PROJECT` as primary. This includes freshers, interns,
   and candidates whose work is unrelated to the role.
4. Score the selected primary evidence source, then the secondary source.
   Judge relevance from role, responsibility, and domain match — never total
   years alone.
5. Score job-relevant concepts, then technologies.
6. Score configured success signals using the same grounded claims.
7. Use the free-text job description only to fill a genuine gap left by thin
   structured job configuration.

The evaluation object reports raw 0–100 evidence judgments. It never reports
weighted points or `resume_match_score`.

## Score Semantics

Every non-`UNDETERMINABLE` scored value has a 0–100 integer score, a matching
rubric rating, confidence, a grounded summary, and supporting claim IDs.
`UNDETERMINABLE` has `score: null` and no supporting claim IDs. A score of
zero is a real judged absence of meaningful evidence; it is not a substitute
for `UNDETERMINABLE`.

`primary_evidence` and `secondary_evidence` each contain independent
`relevance` and `quality` axes. Their combined score is the rounded average
of the two axes. The source itself is declared only in
`experience_analysis.primary_source` / `secondary_source`.

## Backend-Owned Formula

The backend applies confidence before weighting:

```
effective_score = score × {HIGH: 1.00, MEDIUM: 0.90, LOW: 0.75}[confidence]
```

Configured job criteria receive the largest combined allocation. This makes
the job context a real ranking input rather than a decorative prompt field.

| Component | Maximum points |
| --- | ---: |
| primary evidence | 25 |
| secondary evidence | 10 |
| concept alignment | 10 |
| technology alignment | 5 |
| technical claim precision | 5 |
| supporting signals | 5 |
| named requirement coverage | 15 |
| recruiter priorities | 25 |

For a direct evidence bucket:

```
bucket_points = effective_score / 100 × bucket_max_points
```

Requirement coverage is derived from the job's canonical requirements, not
from model-supplied weights:

```
status_mult: CONFIRMED = 1.0, UNCONFIRMED = 0.5, MISSING = 0.0
tier_mult:   mandatory = 1.0, preferred = 0.6, bonus = 0.3

coverage = 15 × Σ(status_mult × tier_mult × requirement.weight)
                 / Σ(tier_mult × requirement.weight)
```

Recruiter priorities are all configured `evaluationPriorities`,
`evidencePriorities`, and `successSignals` with a non-null score. The
backend looks up each item's weight from job context and applies its copied
priority tier:

```
priority_points = 25 × Σ(effective_score / 100 × item.weight × tier_mult)
                       / Σ(item.weight × tier_mult)
```

## Adaptive Denominator

Do not penalize a candidate or cap a score because the job provides no
requirements/priorities or because the selected secondary source has no
claims. A component is inactive when it has no configured job items or its
source is genuinely `UNDETERMINABLE`.

```
resume_match_score = 100 × sum(points from active components)
                         / sum(maximum points for active components)
```

The backend returns `requirement_coverage`, `recruiter_weighted_priorities`,
and `resume_match_score` after validation. Never calculate or emit these
fields yourself.
