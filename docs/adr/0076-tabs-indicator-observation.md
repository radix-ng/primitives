# ADR 0076: Observe Tabs Indicator geometry and retain its hidden host

- Status: Accepted
- Date: 2026-11-16
- Related: [Tabs matrix](../../packages/primitives/tabs/PARITY.md), [comparison suite](../../apps/parity-testing/primitives/tabs/README.md)

[ADR 0078](0078-tabs-indicator-coordinates.md) extends the geometry scope after this visibility/resize
increment. The null-host policy below remains unchanged; its original evidence and limits are retained.

## Context

Indicator published geometry without a presentation role or hidden state and observed only its
initial List. Changing a tab's width, height or label inside a fixed-size List left stale geometry;
restoring a hidden or zero-size tab could leave its indicator hidden. Replacing the List did not
reconnect observation for a surviving Indicator. Rect-derived dimensions also lost the pin's
computed-CSS precision for text-sized tabs.

The Base UI 1.9.0 pin (`cf696d6f6e08c699c5bda24d5a033430909f2285`) observes the List and tabs, hides
an indicator without nonzero active-tab dimensions, and omits its element at `value=null`. Angular
attribute directives attach to consumer-owned elements and retain those hosts.

## Decision

- Measure selection, orientation and registered elements after rendering with `afterRenderEffect`.
  Use a separate render effect to observe the current List and every registered tab, including
  preceding siblings. Disconnect the old observer on collection/List changes and destruction; use
  the List's owning window for the observer and computed styles. No unowned animation-frame task is
  required.
- Apply `role="presentation"` and hide the host when geometry is absent or either active-tab
  dimension is zero. Clear the six geometry variables when the value or registered tab is absent.
  Keep a hidden consumer-owned host at `null`; do not remove or move the consumer's element.
- Preserve computed CSS dimensions, falling back to offset sizes when the computed box differs.
  Opposite-edge distances use the List's scrollable content dimensions. Border/transform correction
  and complex scrolling still require their own comparisons.
- Record actual host presence, hidden state, role, all six variables and raw native rectangles.
  Two exact `hosts` fields in `indicator-null-restore` accept Angular's hidden presentation host
  versus the pin's absent element, before selection and after clearing it again. Visibility and
  geometry still compare independently. No other scenario or field is excluded.

## Evidence and limits

Seventeen Indicator cases cover both axes, null/missing/hidden/zero-size selections, active/sibling/
label/List resize, tab replacement/insertion, List replacement followed by resize, multiple
indicators, and removal/recreation followed by resize. Application F2/F3/F4 commands change only
consumer data. All seventeen initially failed in Chromium with all reference assertions passing;
the baseline is retained in `dist/parity-testing/tabs/before-indicator-fix/`. After adding role and
hidden state, nine runtime failures still exposed stale observations; the additional null-host
difference is recorded separately. That intermediate baseline is retained in
`dist/parity-testing/tabs/before-indicator-observation-fix/`.

All 51 new comparisons pass across three engines, alongside 54 existing direction/identity
comparisons. Three units verify observed-element ownership and cleanup, including a surviving
Angular Indicator across List replacement; two failed before the fix. Units do not establish
layout. The browser label case additionally exposed a 0.00025px computed-CSS/rect discrepancy;
the actual dimensions are fixed rather than rounded by the driver.

Rendered boxes allow less than 0.05 CSS px for native layout quantization after CSS serialization;
the six variable values still compare exactly. Linux Chromium initially exposed the same 0.0155px
box-versus-CSS discrepancy on both implementations; this was an assertion precision issue, not a
runtime difference. That report is retained in `dist/tabs-g6-linux/before-box-assertion-fix/`.
The final Linux/arm64 pass covers all 51 new rows and three custom-ID controls, with 54 passing;
the matching three-engine macOS label check also passes.

Borders, scroll/overflow, scale/rotation/flip/translation and intermediate scrollers remain G6 work.
Owner-document/shadow combinations, actual hydration and server-visible first paint remain separate
comparisons. This increment does not establish the pin's `renderBeforeHydration` capability.

## Follow-up: opt-in SSR first paint (2026-11-17)

`renderBeforeHydration`, default `false`, adds the pin's early Indicator positioning capability.
The application-scoped coordinator uses Angular's public TransferState serialization callback to
emit a literal CSP-nonced script outside the annotated application tree. The parser script changes
only Indicator geometry/visibility and removes its own unowned script node. The application DOM
structure stays intact for normal hydration; no skip-hydration or extra consumer provider is needed.

A serialized feature flag and the existing native geometry seed the first client host bindings.
Normal render hooks then own measurement and marker cleanup. A visible server-positioned Indicator
is not hidden and revealed again during hydration. The script body is emitted verbatim so consumer
minification cannot introduce captured runtime helpers. Transformed tabs use the full client
measurement; zero-size targets wait for measurable dimensions, as in the pin.

Fourteen real hydration cases pass 42 comparisons on both macOS and Linux/arm64, including strict
nonce-only CSP, vertical/RTL layout and multiple Roots. Raw node identity, IDs, user input/focus,
callbacks and native activation remain checked. Exact server ARIA registration differences are
recorded separately from the hydrated contract. Incremental/deferred hydration and native realms
remain outside this evidence. The existing null-host adaptation is unchanged.
