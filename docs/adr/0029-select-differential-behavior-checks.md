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
Disabled options participate in arrow/Home/End navigation, independently of selection eligibility;
typeahead matches enabled options only. Select uses the existing shared highlight predicate without
changing item DOM focus or the default focus-out policy. Open-popup typeahead now has dedicated differential coverage, including mixed Space sessions.
Closed-trigger typing now has dedicated comparisons. Angular resolves hidden item metadata only for
an actual read, sharing preparation with autofill; the reference pre-mounts on focus. Lifetime and
inert differences remain explicit exceptions, independent of value/event parity. Do not patch the reference
to make a comparison pass. Its Portal currently lacks `keepMounted`; existing Angular coverage remains
necessary for that contract.

Each primitive owns its fixtures, driver, scenarios and reviewed differences under
`apps/parity-testing/primitives/<name>/`. `shared/` contains reference preparation, comparison and
reporting. The runner discovers `suite.json` files and writes independent artifacts per primitive;
adding a suite does not require a switch in the runner. Node.js 24 executes the tooling `.ts` files
directly; a separate strict check validates their erasable syntax and types.

## Consequences

The development workspace includes exact React-only dev dependencies; the published Angular package
has no additional peers. CI runs Chromium, Firefox and WebKit on Ubuntu 24.04 and Node 24 from `.nvmrc`. A reference
upgrade requires reviewing the pinned sources and recorded differences together.

The initial browser comparison also guards two Angular corrections: defer the Root provider helper
through `forwardRef` so full AOT static initialization resolves the class, and ignore read-only
selection before either pointer or keyboard handling closes the popup.

The desktop increment runs every scenario in all three engines. Reports distinguish engine/version
and platform. Shared browser projects also drive the Angular Storybook behavior suite, without
expanding screenshot baselines. Firefox's macOS app-data bookkeeping is isolated in the workspace
cache; the host environment and installed profile are not changed.

Cross-engine runs exposed and now guard logical-close query reset (a removed focused popup need not
blur) and explicit pointer highlighting despite WebKit's zero-delta first move. No new difference
exceptions were needed. The disabled trigger assertion allows native Safari Tab preference to skip
other buttons too, retaining exact focus observations on both sides.

Real screen readers, saved-profile autofill, real devices and differential coverage of the remaining anatomy/positioning
modes still require their own validation. This runner closes the missing differential-test mechanism;
it does not close those parity gaps.

## Desktop modal and positioning increment

Thirteen further scenarios cover desktop modality, background hit blocking/activation, scroll lock
release, Trigger toggling, selected-text alignment and realignment in LTR/RTL, resize dismissal,
explicit start alignment and the anchored center default. Both native document direction and framework
direction providers are set before bootstrap. Geometry uses common alignment/viewport constraints
with raw rectangles retained; wheel and pointer actions remain native browser input.

Select no longer invents a pointer origin for keyboard opening. Accepted close clears a pending
gesture, and release fallback does not repeat an already accepted dismissal. Trigger pointer pressing
requests a cancelable close. Anchored alignment defaults to `center`, matching the pin; existing
consumers can set `align="start"` to retain the earlier Angular default.

The pin emits an additional compatibility-mousedown close request when a modal outside request is
canceled. Preserve Angular's single native pointer path, recording exact canceled event sequences as
`canceled-compatibility-press`; do not hide unrelated value/event/state differences. Ordinary completed
close/reopen and deferred fast-reopen remain distinct scenario sequences.

These desktop comparisons do not close real-device, touch or AT gates.

## Dynamic collections and emulated touch increment

Eleven new dynamic-data scenarios use identical application F-key commands rather than test-side
state writes. Angular uses a signal and `@for`; React uses state and keyed children. The adapters
register newly supplied object identities for callback provenance, without changing primitive
selection. Reconciliation belongs to Root's cancelable value path; the popup requests it after
Angular's `afterRenderEffect` observes a settled, previously populated open collection. Initial
loads, empty collections and close/unmount are excluded. An initial-selection snapshot supplies
the upstream fallback without mirroring current controlled state.

Keep Angular's element-based highlight semantics. Record the pin's ordinal/reset behavior under
`dynamic-highlight-identity`, with exact fields only. Browser-specific native focus after node
removal is scoped to that engine; comparison tests ensure such exceptions cannot apply elsewhere.
Value and form-event differences are not covered by these categories.

Eight tap scenarios use trusted Playwright touch input in Chromium/WebKit. Four cancel/pan
scenarios use Chromium's public CDP input API. Firefox cannot create `hasTouch` contexts; WebKit
does not expose an equivalent public move/cancel API. Record these capability skips with reasons,
input mode and raw trusted input events. Keep desktop viewport/UA to isolate input behavior;
this is not real-device or AT validation.

The tests exposed a WebKit backdrop compatibility-event gap. Fix it in the common internal
backdrop with a native click listener; do not duplicate dismiss timing in Select. Touch pointer
leave/move must not erase selection highlight or apply mouse hover. Closed/unmounted collection
changes and clipped item-alignment geometry remain follow-up scenarios.
