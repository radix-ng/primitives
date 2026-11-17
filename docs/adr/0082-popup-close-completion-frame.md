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

## Follow-up: completed exits and native focus (2026-11-17)

CI run [44021164684](https://github.com/radix-ng/primitives/actions/runs/44021164684) exposed a
missing close completion in three controlled Menubar cases across all engines. The interruption
frame was also extending the retained popup's focus-scope lifetime after its CSS exit had finished.

Visual `ending` now follows unfinished CSS, live disposable Presence or an explicit hold. Waiting
for the notification frame alone does not prolong that visual/focus phase. A native `focusin` open
request completes an already-finished exit before starting its new enter. Unfinished CSS,
undisposed Presence and deferred closes still block completion; ordinary reopen requests retain the
interruptible frame and cancel stale callbacks. Menu forwards the original event into the shared
transaction. No Presence hold or consumer option is added for Menubar.

Five unit cases cover retained/disposable completed exits and unfinished Presence, deferred and CSS
exits. The Select batch-close regression now waits for automatic completion rather than assuming
Angular stability includes a native frame. Exact browser completion arrays remain compared.

The complete Menubar suite passes 261 comparisons; the affected cases pass twice across all three
Linux/arm64 engines (18 comparisons, two workers, original timeouts). Controls pass: Context Menu
165 comparisons with 18 existing capability skips, Menu lifecycle 33, Popover lifecycle 30 and
Select 47 with one existing skip. Shared units pass, including a final focused run of 27 lifecycle
and five Select action tests; five selected SSR checks, library/consumer-skill builds, lint and
contributor checks also pass. Reports are retained under `dist/ci-44021164684/` and the respective
suite result directories. GitHub Actions itself was not rerun by this local verification.
