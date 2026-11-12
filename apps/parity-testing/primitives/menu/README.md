# Menu behavioral comparisons

Run `pnpm test-parity menu` with Node 24. The runner discovers this suite automatically; preview
port is 4505. Angular fixtures are AOT compiled and React imports the unmodified shared reference.
Base UI 1.9.0 pin: `cf696d6f6e08c699c5bda24d5a033430909f2285`, archive SHA-256
`a54f36f00fe2fbba6a754491764edd77dea627c67efaa6bab1283f57b4bb8d4c`.

97 scenarios run in Chromium, Firefox and WebKit (291 comparisons). They cover native keyboard and
pointer opening, disabled/focusable items, roving focus, edges and looping, repeated and explicit-label
typeahead, selection and stay-open items, cancelable transactions, modal/background activation,
forward/backward Tab, checkbox/radio values, LTR/RTL submenu ownership and custom identity links.
Checkbox/radio models and open state remain uncontrolled. Both fixtures use native button items;
React's render/nativeButton configuration adapts its element API to Angular's element directives.

Eleven lifecycle scenarios compare retained checkbox state, natural CSS exits, external/late and
canceled holds, duplicate/stale actions, interrupted reopening, modal background recovery and
nested CSS completion. Menu and Popover share fixture lifecycle settings and a real CSS exit class
in `shared/lifecycle.ts`; per-primitive actions, models and observations remain independent.

The late-hold case pauses its actual CSS exit before the native F10 application command, then
finishes it through WAAPI. This keeps runner latency from completing the old 400 ms exit before
the hold can be requested; callbacks still come from the primitive's real animation lifecycle.

Nineteen pointer scenarios compare root hover delays/cancellation/re-entry, click promotion before
and after the delay, LTR/RTL diagonal submenu travel, disabled submenus and parent-item ownership.
Native press-drag-release covers the 200ms guard, outside/disabled releases, stay-open commands and
checkbox/radio values. After entering a submenu, leaving its floating area alone does not close it;
hovering a sibling parent item closes that branch, matching the pin.

Drivers own Menu's DOM snapshot and actions. `shared/run-scenario.ts` only shares the browser-page,
reference validation and reporting lifecycle with Popover. Select retains its specialized runner
because it also validates touch capabilities and geometry contracts. No universal control driver
or framework state mirror is introduced.

Raw records include source commit/digest, browser versions, open/change completions, native change
event types, trusted pointer coordinates/deltas and native press/release timestamps. CSS layout and default focus are observed;
the adapters do not synthesize state, focus, pointer deltas or lifecycle completion.

Nine collection cases use native F3/F4 application commands for insertion, focused removal, keyed
reordering, disabling and label updates. They observe index-based highlight, native arrow continuation
and pointer selection. Empty/refilled root and child lists, keyed submenu reordering and removal/replacement
of an open owning branch are included. Removed submenu triggers fall back through surviving Menu owners.
Shared focus recovery observes DOM updates rather than copying a React store.

## Reviewed limitations

`expected-differences.json` contains ten exact consequences of the pin suppressing programmatic
focus-out, a macOS WebKit native button click-focus pair, and exact WebKit pointer-travel pairs.
One exact completion pair records the pin dropping the submenu close callback during nested CSS
disposal; Angular lets the actual child exit finish before deleting its owning view.
The intended Angular focus-out and coordinate-based hover behavior are retained. See the
[source matrix](../../../../packages/primitives/menu/PARITY.md) for the source rationale and pending
scope. Unchanged/disappeared exceptions fail; there is no blanket normalization or acceptance command.

Custom IDs change between opens in the differential scenario: the pin keys trigger registration
by id. Angular additionally supports live ID changes without replacing the popup, checked through
the Events story and unit/browser regressions. Pending work includes touch emulation, further API/lifecycle combinations and real device/AT verification.

## Whole-root removal

Ten shared scenarios compare application-owned removal/recreation of the whole menu Root, including
an open submenu, retained portals, paused CSS exit, a deferred close and a pending hover. Two cases
resolve explicit final focus to a surviving or simultaneously removed outside element. Native F3/F4
commands change only the application's conditional rendering; they do not call `close()` or mirror
primitive state. Menu and Menubar also cover non-modal ownership.

Each phase compares native focus, requests/completions, accessibility hiding, background hit testing
and scroll locking. After removal, assertions require zero remaining isolation attributes, markers,
focus guards or internal backdrops, restored document styles, usable keyboard/pointer input and native
page scrolling. A fresh Root must remain usable when the shared clock advances past old hover/exit
deadlines. Raw resource markup is attached separately: native `inert` versus `aria-hidden`, or a
framework's guard retention while exiting, is not an equivalent DOM contract.

See [ADR 0046](../../../../docs/adr/0046-menu-root-removal.md). Independent nested Context Menu Roots
are covered separately by the Context Menu suite and ADR 0047. Real devices and assistive technology remain open.

## Empty keyboard requests

Fourteen scenarios / 42 comparisons cover initial empty opens with Enter/Space/Up/Down, pointer and
pending forward/backward navigation, delayed data, hovered child promotion, LTR/RTL, retained reopening
and close-before-refill. Native F3/F4 commands only update application data. Advancing the installed
Playwright clock by 400ms places arrival beyond initial render retries; no primitive state, input or
CSS lifecycle is synthesized.

One pin limitation is deliberately observed: a repeated forward arrow on a formerly empty hovered
submenu does not move focus after logical index zero is already highlighted. Angular resolves the
explicit request against actual items. Exact focus/highlight pairs at one checkpoint are scoped to
LTR/RTL and each browser under empty-submenu-keyboard-focus. Both fixtures then finish through native
pointer selection; no adapter supplies reference focus.

The public examples use Angular resource and Root.open instead of a mirrored open/loading model.
See [ADR 0048](../../../../docs/adr/0048-menu-empty-keyboard-requests.md).
