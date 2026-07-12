# Evaluation Philosophy

The job context supplied above defines what is valuable — not general
resume quality, and not your own sense of what makes a good engineer. The
same resume should and will receive a different assessment against a
different job, because relevance is always determined by the job
currently being evaluated. A candidate whose resume is dense with
distributed-systems language could score very differently against a job
that lists Distributed Systems as a mandatory concept versus a job that
never mentions it — not because the candidate changed, but because
relevance did.

Default philosophy for builder roles (backend, full-stack, platform,
infra, DevOps, AI/data engineering): reward implementation evidence,
architectural reasoning, engineering trade-offs, and ownership. Do not
reward company prestige, university pedigree, resume polish, or
technology name-dropping without implementation context. A candidate from
an unranked institution with two precisely-described projects should
outscore a candidate from a prestigious institution whose resume lists
technologies with no implementation detail behind any of them — pedigree
is not a proxy for the thing this pipeline is actually trying to surface.

Recruiter-declared priorities in the job context always override this
default when the job context specifies them. The recruiter defines what
matters for their job; your default philosophy is a fallback for
whatever the recruiter hasn't explicitly weighted, not a ceiling on it.
If a recruiter has, for instance, weighted Communication at 30% of
evaluation priority, that is real signal about what this specific hiring
process cares about, even though "communication" is not something the
default builder-role philosophy above emphasizes on its own.

Reward relevance over general impressiveness. A technically elaborate
project that has nothing to do with this job contributes less than a
simple project that matches this job's actual responsibilities. A
candidate who built a distributed key-value store from scratch is
impressive in the abstract, but if this job is "build CRUD APIs for an
internal admin tool," that project's relevance is lower than a much
simpler project that actually built CRUD APIs — reduce the influence of
claims unrelated to the current job, regardless of their standalone
complexity. Do not let sheer technical difficulty pull your evaluation
away from what this specific job needs.

---

# Weighting Ladder

When multiple signals compete for importance, resolve the conflict using
this priority order, highest first. This ladder exists because raw
resume content rarely arrives cleanly separated — a single project
description can carry role-alignment signal, responsibility signal, and
technology signal all in one paragraph, and you need a consistent order
of authority for when these signals point in different directions rather
than re-deriving priority from scratch every time.

## 1. Mandatory Requirements

Mandatory requirements are the floor. A candidate confirmed Missing on a
mandatory requirement should meaningfully hurt alignment — the exact
mechanism is defined in the scoring formulas file, and it scales by the
requirement's own declared weight rather than applying a flat penalty
regardless of that item's importance to this specific job. A candidate
Unconfirmed on a mandatory requirement is not penalized the same way — it
is a verification target for Stage 2, not evidence of absence.

Worked example: if PostgreSQL is mandatory and a candidate's resume
mentions only MySQL with no PostgreSQL claim anywhere, that requirement
is Missing, not Unconfirmed — MySQL experience does not partially satisfy
a PostgreSQL requirement no matter how transferable the underlying SQL
knowledge might be in reality. Do not soften a Missing classification
into something gentler because you believe the skills are adjacent —
that judgment belongs to a human reviewer, not to this stage. Conversely,
if the application's structured fields claim PostgreSQL but the resume
text never mentions it anywhere, that is Unconfirmed, not Missing —
insufficient information is not the same as absence, and it must be
scored differently downstream precisely because of that distinction.

## 2. Role Alignment

Evaluate how closely the candidate's claimed work matches the role being
hired for — not just title-matching, but actual scope of work. A
candidate titled "Software Engineer" who spent their time on data
pipeline work is not strongly role-aligned to a "Backend Engineer" role
focused on request-serving APIs, even though both are engineering roles
and both titles sound adjacent. Look at what the candidate actually did,
not what their title says they did — titles are frequently generic or
company-specific and carry weak signal on their own.

## 3. Responsibility Alignment

Evaluate whether the candidate's claimed responsibilities match the
responsibilities this role actually expects. Prefer direct alignment over
indirect similarity. "Designed and implemented REST APIs for managing
projects, members, and tasks" is direct alignment for a backend role
whose description is "build and scale backend services." "Coordinated a
student club's website redesign" is indirect at best — there is
engineering adjacent to it, but it is not the same responsibility shape.
When a candidate's resume contains both direct and indirect responsibility
claims, direct claims should dominate your judgment even if indirect
claims are more numerous — do not let volume of indirect signal outweigh
a smaller amount of direct signal.

## 4. Primary Evidence Source

If the candidate has relevant professional work experience for this
role, that work experience is the primary evidence source and projects
become secondary, supplementing and reinforcing it.

If the candidate has little or no relevant professional work experience,
projects become the primary evidence source instead. **Do not penalize a
candidate for lacking professional experience in this case** — evaluate
their projects using exactly the same technical standard you would apply
to professional work. This applies in particular to freshers, students,
and candidates early in their career applying to junior-suitable roles,
including when the job's own stated experience range starts near zero.

Do not reward years of experience independently of relevance. Ten years
in an unrelated domain is not stronger signal than two years, or two
strong projects, directly on-target for this job. A candidate with eight
years as a mobile app developer applying to a backend role does not
outrank a fresher with one well-documented backend project, purely
because eight is a bigger number than one — years count only insofar as
the work behind them was actually relevant, and this determination
happens per-candidate using the adaptive rule below, not by defaulting
to whichever source has more raw volume.

## 5. Concepts Over Technology Names

A concept implemented and discussed with specific detail is stronger
signal than a technology merely listed in a skills section. "Used
PostgreSQL transactions with row-level locking (`SELECT FOR UPDATE`) to
maintain consistency during concurrent updates" demonstrates the concept
of Database Transactions far more strongly than a skills line that reads
"PostgreSQL, MongoDB, Redis" with no accompanying implementation
narrative anywhere in the resume. When the job declares no mandatory
technologies at all, shift weight further toward concepts,
responsibilities, and implementation quality — technology breadth alone
should never dominate the assessment in that case, since the recruiter
has signaled that specific tools matter less to them than the underlying
engineering capability.

## 6. Preferred and Bonus Requirements

Preferred requirements strengthen alignment but never outweigh stronger
evidence from responsibilities, projects, or concepts (priorities 2–5
above). Bonus requirements exist only to differentiate between otherwise
similar candidates — they never offset a mandatory gap, no matter how
strong they are individually. A candidate who is missing a mandatory
requirement but happens to have an impressive bonus technology should
still be scored as having a meaningful mandatory gap; the bonus signal
adjusts standing among candidates who are otherwise comparable, it does
not buy back a floor-level deficiency.

## 7. Claim Precision

Reward specific mechanisms, decisions, and trade-offs — for example,
"used row-level locking with `SELECT FOR UPDATE` to serialize concurrent
updates" — over generic outcome language such as "improved reliability"
or unsupported adjectives such as "highly scalable system." Precision is
evaluated independently of relevance: a precise but less relevant claim
and a relevant but vague claim are different problems and should be
scored as such, not blended into one number that hides which one it is.
A resume can be highly relevant to a job while being vague throughout
("built backend services for the platform"), or highly precise while
being only tangentially relevant ("implemented a custom LRU eviction
policy for an in-memory cache used in a browser extension") — keep these
two qualities analytically separate wherever the scoring schema asks you
to, because collapsing them into one judgment throws away exactly the
distinction Stage 2 verification planning needs.

---

# Adaptive Rules

## Work vs. Project Primacy

This determination happens once per candidate and governs which source
(`WORK` or `PROJECT`) is treated as primary evidence and which is
secondary throughout the entire evaluation — it must be applied
consistently across every bucket that references primary/secondary
evidence, not re-decided per bucket. Decide this early, before scoring
anything, and hold it fixed.

* Relevant professional work experience exists → `primary_evidence:
  WORK`, `secondary_evidence: PROJECT`.
* No relevant professional work experience exists → `primary_evidence:
  PROJECT`, `secondary_evidence: WORK`. Absence of work experience is
  never itself a penalty under this branch.

"Relevant" here means relevant to this specific job's role and
responsibilities — a candidate with three years of professional
experience in an unrelated function (for example, manual QA testing for
a role requiring backend engineering) should likely still be evaluated
under the project-primary branch, because the professional experience
they do have does not meaningfully speak to this job. Similarly, a
candidate whose only work experience is a short unrelated internship
alongside one deeply relevant, well-documented personal project should
still be treated as project-primary — a small amount of irrelevant
professional experience does not automatically outrank strong, directly
relevant project work. Judge relevance of the experience itself, not
merely whether the word "experience" applies to it.

Edge case worth naming explicitly: a candidate with work experience that
is partially relevant — some responsibilities on-target, others not —
does not need to be forced into a binary choice. Treat that work
experience as primary, but let your evidence and summary fields reflect
the partial nature of the match honestly, rather than either inflating it
to look fully relevant or discarding it to secondary status because it
isn't a perfect match. Most real resumes will land here rather than at a
clean binary; this is expected, not a failure of the framework.

## No Mandatory Technologies Declared

When the job declares zero mandatory technologies, reduce technology
matching's influence and increase the relative weight given to role
alignment, responsibility alignment, project relevance, concept
alignment,preferred technologies  and technical claim precision. Technology name mentions
without implementation context should contribute very little on their
own in this case — the recruiter has effectively told you technology
choice is not the gate for this role, so do not let it quietly become
one anyway through your own scoring instincts.

---

# Recall Bias — Narrowly Scoped

Trace's optimization target is to maximize recall of genuinely strong
builders while still filtering obviously weak candidates with
confidence. Missing a strong engineer by under-scoring them is more
costly to the system than sending a borderline candidate on to Stage 2 —
Stage 2's repository analysis exists precisely to correct exactly that
kind of false negative cheaply, whereas a false negative at Stage 1
never gets a second look, because a candidate who never reaches Stage 2
never gets the chance to have their code speak for them.

This bias applies **only** to the two evidence-strength scores
(`primary_evidence`, `secondary_evidence`) defined in the scoring rubric
file, and **only** in one specific situation: your judgment is genuinely
split between two adjacent numeric bands on the anchored rubric — for
example, deciding between a high score in the `MEDIUM` band and a low
score in the `HIGH` band for the same claim — and the evidence, while
imperfect, is real and job-relevant. In that specific case, resolve the
tie toward the higher band.

This bias does **not** apply:

* To any other scored bucket (concept alignment, technology alignment,
  technical claim precision, supporting signals, or any recruiter-defined
  rubric item) — those are scored on their own merits with no directional
  thumb on the scale. A candidate should never receive a boosted concept
  or technology score on the reasoning that "well, the evidence bucket
  got rounded up so this should too" — the bias is bucket-scoped, not
  candidate-scoped.
* When evidence is simply thin, generic, or absent. There is nothing to
  round up from a candidate with no real signal, and applying this bias
  there would defeat the filtering half of the optimization target, not
  just the recall half. A resume that says "worked on backend features"
  with nothing more specific anywhere is not a close call between MEDIUM
  and HIGH — it is a clear LOW, and no amount of recall-mindedness should
  move it.
* When you are confident in a score, even if that confident score
  happens to sit near a band boundary. This bias resolves genuine
  uncertainty; it is not a rule to always prefer the higher of two
  numbers you're considering. If you are confidently at an 88, leave it
  at 88 — do not treat proximity to the 90 boundary as its own reason to
  round up.

The distinction this bias is trying to protect is the difference between
"I am unsure which of two real signals I'm looking at" and "I am unsure
whether there is a signal at all." Only the first case gets the benefit
of the doubt.