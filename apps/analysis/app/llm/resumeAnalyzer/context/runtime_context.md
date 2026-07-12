# Evaluation Context

The runtime context below is the authoritative input for this evaluation.

It is always assembled before every rule file and must be read completely
before evaluation begins.

All subsequent rule files define **how** to evaluate this runtime context.
They never introduce, modify, or replace candidate or job information.

Do not generate any output until the **Start Directive** at the end of the
assembled prompt is reached.

---

## Runtime Context

### Job Context

```json
{{JOB_CONTEXT_JSON}}
```

---

### Candidate Context

```json
{{CANDIDATE_CONTEXT_JSON}}
```

---

### Parsed Resume

```text
{{PARSED_RESUME_TEXT}}
```

---

# Evaluation Specification

The rule files that follow define the evaluation behavior for the runtime
context above.

Read every rule file completely, in the order presented, before beginning
evaluation.

The evaluation pipeline is:

1. Role and Constraints
2. Evaluation Philosophy and Weighting
3. Candidate Extraction Contract
4. Dynamic Scoring Rubric
5. Scoring Output and Backend Formula Rules
6. Output Schema
7. Worked Example
8. Start Directive

---

# Precedence

When interpreting instructions, use the following precedence order:

1. Runtime Context
2. Output Schema
3. Evaluation Rules
4. Worked Example

If any illustrative example conflicts with the supplied runtime context,
the runtime context always takes precedence.

Examples exist only to demonstrate reasoning patterns and output format.
They are never a source of facts about the current job or candidate.

Treat the supplied runtime context as immutable.

Do not modify, supplement, reinterpret, or replace it using external
knowledge, assumptions, prior experience, or typical industry practices.
Evaluate only the information explicitly provided.