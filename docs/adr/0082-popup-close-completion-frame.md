# ADR 0082: Complete automatic popup closes after a frame boundary

- Status: Accepted
- Date: 2026-11-16
- Related: [ADR 0026](0026-popup-close-lifecycle-and-presence.md), [ADR 0045](0045-context-menu-composition-and-native-dismissal.md), [popup lifecycle](../engineering/mechanisms/popup-close-lifecycle-adr-0026.md)

## Context

CI run [43858922362](https://github.com/radix-ng/primitives/actions/runs/43858922362) recorded an
extra Context Menu close completion during a native outside right-press after a canceled attempt.
Angular emitted `[true, false, true]`; pinned Base UI emitted `[true, true]`. The requests, native
event types/trust and final open state agreed. A paused Playwright clock did not establish an
equivalent automatic-completion boundary between the two native events.

Base UI 1.9.0 at `cf696d6f6e08c699c5bda24d5a033430909f2285` uses
`internals/useAnimationsFinished.ts`: even an element without animations waits for an animation
frame before its completion check. Angular's shared popup lifecycle could finalize a zero-motion
close as soon as rendered Presence removal completed. Reopening then had no pending close to cancel.

## Decision

The shared lifecycle requests one animation frame when it accepts a close. Automatic completion
requires both that frame and its existing transition/Presence completion conditions. Reopening
cancels the frame and invalidates the close identity; stale callbacks cannot complete another close.
Destruction also cancels the scheduled frame.

The frame runs alongside the existing CSS exit wait. Once an exit has passed that frame, its actual
completion does not acquire an additional frame of delay. Explicit `unmount()` remains a manual
completion boundary, including when Presence removal follows later. A pending Portal destination
still produces no close notification. Owner destruction retains its existing notification policy
before Angular disconnects outputs.

Menu, Select and Popover keep the same public API and compose this one mechanism. The implementation
uses native frames, Angular signals and the existing cleanup owner. It does not force change
detection, intercept input or rewrite callbacks. Context Menu's native clocked gesture and exact
completion comparisons remain in place; no differential exception is added.

## Regression evidence

Two unit cases, retained and disposable, reproduce the missing boundary against the previous
runtime. They render a close, reopen before its completion frame and exercise stale frame callbacks.
The existing Presence test separately requires immediate notification after removal when the frame
already passed. Select/Popover tests await automatic completion; the Context Menu isolation test
waits for an entire session to finish before opening the next session.

The CI Tabs failure was separate: WebKit's native wheel scroll continued after its first nonzero
offset. The reference measured at a partial offset, then the driver asserted against the final one.
The geometry scenario now observes the authored scroller reaching its native end before changing
selection. Literal CSS variables and physical alignment assertions remain unchanged; continuous
Indicator tracking during scrolling remains outside that scenario's contract.

Verification on Node 24.22.2 passes 647 affected unit tests. macOS passes 349 browser comparisons:
84 Tabs geometry, the complete 165-row Context Menu suite, 33 Menu lifecycle, 30 Popover lifecycle
and 37 Select close/deferred/modal controls. The existing capability skips remain unchanged.
Linux/arm64 passes 90 repeated comparisons (27 Context Menu switching and 63 Tabs scrolling) in
Playwright 1.60.0 Noble, with one worker and original timeouts. Observations and original CI evidence
are retained under `dist/ci-43858922362/`; macOS suite outputs remain under `dist/parity-testing/`.
Library build, consumer-skill regeneration, scoped lint and contributor checks pass.

The unfinished Tabs rapid-keyboard matrix is independent of this correction. These scoped results
do not certify that whole matrix, real devices, assistive technology or a rerun of GitHub Actions.
