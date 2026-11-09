# 0029 — Compare Select behavior against pinned Base UI sources

Status: Accepted
Date: 2026-11-09

## Context

The Select API/source matrix and Angular-only regressions do not prove equivalent behavior. We need
a reproducible comparison that preserves Angular's form ownership and composition model. An adapter
that mirrors React state or forces focus would mask differences instead of measuring them.

## Decision

Run the same Playwright scenario functions against two standalone, uncontrolled fixtures. Angular
uses its directives and public Root actions; React uses unmodified sources at the commit declared in
`apps/parity-testing/reference.json`. Archive git objects rather than the local checkout's working
files. Check the cache digest before each build/run and include provenance in observations.

Read DOM/form state and callback traces after each action. Adapt callback signatures and serializable
identifiers only. Record original DOM event types and verify object/array identity inside each fixture.
Do not simulate model commits, focus changes or completion callbacks in adapters.

Known differences are exact scenario/checkpoint/field pairs with a documented category. Unknown,
changed and disappeared differences fail. Keep the complete observations in a CI artifact and show
categories in the summary; a passing check means no unreviewed drift, not full parity. See the runner
[Select guide](../../apps/parity-testing/primitives/select/README.md) for boundaries and recorded differences.

Keep virtual/default focus behavior until ADR 0023's real-AT gate is met. Preserve Angular native
reset, explicit array selection mode and inert held exits instead of reproducing upstream differences.
Review disabled-option navigation separately as part of the focus policy. Do not patch the reference
to make a comparison pass. Its Portal currently lacks `keepMounted`; existing Angular coverage remains
necessary for that contract.

Each primitive owns its fixtures, driver, scenarios and reviewed differences under
`apps/parity-testing/primitives/<name>/`. `shared/` contains reference preparation, comparison and
reporting. The runner discovers `suite.json` files and writes independent artifacts per primitive;
adding a suite does not require a switch in the runner. Node.js 24 executes the tooling `.ts` files
directly; a separate strict check validates their erasable syntax and types.

## Consequences

The development workspace includes exact React-only dev dependencies; the published Angular package
has no additional peers. CI runs Chromium on Ubuntu 24.04 and Node 24 from `.nvmrc`. A reference
upgrade requires reviewing the pinned sources and recorded differences together.

The initial browser comparison also guards two Angular corrections: defer the Root provider helper
through `forwardRef` so full AOT static initialization resolves the class, and ignore read-only
selection before either pointer or keyboard handling closes the popup.

Real screen readers, saved-profile autofill, other browsers and the remaining anatomy/positioning
modes still require their own validation. This runner closes the missing differential-test mechanism;
it does not close those parity gaps.
