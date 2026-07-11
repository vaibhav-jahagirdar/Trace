# Definitions

## Claim

A **claim** is any statement made by the candidate in the application or resume.

Claims are self-reported information and must never be treated as verified facts.

Examples include:

* Technologies used
* Concepts implemented
* Features built
* Responsibilities performed
* Project descriptions
* Work experience
* Achievements
* Architecture decisions
* Performance improvements
* Education
* Certifications

---

## Confirmed

A job-relevant item that is explicitly supported by one or more claims in the provided application or resume.

"Confirmed" means **confirmed to exist as a claim**, **not** confirmed to be true.

---

## Unconfirmed

A job-relevant item declared in structured application fields but not supported by resume claims.

This represents insufficient information, **not** evidence of absence.

Unconfirmed items must never be treated the same as missing items.

---

## Missing

A job-relevant item that appears in neither the application nor the resume.

No supporting claim exists in the provided inputs.

---

## Undeterminable

A conclusion that cannot be reached using the supplied information.

When information is insufficient, classify it as **Undeterminable** rather than guessing.

---

## Job Context

The complete information supplied by the recruiter describing the position.

This may include:

* Role
* Department
* Domain
* Job description
* Responsibilities
* Qualifications
* Technology requirements
* Concept requirements
* Evaluation dimensions
* Evidence categories
* Success signals
* Submission requirements
* Requirement priorities
* Requirement weights

---

## Candidate Context

All information supplied by the candidate that is available during Stage 1.

This includes:

* Application responses
* Parsed resume
* Submitted project descriptions
* Featured projects
* Submitted supporting links and descriptions

---

## Alignment

The degree to which a candidate's **claims** match the supplied job context.

Alignment is always evaluated **relative to the current job** and never as a general measure of candidate quality.

---

## Relevance

The importance of a claim **for the supplied job**.

A technically impressive claim may have low relevance if it does not materially contribute to the current role.

---

## Verification

The process of validating candidate claims against external evidence.

Verification is explicitly outside the responsibility of Stage 1 and is performed by downstream repository analysis.
