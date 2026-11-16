# ADR 0078: Measure Tabs Indicator in List-local CSS coordinates

- Status: Accepted
- Date: 2026-11-16
- Related: [Tabs matrix](../../packages/primitives/tabs/PARITY.md), [comparison suite](../../apps/parity-testing/primitives/tabs/README.md), [ADR 0076](0076-tabs-indicator-observation.md)

## Context

Indicator subtracted viewport rectangles and added List scroll offsets. That retained border widths
and projected ancestor transforms in coordinates subsequently applied as local CSS pixels. Borders,
nonuniform scale, rotation, flip, perspective and zero scale could misplace the indicator. The
pinned Base UI 1.9.0 source (`cf696d6f6e08c699c5bda24d5a033430909f2285`) combines layout offsets with
rect-derived precision and accounts for intermediate scrolling.

## Decision

- Keep Angular signals, render hooks and resize observation as measurement owners. Put the DOM
  calculation in a Tabs-local helper; reuse core DOM identity guards without adding runtime peers.
- Read CSS dimensions with the pin's offset-size fallback. Accumulate offsets and containing-block
  borders across offset parents, then subtract the List's client border/scrollbar offsets.
- Subtract intermediate scrollers through composed parents, including assigned slots and shadow
  hosts. The List's own scroll is shared with its absolutely positioned indicator and is excluded
  from that subtraction.
- Prefer rect-derived offsets only when they agree with layout offsets within the pin's 2px
  cumulative DOM rounding bound. Remove the Tab's own matrix/translate-longhand translation from
  that agreement check, then retain it in the selected coordinates. Percentage translate lengths
  use the native offset dimensions. Distorted rects and nonfinite candidates from zero scales
  retain layout offsets. This is a calculation policy, not a test tolerance or normalization.
- Keep all six public variables literal in comparisons. Right/bottom use scrollable dimensions.
  Ancestor transforms preserve physical alignment; a Tab's own rotation/scale uses its normal
  layout slot while its own translation is followed. No DOM host lifetime or event contract changes.

## Evidence and limits

Twenty-eight geometry cases cover borders/padding, List/Tab content-box sizing, fractional layout,
both scroll axes in LTR/RTL, nonuniform scale, rotation, flip, skew, perspective, zero scales, matrix/
percentage/combined Tab translation, Tab rotation/scale, nested offset parents and intermediate
scrollers with and without rotation. Eleven Chromium controls passed before the fix and seventeen
failed, with zero reference assertion failures. The report is retained in
`dist/parity-testing/tabs/before-geometry-fix/`.

Fixtures author ordinary fixed layout slots and consumer transforms. Native wheel input changes
scroll position; F2/F3 change only the application's controlled selection. Expected local positions
come from authored slot sizes/gaps, independently of the production rect/offset algorithm. Native
Tab rectangles (or passive slot rectangles for Tab-local distortion) check rendered alignment.
Raw rects, client/scroll metrics and all six variables accompany each checkpoint. No primitive
state, measurements, callbacks or exceptions are rewritten.

All **189 affected comparisons** pass across Chromium, Firefox and WebKit on macOS: 84 new geometry
rows and 105 visibility/direction/identity controls. All **84 new rows** also pass in Playwright 1.60.0
Noble Linux/arm64 with one worker and the original timeout, retained in
`dist/tabs-geometry-linux/results/`. The existing 63 Tabs units pass; jsdom does not prove geometry.
The four reviewed authored-ID/null-Indicator fields are unchanged.

The public Indicator story has a native browser regression that selects every Tab and checks its
rendered left/width through the actual CSS transition. All three focused Storybook checks pass
against a fresh build. Library build, consumer-bundle generation and four selected SSR checks pass.

Intermediate scrolling is measured after a new selection causes both implementations to render.
Continuous intermediate-scroll tracking without a render and transform animation sampling remain
unverified. Composed traversal is implemented, but real shadow/owner-document integration, client
hydration, server-visible first paint and the pin's `renderBeforeHydration` remain separate work.
