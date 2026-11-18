# Context Menu behavioral comparisons

Run `pnpm test-parity context-menu` with Node 24; preview port is 4507. Angular fixtures are AOT
compiled and React imports the unmodified Base UI 1.9.0 source pinned in `../../reference.json`.

Sixty-one scenarios include eleven original desktop cases (33 comparisons) in Chromium, Firefox and WebKit: native right-click opening,
point anchoring, selection, canceled open/close requests, whole-root disabling, outside dismissal,
reopening at a new point, right-button release, retained portals and previous-focus return.
Right-button drag selects on macOS; Linux keeps that release with the opening gesture. Actions use
the actual native button context area, original coordinates and default modal behavior.

The suite shares only native observations and actual Menu item markup with Menu/Menubar. Its cases
and actions are independent; no adapter forces focus, open state or completion. Reports retain
native events, trusted coordinates, press/release timestamps and source commit/digest. Two exact
Linux WebKit focus/highlight pairs record the pin dropping real travel with zero movement deltas.
Menu's existing coordinate guard is retained; stale or changed exceptions fail.

Nine additional input cases cover native keyboard opening, tap/long-press, drift/slop, cancel,
two fingers and disabling. Touch tap supports Chromium/WebKit; hold/move/cancel uses Chromium CDP.
Keyboard support is measured on a separate plain button. Current macOS runs execute 165 comparisons
with 18 capability skips; Linux executes 166 with 17 skips. Native input events and trust are recorded.

Sixteen additional composition cases cover sibling/nested areas sharing one Root, point anchors,
focus return, retained view reuse and right-press switching with veto/retry. Submenus exercise native
keyboard/hover paths in LTR/RTL, child cancellation and parent selection cancellation. Four exact WebKit
focus/highlight pairs retain the shared coordinate guard when the pin drops trusted zero-delta travel;
the previous two Linux right-release pairs remain. Cancellation, callback order and return focus match.

Native switching pauses the shared Playwright clock, without replacing native events or state.
The shared lifecycle also waits for a native frame before automatic close completion: rendering a
zero-motion close between pointerdown and contextmenu must not notify an already interrupted close.
The clock alone did not establish that completion boundary; see [ADR 0082](../../../../docs/adr/0082-popup-close-completion-frame.md).
Fully closed area sessions run independently. Context areas expose the shared
open/pressed state and do not register as Menu triggers. Policy retries use the native application F5
command. The source pin and its imports stay unmodified.

This suite does not certify further overlay composition,
real device behavior or assistive technology. See the
[source matrix](../../../../packages/primitives/context-menu/PARITY.md).

## Whole-root removal

Nine shared scenarios compare application-owned removal/recreation of the whole menu Root, including
an open submenu, retained portals, paused CSS exit, a deferred close and a pending hover. Two cases
resolve explicit final focus to a surviving or simultaneously removed outside element. Native F3/F4
commands change only the application's conditional rendering; they do not call `close()` or mirror
primitive state. Base UI omits `modal` from Context Menu Root props and forces modal behavior; non-modal cases
therefore belong only to Menu and Menubar, rather than passing unsupported props to the reference.

Each phase compares native focus, requests/completions, accessibility hiding, background hit testing
and scroll locking. After removal, assertions require zero remaining isolation attributes, markers,
focus guards or internal backdrops, restored document styles, usable keyboard/pointer input and native
page scrolling. A fresh Root must remain usable when the shared clock advances past old hover/exit
deadlines. Raw resource markup is attached separately: native `inert` versus `aria-hidden`, or a
framework's guard retention while exiting, is not an equivalent DOM contract.

See [ADR 0046](../../../../docs/adr/0046-menu-root-removal.md). Real devices and assistive technology remain separate audits.

## Independent nested Roots

Sixteen cases / 48 comparisons add separate command owners in nested areas and inside an open popup.
They exercise both disabling boundaries, open/close veto and retry, removal/recreation, native switching,
selection, outside/Escape dismissal, genuine submenus and keepMounted reuse. Retained cases include
real pointer selection after reopening. Focus, point anchors, requests/completions and trusted input
are recorded unchanged; no new exceptions apply.

The Angular fixture uses static markup in one owning view, so DI passes through to actual directives.
Menu ownership resets while floating ancestry survives. Independent portal mounting is recorded as
membership by owner; native hit testing establishes interactivity instead of matching incidental body
insertion order. Existing shared-area and other family observations retain their ordered contracts.

See [ADR 0047](../../../../docs/adr/0047-independent-context-menu-roots.md).

## CI close-completion regression

Run [43858922362](https://github.com/radix-ng/primitives/actions/runs/43858922362) failed only
`areas-switch-cancel-close` in Firefox: Angular recorded an extra false completion during the
accepted retry (`[true, false, true]` versus `[true, true]`). Requests, native events and settled open
state agreed. The raw CI artifact is retained in `dist/ci-43858922362/context-menu/`.

The shared lifecycle now gates automatic completion on a frame requested at close acceptance,
alongside the existing Presence/CSS exit. Reopening invalidates the frame and close identity.
Explicit unmount, pending destinations and owner disposal keep their existing policies. The exact
request/completion comparisons and native gestures remain unchanged; no exception was added.

The complete macOS suite passes **165 comparisons**, with its existing 18 capability skips.
Linux/arm64 passes **27 switching comparisons**: three cases (including independent Root switching),
three engines and three repetitions, one worker and original timeouts in Playwright 1.60.0 Noble.
Linux observations are in `dist/ci-43858922362/linux-context-menu/results/`. Two new unit regressions
fail before the change; the affected lifecycle/consumer units pass **647 tests**.

## Completed sessions after Escape

CI [44286579304](https://github.com/radix-ng/primitives/actions/runs/44286579304/job/134741094822)
failed `repeat-open` in Linux WebKit. The driver treated popup DOM removal as a completed close and
immediately reopened at another point. Angular could still cancel its pending close-completion
frame, recording `[true, true]`, while the reference had completed that close and recorded
`[true, false, true]`. Native requests, gestures, point anchors and settled open state agreed.
The original artifact is retained in `dist/ci-44286579304/context-menu/results/`.

The unchanged scenario reproduced twice in eight macOS WebKit runs and once in eight Linux/arm64
WebKit runs. This case compares two completed sessions, so it now observes the actual
`[true, false]` completion array and records a fully closed checkpoint before the second native
right-click. Repositioned and final closed checkpoints explicitly require `[true, false, true]`
and `[true, false, true, false]`. All callback arrays remain compared exactly; no runtime, native
input, timeout or expected-difference policy changes. Same-gesture interruption keeps its separate
clock-bounded switching scenarios.

Verification on macOS passes 36 comparisons: `repeat-open`, sibling switching, canceled-close retry
and independent-Root switching, repeated three times in all engines. The complete Linux/arm64 suite
passes 166 comparisons with 17 existing capability skips, using Playwright 1.60.0 Noble, Node 24.22.1,
two workers and original timeouts. Linux serves the same AOT-built browser fixtures through a static
server. Focused Context Menu units pass 21 tests; lint, formatting and contributor checks pass.
Before/after reports are retained under `dist/ci-44286579304/context-menu/` and the normal suite output.
