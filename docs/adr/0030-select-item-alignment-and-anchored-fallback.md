# 0030 — Compose Select item alignment with the common Popper engine

Status: Accepted
Date: 2026-11-09

## Context

The legacy item-aligned positioner used a different sizing algorithm, an unused expansion flag and
a hand-written touch fallback. Its fallback did not flip or size against collisions, and a separate
Floating UI pass positioned only the arrow. Transformed portal containers exposed incorrect viewport
coordinates in both Angular and the pinned Base UI implementation (ADR 0029).

## Decision

Make `RdxSelectItemAlignedPosition` a Popper positioner, retaining its existing selector and content
part. The common engine supplies initial measurements, anchor/available-size variables, fallback
flip/shift, offsets, tracking and arrow geometry. Protected style/readiness/placement hooks support
the manual geometry mode without copying the anchor engine. Rendered side is separate from physical
engine side: one writer reports `data-side="none"` during item alignment, including on Popup.

Keep Select's initial sizing and expansion arithmetic in a pure local helper derived from the pinned
`Select.Popup`. Short lists use intrinsic height. Long lists align selected text and consume scrolling
in height until the viewport or the consumer's `max-height` is reached. Height and scroll offset must
change in one native scroll turn; the Angular layout signal retains host-render ownership, while the
native height write makes subsequent scroll bounds available synchronously.

Popup owns scroll-edge signals shared by both arrow parts. Update them after native scrolling,
library offset writes and viewport resizing. Independent per-arrow listeners can render stale chrome
between height/offset changes. Initial placement waits for in-flow arrow chrome to render, then
settles text alignment before enabling the existing focus manager. The positioner never calls focus.
Retain virtual/default focus policy and the real-AT gate from ADR 0027.

Use Angular signals/linked signals and render callbacks for geometry and session readiness. Request
versions and DestroyRef reject stale async measurements after close, teardown or remeasurement.
Retained exits preserve their last geometry; reopening measures afresh. An unavailable/zero anchor
keeps the completed common pass until resize makes alignment measurable.

Touch, Safari pinch zoom, viewport-edge/min-height collisions and a fixed containing block use the
common anchored fallback. Floating UI's offset-parent detection handles transformed containers;
do not copy browser-specific ancestor heuristics. The transformed-container fallback is a deliberate
Angular adaptation: the pin keeps item mode and overflows. This comparison covers placement and
keyboard selection, not all nested modal stacking or real-device zoom behavior.

## Consequences

The legacy part now inherits Popper inputs (`side`, `align`, offsets and collision settings); fallback
alignment defaults to `center`. Item sizing and inline collision padding match the pin's policy.
Z-index belongs on the positioner. The extra Angular Popup/Content wrappers receive functional flex
constraints so consumers do not have to repair shrinking at each level.

Remove the obsolete internal `useFixedArrowPosition` helper. Both Select modes use the same arrow
context; a fallback arrow reflects the actual flipped side. No runtime dependency is added.

Ten new differential scenarios check expansion in both directions, height caps, viewport edges,
intrinsic short lists, no selection, retained reopening and transformed LTR/RTL portals. Eight compare
coordinates, dimensions, offsets and client heights numerically within 2 CSS pixels. The transformed
cases record exact mode/containment differences. Angular retained-view safety remains explicit;
the pin has no equivalent `keepMounted` prop. Storybook separately checks in-flow buttons and early
close/reopen during measurement; callback scheduling across different renderers is not a shared
before-placement phase boundary.

Native wheel requests are not scroll-distance assertions. WebKitGTK applies scrolling incrementally,
and expansion can consume the first increment by changing height/offset in the native scroll turn.
Compare stable boundaries after repeated native input, retaining pulse counts and intermediate
measurements. Wait for unchanged layout/offsets before numeric comparison; keep the 2px tolerance.
This avoids platform-dependent intermediate samples without modifying either implementation or
writing scroll offsets from the adapter.

Further work includes live ancestor changes during an aligned session, more custom CSS/scale and
nested portal/modal configurations, mobile visual viewport movement, actual pinch zoom, real AT and
saved-profile autofill. These checks do not certify complete geometry or device parity.
