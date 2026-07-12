# ADR NNNN: <Short imperative title>

<!--
  HOW TO USE
  Copy this file to `docs/adr/NNNN-kebab-title.md` (next free number, zero-padded to 4 digits).
  Keep the metadata block below exactly — same four fields, same order. Then delete the guidance
  comments (like this one) and fill each section. Run `npx prettier --check "docs/adr/*.md"` before committing.

  Status — ONE token from this fixed set, nothing else on the line (no phases, no parentheticals):
      Proposed | Accepted | Rejected | Deprecated | Superseded by ADR-00XX
    - Implemented / shipped ⇒ Accepted. There is NO separate "Implemented" status.
    - "Superseded by ADR-00XX": hyphen, zero-padded (e.g. `Superseded by ADR-0010`).
    - Progress, phase breakdown, or what is deferred does NOT go in Status — put it in the optional
      "Implementation status" note below the block (see ADRs 0009 / 0010 / 0015 / 0017) or an in-body section.

  Date — YYYY-MM-DD, with an optional suffix noting a later transition:
      (accepted YYYY-MM-DD) | (implemented YYYY-MM-DD) | (updated YYYY-MM-DD)

  Related — the SINGLE label for every kind of reference (ADRs, packages, apps). List them inline.
    Not "Related package" / "Related packages" / "Related apps".
-->

- Status: Proposed
- Date: YYYY-MM-DD
- Decision owners: Radix NG maintainers
- Related: ADR NNNN, `packages/primitives/<name>`

<!--
  OPTIONAL — add only once something has shipped; delete this note while the ADR is still just Proposed.
  It is where progress / phase status / intentional deferrals live (kept OUT of the Status line above).

> **Implementation status (YYYY-MM-DD): <one-line summary>.** What landed; what is intentionally deferred.
-->

## Context

<!-- The problem, the forces at play, and the constraints. Why a decision is needed now. -->

## Decision

<!-- The decision in the present tense ("We introduce …"). For a large decision, break it into
     numbered subsections (### 1. …, ### 2. …). State what is decided, not just what was explored. -->

## Implementation Plan

<!-- OPTIONAL. Phases / ordered steps. Delete this section if the change is trivial. -->

## Consequences

### Positive

### Negative

### Risks

## Alternatives Considered

<!-- Each rejected alternative + one line on why it was rejected. -->

## Acceptance Criteria

<!-- OPTIONAL but recommended for anything with an implementation. Numbered, checkable statements
     that define "done" — each verifiable against code or tests. -->

## Base UI References

<!-- OPTIONAL. Only for primitives aligned to Base UI: cite the relevant
     `packages/react/src/…` source paths that the decision was verified against. -->
