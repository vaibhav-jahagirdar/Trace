# Dynamic Scoring Rubric

## Why This File Exists

Stage 1's primary purpose is ranking, not classification. Out of several
hundred candidates, a categorical label alone cannot do the job. If three
hundred candidates all receive `technical_depth: HIGH`, that label has
told the pipeline nothing about which of those three hundred deserves one
of the handful of expensive Stage 2 slots first — the classification is
true but useless for its actual purpose.

Consider two candidates against a backend role:

* Candidate A: built CRUD endpoints, used JWT for auth, used PostgreSQL
  as the database.
* Candidate B: built a transaction helper with `SELECT FOR UPDATE`
  row-level locking, refresh token rotation, RBAC, audit logging, and
  optimistic locking for a separate high-write-contention path.

Both candidates could reasonably be labeled `HIGH` technical depth by a
purely categorical rubric — both show real backend work, both go beyond
the bare minimum. But no engineer reviewing these two side by side would
call them equal. Candidate B has done more, at greater depth, with more
distinct hard problems solved correctly. A rubric that cannot express
that difference is not doing its job.

This is exactly what a human interviewer does instinctively when
comparing two "strong" resumes: not "both are High, therefore equal," but
"both are High, one is an 82 and one is an 88." This file exists to make
that same fine-grained judgment explicit, consistent, and reproducible
across every candidate this pipeline ever scores — not left to whatever a
model happens to feel like on a given run.

The architecture stays hybrid, per the weighting-ownership constraint
established earlier in this prompt: you supply the fine-grained numeric
judgment, because you can perceive qualitative differences in
implementation evidence that a fixed backend rule cannot see. The backend
supplies all weighting and aggregation, because that has to be
deterministic, reproducible, and instantly adjustable by a recruiter
without re-running you on every candidate. This file governs your half of
that split.

---

## Checking What the Job Actually Declared, Before Scoring Anything

Before applying the anchored band table below to any bucket, check what
the job context actually populated. The job's evaluation surface arrives
as five independently-populated arrays plus one free-text description,
and none of the five arrays are guaranteed to contain anything:

* `evaluationPriorities` — recruiter-defined evaluation dimensions (for
  example, Technical Depth, Communication)
* `evidencePriorities` — recruiter-defined evidence categories (for
  example, GitHub Activity, Portfolio)
* `successSignals` — recruiter-defined success signals (for example,
  Fast Ramp-Up, High Retention)
* `requirements.mandatory` / `.preferred` / `.bonus`, filtered to
  `type: "CONCEPT"` — the job's declared concept requirements
* `requirements.mandatory` / `.preferred` / `.bonus`, filtered to
  `type: "TECHNOLOGY"` — the job's declared technology requirements

Check these in this order, every time, before scoring anything that
depends on them:

1. **Evaluation priorities and evidence priorities present?** If
   `evaluationPriorities` and/or `evidencePriorities` contain at least
   one item, those items are explicit, recruiter-authored statements of
   what this specific hiring process cares about, and how much —
   stronger signal than your own default judgment from the philosophy
   file. Score every item present in these arrays.
2. **Concepts present?** Filter `requirements.mandatory`, `.preferred`,
   and `.bonus` to `type: "CONCEPT"`. If any exist, these are the job's
   named concept requirements and drive both `requirement_analysis` and
   the broader `concept_alignment` judgment.
3. **Technologies present?** Same filter, `type: "TECHNOLOGY"`. If any
   exist, these drive `requirement_analysis` and `technology_alignment`.
4. **Success signals present?** If `successSignals` contains at least
   one item, score each one.

**If a category above is populated, evaluate against those specific
named items first, and weight your judgment of that category primarily
by how well the candidate's claims map onto those exact named items** —
not by your own independent sense of what a good backend engineer looks
like in general. A recruiter who named "Distributed Systems" as a
preferred concept has told you that concept matters here more than your
default philosophy would have guessed on its own; a recruiter who left
`evidencePriorities` empty has told you nothing structured about
evidence weighting at all, and you should not invent structure that
isn't there.

**If a category above is empty, do not leave the corresponding bucket
low or `UNDETERMINABLE` by default.** Fall back to the job's free-text
`job.description` and `job.roleCategory` (both always present —
`description` is a required field on every job, never null) plus the
default builder-role philosophy from the philosophy file, and reason
about relevance from there. An empty `evaluationPriorities` array does
not mean nothing about this job can be evaluated for technical depth —
it means the recruiter didn't configure a structured rubric for it, and
you fall back to reading the job the way a competent recruiter would
read it unassisted: from its title, description, and role category.

### Evaluation priorities, evidence priorities, and success signals carry their own priority tier

Every item in `evaluationPriorities`, `evidencePriorities`, and
`successSignals` carries a `priority_type` of `MANDATORY`, `PREFERRED`,
or `BONUS` — the same three-tier structure used for technology and
concept requirements, not a separate concept unique to those three
lists. A recruiter can mark "Technical Depth" as `MANDATORY` inside
`evaluationPriorities`, exactly the way they can mark "PostgreSQL" as
`MANDATORY` inside `requirements`. Treat this tier with the same
seriousness the weighting ladder gives mandatory technology/concept
requirements: a `MANDATORY` evaluation priority, evidence priority, or
success signal scored very low is a meaningfully worse signal than a
`PREFERRED` or `BONUS` one scored equally low, even though both are
scored on the same 0–100 anchored scale using the same rubric below.
Report each item's `priority_type` alongside its score in your output —
the backend's weighting formula applies the same tier-sensitivity here
that it already applies to requirement coverage, and it can only do that
if you pass the tier through rather than dropping it.

---

## The Anchored Band Table

Every score you produce anywhere in your evaluation output is a number
from 0 to 100, and that number always falls inside exactly one of five
bands. The band is not a separate judgment you make — it is mechanically
determined by which range your number falls into. **Never** output a
`rating` of `HIGH` alongside a `score` of 60; that is a self-contradiction
and one of the most damaging errors you can make in this pipeline, since
downstream systems may read either field and expect them to agree.

This is the one rubric, reused for every scored field in your output —
the two evidence buckets, concept alignment, technology alignment,
technical claim precision, supporting signals, and every recruiter-defined
evaluation dimension, evidence category, and success signal. Applying the
same anchor language everywhere is what makes a 78 in one bucket
comparable in spirit to a 78 in a completely different bucket, and it's
what makes candidate rankings meaningful across a pool of hundreds scored
one at a time, in separate calls, with no memory of each other.

### VERY_HIGH — 90 to 100

**95–100 — Exceptional.** Evidence would be very difficult for an average
engineer to fabricate convincingly. Multiple distinct hard problems are
solved correctly and described with production-grade reasoning — not
just naming a technique, but explaining why it was needed and how it
behaves under the conditions that actually mattered (concurrency,
failure, scale, security). Reserve this for candidates whose claims, taken
together, read like an engineer who has actually shipped and operated
what they describe.

**90–94 — Outstanding.** Multiple advanced implementation details, each
independently convincing, though not quite reaching the density or
production-operational depth of 95–100. A candidate describing several
distinct non-trivial mechanisms (e.g. token rotation *and* row-level
locking *and* audit logging, each with a sentence of real mechanism, not
just a name) sits here rather than in 95–100 if the reasoning behind each
one is present but comparatively brief.

### HIGH — 75 to 89

**85–89 — Strong.** At least one specific, well-described implementation
with genuine mechanism detail, plus some visible architectural thinking —
a reason something was structured the way it was, not just what was
built. This is the band for a single well-executed hard problem, clearly
explained, even without the breadth of the 90+ bands.

**80–84 — Good.** Clear, specific implementation is present, but depth is
somewhat limited — the mechanism is named and roughly explained, but the
"why," the edge cases, or the trade-offs are thin or absent. The
difference between this band and 85–89 is usually exactly that missing
reasoning layer, not the presence or absence of the mechanism itself.

**75–79 — Good but generic-leaning.** Implementation is real and
job-relevant, but the description leans toward what was built rather than
how or why. "Built REST APIs for managing projects, members, and tasks"
sits here — clearly real, clearly relevant, but without the mechanism-level
specificity that would earn 80+.

### MEDIUM — 55 to 74

**65–74 — Moderate, leaning positive.** Relevant work is present, and
there is at least a little implementation detail, but the resume mostly
describes outcomes or scope rather than mechanisms. Job-relevant claims
exist, but most of them would survive being read by someone with only
surface familiarity with the technology named.

**55–64 — Moderate, leaning thin.** Relevance is present but weaker, or
implementation detail is sparse enough that you are inferring competence
more than reading it directly. This is often the right band for a
candidate whose primary evidence source is real but comes from a
tangentially related domain, or whose only relevant claim is a single
under-described line.

### LOW — 30 to 54

**40–54 — Weak but present.** Some claim exists that is nominally
relevant, but it is generic, brief, or largely indistinguishable from
what any candidate could write regardless of whether they actually did
the work. "Worked on backend features using Node.js" with nothing further
sits here.

**30–39 — Very weak.** Barely relevant, or relevant only by the loosest
possible reading, with essentially no implementation substance behind it.

### VERY_LOW — 0 to 29

**10–29 — Little relevant signal.** Something in the resume touches the
topic in question, but so faintly or so far outside the job's actual
scope that it barely counts as evidence one way or the other.

**0–9 — No meaningful evidence.** Nothing in the extracted claims speaks
to this dimension at all. This is not the same as `MISSING` in the
Vocabulary sense used for mandatory/preferred/bonus requirement
classification — a technology or concept can be entirely absent from a
resume (classified `MISSING` in requirement analysis) while a *different*
scored bucket, like overall technical claim precision, still receives a
low but non-zero-context score reflecting whatever else is present. Keep
these two systems — categorical requirement status, and numeric banded
score — distinct in your reasoning even where they're both low for
related reasons.

---

## Differentiating Within a Band

Two candidates who both land in `HIGH` are not required to receive the
same number, and in most cases they should not. Use the following signals
to place a candidate precisely within their band rather than defaulting
to a round, safe-looking number like 80 or 85 out of hedging:

* **Count of distinct mechanisms.** A candidate describing one well-explained
  technique sits lower within a band than one describing several,
  holding explanation quality roughly constant. Returning to the
  candidate A / candidate B comparison above: candidate A (CRUD, JWT,
  PostgreSQL, no deeper mechanism detail) is a 75–79 at best — real and
  relevant, but generic-leaning. Candidate B (transaction helper with row-
  level locking, refresh rotation, RBAC, audit logging, optimistic
  locking on a separate contended path) is 88–92 — multiple distinct hard
  problems, each with real mechanism language. These are not the same
  number, even though a purely categorical rubric would have called both
  `HIGH`.
* **Depth of the "why," not just the "what."** A claim that names a
  technique scores lower within its band than a claim that also explains
  the condition the technique was solving for. "Used row-level locking"
  is weaker than "used row-level locking via `SELECT FOR UPDATE` to
  prevent two concurrent requests from double-booking the same resource."
* **Internal consistency across the resume.** A candidate whose claimed
  depth is corroborated in more than one place (the same mechanism
  referenced consistently across a project description and a skills
  section, for example) sits slightly higher than a candidate making the
  same claim exactly once with no reinforcement anywhere else.
* **Distance from genuinely fabricable boilerplate.** Ask, concretely,
  whether an average engineer skimming a tutorial could produce this
  exact claim without having really built it. Generic phrasing that
  matches common tutorial or boilerplate language pulls a score down
  within its band; specific, slightly awkward, implementation-particular
  phrasing (the kind that's hard to produce without having actually hit
  the problem) pulls it up.

When you write the `summary` field for any scored value, it must
explicitly justify the number against its near neighbors — not just
justify the band. "Strong implementation evidence" is not an adequate
reason for an 86 versus an 83; "explains the concurrency problem being
solved, but only one mechanism is described in this depth" is. If you
cannot articulate why the number isn't five points higher or lower, you
have not finished reasoning about it yet.

---

## Dual-Axis Scoring for Evidence Buckets

The two evidence buckets (`primary_evidence` and `secondary_evidence`,
defined fully in the scoring output file) are scored on **two separate
axes**, not blended into one number by you:

* **Relevance** — how directly this evidence source's work matches this
  job's role, responsibilities, and domain. Anchored to the same band
  table above, read through a relevance lens: a 90+ relevance score means
  the work is essentially what this job asks for; a sub-30 relevance
  score means the work is barely connected to it.
* **Quality** — how well-documented, mechanism-specific, and
  architecturally reasoned the evidence is, independent of whether it's
  relevant to this particular job. Anchored to the same band table, read
  through an implementation-depth lens, exactly as illustrated in the
  Candidate A / Candidate B example above.

Score both axes independently and honestly — a candidate can be highly
relevant but vague (high relevance, low quality: a resume that's clearly
about backend API work but never gets specific about how anything was
built), or highly precise but only loosely relevant (low relevance, high
quality: an exceptionally well-documented distributed systems project for
a job that's mostly about internal CRUD tooling). Collapsing these into
one number would hide exactly this distinction from the parts of the
pipeline that need it most — `project_analysis` and `verification_plan`
downstream want to prioritize by quality/specificity even when relevance
is only moderate, because a precisely-described claim is a *better* Stage
2 verification target than a vague one regardless of how central it is to
this particular job.

The bucket's single reported `score` is the simple average of the two axis
scores, rounded to the nearest integer. Report both axis scores individually
in your output as well as the combined score — never report only the combined
number and discard the two components that produced it.

Every other scored bucket (concept alignment, technology alignment,
technical claim precision, supporting signals, and every recruiter-rubric
item) is scored on a single axis using the same band table directly —
these buckets are already narrowly defined enough (precision *is* a
quality-only measure; a concept or technology is either well-demonstrated
for this job or it isn't, which is inherently a relevance-weighted
judgment already) that splitting them further would add complexity
without adding a distinction any downstream field actually needs.

---

## Discipline Against Clustering

Use the full 0–100 range across the candidates you will score over time.
Do not retreat to safe middle-of-band numbers (70, 80, 90) by default —
those numbers are legitimate destinations when a candidate's evidence
genuinely lands there, not resting points to avoid the work of
differentiating. A resume that is genuinely weak should score low without
hedging upward out of politeness; a resume that is genuinely exceptional
should score in the 90s without hesitating out of a sense that few things
deserve top marks. The banded anchors above exist precisely so that a low
or high score is always traceable to specific, articulable reasons rather
than an impression — lean on them rather than on instinct for where
"safe" numbers live.

This discipline is what makes ranking across a large pool actually work.
A pipeline where every candidate lands between 78 and 85 regardless of
real differences in evidence quality has quietly reintroduced the exact
categorical-collapse problem this whole rubric exists to solve — just
with more decimal places.
