# Context Menu behavioral comparisons

Run `pnpm test-parity context-menu` with Node 24; preview port is 4507. Angular fixtures are AOT
compiled and React imports the unmodified Base UI 1.9.0 source pinned in `../../reference.json`.

Twenty scenarios include eleven desktop cases (33 comparisons) in Chromium, Firefox and WebKit: native right-click opening,
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
Keyboard support is measured on a separate plain button. Current macOS runs execute 42 comparisons
with 18 capability skips; Linux executes 43 with 17 skips. Native input events and trust are recorded.

This suite does not certify multiple context areas, submenus, real device behavior or assistive technology. See the
[source matrix](../../../../packages/primitives/context-menu/PARITY.md).
