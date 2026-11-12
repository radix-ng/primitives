# Menu behavioral comparisons

Run `pnpm test-parity menu` with Node 24. The runner discovers this suite automatically; preview
port is 4505. Angular fixtures are AOT compiled and React imports the unmodified shared reference.
Base UI 1.9.0 pin: `cf696d6f6e08c699c5bda24d5a033430909f2285`, archive SHA-256
`a54f36f00fe2fbba6a754491764edd77dea627c67efaa6bab1283f57b4bb8d4c`.

181 scenarios define 543 planned comparisons: 495 execute, with 48 touch capability skips. They cover native keyboard and
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
Two exact completion pairs record the pin dropping the submenu close callback during nested CSS
disposal and fresh whole-chain Tab departure; Angular lets the actual child exit finish before deleting its owning view.
The intended Angular focus-out and coordinate-based hover behavior are retained. See the
[source matrix](../../../../packages/primitives/menu/PARITY.md) for the source rationale and pending
scope. Unchanged/disappeared exceptions fail; there is no blanket normalization or acceptance command.

Custom IDs change between opens in the differential scenario: the pin keys trigger registration
by id. Angular additionally supports live ID changes without replacing the popup, checked through
the Events story and unit/browser regressions. Pending work includes cancelable focus-out, nested finalFocus, further API/lifecycle combinations and real device/AT verification.

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

## Trusted touch

Twenty-five cases use actual browser touch input. Nineteen tap cases run in Chromium/WebKit; six
cancel/pan cases run through Chromium CDP. Firefox touch and WebKit CDP gestures are skipped before
page creation (31 capability skips). The shared CDP helper also serves Select. Original input types,
trust and callback events remain in the observations; touch checkpoints compare native callback
metadata alongside focus, highlight, open/pressed state, values and scrolling.

Coverage includes taps, toggling, disabled commands/values, cancellation, outside press/panning,
LTR/RTL submenus, retained reopening and small/wide touch-opened scroll policy. A wheel beside the
popup probes page locking independently of actual pan gestures. After page panning, native scrollend
marks readiness for the next tap; neither fixture retries input to bypass momentum scrolling.

Two exact canceled-open/close focus pairs extend the existing macOS WebKit native-button-focus
category. Linux and every other touch field remain compared. See
[ADR 0049](../../../../docs/adr/0049-menu-trusted-touch.md). Emulation does not certify real hardware
or assistive technology.

## Mixed input and local checks

Seventeen hybrid cases / 34 executable comparisons cover touch/keyboard/mouse selection, successive
and retained sessions, hover-to-touch promotion and veto, small/wide scrolling, LTR/RTL child entry,
Enter/Space toggling and canceled child promotion. The same native touch helpers serve the touch-only
and hybrid suites. Firefox touch contexts are explicitly skipped before page creation.

Hybrid checkpoints compare the latest native callback, including type/trust, and SubTrigger's actual
aria-expanded. Full original event timelines remain in attachments. Exact native-hover-events pairs retain the original pointer/mouse source events. Keyboard activation
now uses the actual click path in both frameworks; its ten previous event pairs were removed after
review (ADR 0051). Composite Space/custom-host clicks are untrusted while browser inputs remain trusted. Existing macOS
WebKit native-button-focus pairs extend to hover/touch promotion. No adapter repairs these events.

Use `pnpm test-parity menu --grep hybrid- --project=chromium` while iterating, then omit the project
filter for the supported engines. Select existing touch/submenu and consumer scenarios when shared
Menu logic changes. Do not run every suite on each edit. See
[ADR 0050](../../../../docs/adr/0050-menu-hybrid-input.md).

## Native hosts

Twenty-three cases add 69 comparisons in all three engines. The host fixtures are separate Angular/
React modules using real button/div/anchor elements, application click listeners and native fragment
navigation. Modified links use an application navigation guard after recording the original event;
no adapter repairs modifiers, trust or focus. Disabled cases use pointer opening followed by real
arrows, Enter and Space; initial disabled-first keyboard focus is covered by the separate boundary cases below.

The observations compare a single click, original modifiers/trust, selection, focus and navigation.
Space extends typeahead; closing clears its query for a fresh retained session. Existing checkbox/
radio cases verify one activation through Space keyup. Run `pnpm test-parity menu --grep host-`
for this increment. See [ADR 0051](../../../../docs/adr/0051-menu-native-host-activation.md).

## Initial focus boundaries

Run `pnpm test-parity menu --grep initial-disabled`. Thirteen scenarios / 39 comparisons reuse the
native host fixtures for disabled-first and all/single-disabled roots, nested lists, directional
opening and retained reopening. The recordings include each actual tabindex/native-disabled state.
A shared initial selector prefers enabled edges; navigation still includes disabled items. SubTrigger
keeps its Tab entry while open. Bridge cleanup preserves current Angular bindings through close/reopen.

All three engines pass on macOS/Linux, without new exceptions or skips. The public Initial Focus
example has focused browser checks. Nested Tab departure is subsequently covered below. See
[ADR 0052](../../../../docs/adr/0052-menu-initial-focus-boundaries.md).

## Nested portal Tab departure

Six additional cases and the existing retained-submenu case compare native Tab/Shift+Tab from fresh
and reopened children. An intervening native parent input verifies logical declaration order rather
than an unconditional whole-chain close. The disabled edge remains keyboard-focusable, and an
explicit End request settles through a recorded checkpoint before a separate Tab request.

Run `pnpm test-parity menu --grep initial-disabled-submenu`. The shared focus manager bridges the
structural portal's declaration anchor; native focus events own close requests and guard cleanup.
One exact fresh-child completion pair extends nested-exit-completion; focus, close order/reasons,
trigger identity and retained/backward completions match. See
[ADR 0053](../../../../docs/adr/0053-menu-portal-tab-handoff.md).
