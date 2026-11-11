# Context Menu behavioral comparisons

Run `pnpm test-parity context-menu` with Node 24; preview port is 4507. Angular fixtures are AOT
compiled and React imports the unmodified Base UI 1.9.0 source pinned in `../../reference.json`.

Forty-five scenarios include eleven original desktop cases (33 comparisons) in Chromium, Firefox and WebKit: native right-click opening,
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
Keyboard support is measured on a separate plain button. Current macOS runs execute 117 comparisons
with 18 capability skips; Linux executes 118 with 17 skips. Native input events and trust are recorded.

Sixteen additional composition cases cover sibling/nested areas sharing one Root, point anchors,
focus return, retained view reuse and right-press switching with veto/retry. Submenus exercise native
keyboard/hover paths in LTR/RTL, child cancellation and parent selection cancellation. Four exact WebKit
focus/highlight pairs retain the shared coordinate guard when the pin drops trusted zero-delta travel;
the previous two Linux right-release pairs remain. Cancellation, callback order and return focus match.

Native switching is bounded to one paint frame using the shared Playwright clock, without replacing
native events or state. Fully closed area sessions run independently. Context areas expose the shared
open/pressed state and do not register as Menu triggers. Policy retries use the native application F5
command. The source pin and its imports stay unmodified.

This suite does not certify independent nested Roots, further overlay composition,
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

See [ADR 0046](../../../../docs/adr/0046-menu-root-removal.md). Independent nested Context Menu Roots,
real devices and assistive technology remain separate audits.
