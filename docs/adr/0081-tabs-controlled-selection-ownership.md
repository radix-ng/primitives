# ADR 0081: Keep controlled Tabs selection owned by its input

- Status: Accepted
- Date: 2026-11-16
- Related: [Tabs matrix](../../packages/primitives/tabs/PARITY.md), [comparison suite](../../apps/parity-testing/primitives/tabs/README.md), [ADR 0079](0079-tabs-collection-consistency.md), [ADR 0080](0080-tabs-arbitrary-value-identities.md)

## Context

Tabs used a writable Angular model as both input and selected state. After `onValueChange`, a
non-canceled request always wrote that model. A parent retaining its current input therefore lost
selection locally, even in controlled mode. Repeated requests could also overwrite a replacement or
null supplied by the parent because Angular had no changed input binding to reapply. The pinned Base
UI 1.9.0 (`cf696d6f6e08c699c5bda24d5a033430909f2285`) keeps controlled selection parent-owned.

## Decision and breaking migration

- Replace the model with `valueInput`, aliased to `value`, and explicit `valueChange` output. Preserve
  `[(value)]` syntax through ordinary Angular input/output binding. `root.value()` remains the
  effective selected value, now a readonly computed signal. Replace imperative model `.set()` /
  `.update()` with updates to application state. Observe actual selection through the readonly
  signal in an effect; accepted-request outputs do not always represent a committed selection.
- A defined input owns selection. One private signal owns uncontrolled selection; a computed signal
  chooses the effective source. Remove internal-commit flags, observed-value history and external
  write guessing. This is Angular input/output/signal ownership, with no React store/ref mirror,
  timers, manual change detection or forced rendering.
- Emit detailed `onValueChange` before processing a user request. Cancellation suppresses the
  accepted-value output. An accepted controlled request emits `valueChange` but does not write
  selected state or rendered direction. The parent can ignore, delay, replace or return null.
- Uncontrolled requests commit selection and direction before `valueChange`. Automatic consistency
  changes commit selection/direction before detailed notification and accepted-value output; they
  remain uncancelable. Explicit default initialization and external input updates are silent.
- Rendered direction, Panel presence and Indicator follow actual selection. Request details retain
  the direction of the requested destination. An ignored request preserves committed direction;
  an externally accepted/replaced value derives direction from the actual previous selection.
- Use one-way value binding with detailed request handling for deferred/transformed responses.
  Two-way binding automatically writes accepted requested values to application state. Initialize
  controlled application state explicitly; omit the input for uncontrolled usage.

## Evidence and limits

Twenty cases cover ignore/repeat, accept, delayed acceptance, replacement/null, cancellation,
automatic focus requests, both axes/RTL, object/function identities, null/missing/disabled inputs
and structural presence. Native arrows/Enter request changes; F-keys mutate only application inputs
or apply an application's pending response. Neither fixture drives primitive state. Actual selection,
Panels, focus/tab stops, all part directions, visible Indicator variables and complete request traces
compare. Angular's actual `valueChange` output is asserted separately and retained raw; React does
not synthesize that output. Functions remain data. Direction providers configure keyboard RTL, with
native direction configuring layout.

The initial experiment had 17 Angular behavior failures, two passes and a missing-provider RTL case
that failed focus setup on both sides. That fixture was corrected; its original raw report remains
in `dist/parity-testing/tabs/before-controlled-fix/`, not a clean reference baseline.

All **678 comparisons** pass across Chromium, Firefox and WebKit: the entire 226-case Tabs suite,
including 60 new controlled rows. All **69 focused Linux/arm64 comparisons** also pass (60 new rows and nine controlled-collection
controls), in Playwright 1.60.0 Noble with one worker and original timeouts, retained in
`dist/tabs-controlled-linux/results/`. Tabs units pass **83 tests**, including eight new ownership checks.
The old synchronous model regression now checks controlled request timing; a separate uncontrolled
regression preserves atomic selection/direction publication. Five browser checks pass against a
fresh Storybook build, including actual two-way acceptance and cancel-before-output. Five selected
SSR checks, library/SSR-app builds, scoped lint and consumer-bundle generation pass. The consumer
API generator recognizes ordinary input/output pairs alongside models, preserving the `twoWay`
contract for value; all seven focused generator tests pass.

No new differential exception is added. The four authored-ID/null-Indicator reviewed fields remain.
Indicator host policies and optional native trigger availability retain their existing documented
scope. Control-mode switching through undefined, actual client hydration, rapid pre-render Enter/Tab
and live axis/style changes remain separate verification work.
