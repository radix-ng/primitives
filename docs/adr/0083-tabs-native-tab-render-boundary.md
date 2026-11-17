# ADR 0083: Synchronize Tabs before native Tab and preserve the exit frame

- Status: Accepted
- Date: 2026-11-16
- Related: [ADR 0081](0081-tabs-controlled-selection-ownership.md), [ADR 0077](0077-tabs-whole-panel-presence.md), [Tabs matrix](../../packages/primitives/tabs/PARITY.md), [comparison suite](../../apps/parity-testing/primitives/tabs/README.md)

## Context

Consecutive native Enter/Space or automatic-focus navigation followed by Tab could reach an old
Panel before Angular rendered selection. Hiding that Panel then lost focus to BODY. An old roving
Tab stop could also receive Tab and automatically request the previous value again. Controlled
values may belong to an ancestor template, while List and Panels are declared in separate component
views; detecting changes only in List cannot generally update these bindings.

The accepted requirement keeps native Tab defaults, parent-owned controlled selection and ordinary
consumer setup. The existing 50-case baseline recorded four macOS and seven Linux failures, without
reference assertion failures. This establishes a primitive interaction problem independently of the
frozen generated-consumer experiment.

## Decision

A private, application-scoped Tabs coordinator records Lists receiving an owned Tab click/focusin.
An unprevented Tab/Shift+Tab from that List flushes pending work through the existing public
`ApplicationRef.tick()`. It then leaves the original event and native focus navigation intact.
`afterEveryRender` clears the pending owners; List destruction forgets its owner. A shared guard
prevents another pending List from recursively starting a tick during that synchronization.

The coordinator does not store selection or commit requested values. Ignored, delayed, canceled and
replaced controlled requests still follow the real parent's input. A different List cannot flush
another List's pending interaction. The implementation needs no consumer provider, application
configuration or new Tabs input. In Angular 22 zoneless, the application synchronization traverses
pending dirty work; it can therefore render other dirty application views. It is intentionally
limited to this interaction window and is not a general synchronous-render guarantee for arbitrary
application-driven updates.

A separate native-layout difference emerged after focus was corrected. Base UI retains an inert
outgoing Panel through its first exit frame even without CSS motion. In the small test viewport,
Tab into the temporarily lower next Panel can scroll the page. Tabs now preserves that frame on
retained and structural Panels. Its existing CSS transition helper runs concurrently with the
frame; reactivation and destruction cancel the frame. Once both the frame and actual CSS exit
finish, the Panel hides or its structural owner removes the view.

PresenceMachine receives an optional `holdUnmount` signal. It detects CSS exits at the original
close boundary and delays only physical removal while the owner holds it. Reopening invalidates a
held removal; explicit skipExitAnimation and owner disposal bypass the hold. Existing consumers
without the option retain their prior behavior. This avoids duplicating Presence or delaying CSS
animation discovery until after a short animation could already have finished.

## Comparison and regression evidence

The keyboard matrix now contains 64 cases, including eight component-composition cases, immediate
manual arrow/Tab boundaries and additional vertical retained/structural cases. The Angular facade
composes Root on its host, with List and Panels in separate children and the controlled value in its
parent. React uses its ordinary actual parts. Neither fixture supplies a render or focus repair.

Rapid pairs use the shared Playwright clock installed before navigation and paused before the
interaction. Both sides receive real activation and Tab within the same JavaScript paint-frame
boundary; only after both keys does the clock advance and resume. Native key/focus events, trust,
default prevention, callback order, DOM and page scroll remain observed. This avoids comparing Tab
before one side's exit frame with Tab after the other's. The clock never commits primitive state.

Eleven render-boundary units cover ancestor-owned bindings, the sibling Panel view, parent policies,
roving state, prevented Tab, normal-render cleanup, multiple/nested Roots and reentrancy. Five
Presence tests cover the hold, cancellation, CSS completion, explicit completion and disposal. A
structural Panel test verifies child identity survives reopening before its exit frame. Existing
completion assertions now wait for the actual exit instead of assuming whenStable includes rAF.

The initial synchronization run corrected focus/selection but exposed the outgoing-Panel geometry.
An unbounded full run recorded 867 passes and three rapid scroll differences; all 678 older control
comparisons passed. Linux initially recorded 79 passes and two scroll differences. These timing
reports remain in `dist/parity-testing/tabs/keyboard-native-frame-timing/` and
`dist/tabs-render-linux/before-clock-boundary/`. With the matched frame boundary, all 81 rapid
comparisons pass on both macOS and Linux/arm64. The final complete Linux/arm64 run passes
870/870 comparisons with two workers and original timeouts in Playwright 1.60.0 Noble. The linked
suite README records the report and separate macOS unhandled-arrow scroll limitation.

No reference source, tolerance, native event, focus history or expected-difference entry is changed.
The four existing authored-ID/null-Indicator fields remain the only reviewed exceptions. The frozen
consumer result and actual hydration/device/assistive-technology scope remain separate audits.
