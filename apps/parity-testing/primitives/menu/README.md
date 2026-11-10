# Menu behavioral comparisons

Run `pnpm test-parity menu` with Node 24. The runner discovers this suite automatically; preview
port is 4505. Angular fixtures are AOT compiled and React imports the unmodified shared reference.
Base UI 1.9.0 pin: `cf696d6f6e08c699c5bda24d5a033430909f2285`, archive SHA-256
`a54f36f00fe2fbba6a754491764edd77dea627c67efaa6bab1283f57b4bb8d4c`.

73 scenarios run in Chromium, Firefox and WebKit (219 comparisons). They cover native keyboard and
pointer opening, disabled/focusable items, roving focus, edges and looping, repeated and explicit-label
typeahead, selection and stay-open items, cancelable transactions, modal/background activation,
forward/backward Tab, checkbox/radio values, LTR/RTL submenu ownership and custom identity links.
Checkbox/radio models and open state remain uncontrolled. Both fixtures use native button items;
React's render/nativeButton configuration adapts its element API to Angular's element directives.

Eleven lifecycle scenarios compare retained checkbox state, natural CSS exits, external/late and
canceled holds, duplicate/stale actions, interrupted reopening, modal background recovery and
nested CSS completion. Menu and Popover share fixture lifecycle settings and a real CSS exit class
in `shared/lifecycle.ts`; per-primitive actions, models and observations remain independent.

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
the Events story and unit/browser regressions. Pending work includes
removal of entire root menus, empty-list keyboard promotion, broader Context Menu/Menubar composition,
and real device/AT verification.
