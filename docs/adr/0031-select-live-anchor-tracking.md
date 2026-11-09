# 0031 — Share Select anchor tracking and preserve manual placement sessions

Status: Accepted
Date: 2026-11-09

## Context

The item-aligned positioner stopped common positioning after placement but independently observed
trigger resize. This mixed frozen manual coordinates with a second resize policy. Anchored Select
used zero collision padding rather than the pin's 5px default. The shared clipping attribute also
depended on enabling automatic hiding, so consumers could not observe a detached anchor themselves.

## Decision

Add optional `disableAnchorTracking` to the common Popper wrapper. Disable ancestor-scroll,
element-resize, layout-shift and animation-frame observation together. Initial positioning, explicit
parameter changes and ancestor/window resize remain active, matching pinned `useAnchorPositioning`.
Anchored Select defaults to false; item-aligned mode defaults to true. Reopening starts a new pass.

When item-aligned consumers explicitly enable tracking, keep the common engine running to refresh
anchor dimensions, available-size variables and clipping state. Keep the manual coordinates from the
opening placement. This is the pin's observable behavior even with tracking enabled; use anchored
positioning when the popup must follow movement. Consumer CSS can still change the popup's own size.
Limit Select's trigger ResizeObserver to acquiring the first valid placement when the anchor is
initially unmeasurable. Then disconnect it rather than adding a second ongoing geometry observer or
copying React's store/ref bookkeeping. Angular signals and inherited Popper behavior own the mode.

Expose the preferred rendered side before the first hidden measurement. Side-dependent consumer
max-height must constrain that measurement: a frozen positioner cannot rely on a later tracking pass
to correct coordinates measured from an unconstrained tall list. The actual placed side supersedes
it after collision handling. Both Select modes use 5px collision padding by default.

Always run reference-visibility middleware against the anchor's clipping ancestors. Expose
`data-anchor-hidden` independently of automatic hiding. Only `hideWhenDetached` changes visibility
and pointer events; clipping does not request close or a new value. Keep existing focus policy and
its real-AT gate unchanged.

Use native viewport rectangles for a CSS-scaled trigger. The unscaled popup's coordinates must not
be divided by the trigger's scale. Keep the safe anchored fallback for transformed/scaled portal
containing blocks from ADR 0030. Do not reproduce the pin's incorrect scaled-trigger alignment or
manual portal overflow. Record only their exact observed alignment/mode/containment differences.

## Evidence and consequences

Twelve new differential cases exercise native ancestor scrolling, resize/translation/scale, row
height, consumer max-height, live labels, frozen metrics, clipping, scaled portals and reopening.
The same application commands/classes drive both fixtures; adapters never write primitive geometry,
scroll offsets, focus, values or completion. Raw trigger/value/selected-text rectangles are retained.
Reopening checks wait for the rendered closed state before starting a new opening; batched signal
updates within one rendered opening are not treated as a completed close/reopen boundary.
The runner now defines 112 cases (320 comparisons and 16 capability skips across three engines).

`scaled-anchor-alignment` records Angular true / pin false at three scaled selected-text checkpoints.
The scaled portal extends the existing exact `transformed-alignment-fallback` pairs. Values, keyboard
selection, native form entries and callback order remain checked. Nine Storybook cases cover the
Angular contract, including clipping both with and without automatic hiding. Existing numeric
sizing checks keep their 2px tolerance; this increment does not claim identical arbitrary CSS layouts.

Migration: item-aligned default metrics now stay frozen for the opening rather than responding to
the old Select-specific resize observer. Explicit false refreshes metrics; choose anchored mode for
continuous movement. Anchored collision padding changes from 0 to 5px; explicit zero retains the old
setting. Clipping state becomes observable without automatic hiding. No runtime dependency is added.

Nested modal/portal combinations, closed/unmounted collections, mobile visual viewport/pinch zoom,
saved-profile autofill and real assistive technology remain separate increments.
