# Scoring Contract

version: 1.0

purpose:
Produce a deterministic, auditable Resume Match Score representing resume-to-job alignment for repository analysis prioritization.

scoring:

primary_evidence:

```
max_score: 35

adaptive: true

required: true

description: >
  Highest priority evidence source.

  If relevant professional work experience exists,
  evaluate work experience.

  Otherwise evaluate projects.

  Never penalize freshers or interns for lacking
  professional experience.
```

secondary_evidence:

```
max_score: 20

adaptive: true

required: true

description: >
  Secondary supporting evidence.

  If work experience is primary,
  projects become secondary.

  Otherwise work experience becomes secondary.
```

concept_alignment:

```
max_score: 15

adaptive: false

required: true

description: >
  Alignment with recruiter-defined concepts.

  Concepts should be evaluated independently from
  technologies.
```

technology_alignment:

```
max_score: 8

adaptive: true

required: true

description: >
  Technology importance depends on recruiter intent.

  Mandatory technologies receive significantly
  higher influence.

  Preferred and Bonus technologies should not
  outweigh stronger implementation,
  responsibility,
  project,
  or concept signals.

  If no mandatory technologies exist,
  reduce technology influence.
```

technical_claim_quality:

```
max_score: 8

adaptive: false

required: true

description: >
  Evaluate implementation specificity,
  engineering precision,
  technical reasoning,
  architecture,
  trade-offs,
  internal consistency,
  and repository verification value.
```

recruiter_alignment:

```
max_score: 10

adaptive: false

required: true

description: >
  Combined evaluation of recruiter-defined

  Evaluation Dimensions

  Success Signals

  Evidence Categories
```

supporting_signals:

```
max_score: 4

adaptive: false

required: true

description: >
  Education,
  certifications,
  awards,
  publications,
  achievements,
  and other supporting qualifications.
```

overall_score:

minimum: 0

maximum: 100

formula: |

```
Resume Match Score =

  Primary Evidence

+ Secondary Evidence

+ Concept Alignment

+ Technology Alignment

+ Technical Claim Quality

+ Recruiter Alignment

+ Supporting Signals
```

ranking:

sort_order:

```
Resume Match Score DESC
```

primary_tiebreakers:

```
- Primary Evidence

- Concept Alignment

- Technical Claim Quality

- Recruiter Alignment
```

secondary_tiebreakers:

```
- Role Alignment

- Responsibility Alignment
```

adaptive_rules:

relevant_work_experience_exists:

```
primary_evidence: work_experience

secondary_evidence: projects
```

no_relevant_work_experience:

```
primary_evidence: projects

secondary_evidence: work_experience
```

mandatory_technologies_exist:

```
technology_priority: high
```

no_mandatory_technologies:

```
technology_priority: reduced

increase_relative_focus:

  - role_alignment

  - responsibility_alignment

  - project_alignment

  - concept_alignment

  - technical_claim_quality
```

repository_analysis:

default_action:

```
Rank candidates by Resume Match Score.

Highest ranked candidates receive repository analysis first.
```

technical_outlier:

affects_score: false

affects_ranking: false

repository_override_allowed: true

conditions:

```
- limited mandatory gaps

- exceptionally strong transferable concepts

- exceptionally strong implementation claims

- exceptionally high repository verification value

- role remains reasonably adjacent
```

output:

```
potential_technical_outlier: boolean

justification: required

repository_analysis_recommended: boolean
```

confidence:

required_for_every_bucket: true

values:

```
- HIGH

- MEDIUM

- LOW
```

score_validation:

total_score:

```
Sum of all bucket scores must equal Resume Match Score.
```

bucket_limits:

```
No bucket may exceed its maximum score.

No bucket may be negative.
```

reasoning:

```
Every non-zero bucket score must be supported by explicit candidate claims.

Every deduction should be explainable.
```

output_requirements:

required:

```
- Resume Match Score

- Bucket Scores

- Confidence per Bucket

- Overall Confidence

- Role Fit

- Strengths

- Gaps

- Missing Mandatory Requirements

- Repository Analysis Priority

- Verification Targets

- Potential Technical Outlier

- Technical Summary
```

principles:

* Resume Match Score measures only resume-to-job alignment.

* Never estimate engineering ability.

* Never estimate future performance.

* Never verify candidate claims.

* Never infer missing information.

* Every score must be job-relative.

* Every score must be auditable.

* Every score must be reproducible.

* Every score must be grounded in explicit candidate claims.

* Similar resumes evaluated against the same job should produce similar scores.
