# Menu behavioral comparisons

Run `pnpm test-parity menu` with Node 24. The runner discovers this suite automatically; preview
port is 4505. Angular fixtures are AOT compiled and React imports the unmodified shared reference.
Base UI 1.9.0 pin: `cf696d6f6e08c699c5bda24d5a033430909f2285`, archive SHA-256
`a54f36f00fe2fbba6a754491764edd77dea627c67efaa6bab1283f57b4bb8d4c`.

34 scenarios run in Chromium, Firefox and WebKit (102 comparisons). They cover native keyboard and
pointer opening, disabled/focusable items, roving focus, edges and looping, repeated and explicit-label
typeahead, selection and stay-open items, cancelable transactions, modal/background activation,
forward/backward Tab, checkbox/radio values, LTR/RTL submenu ownership and custom identity links.
Checkbox/radio models and open state remain uncontrolled. Both fixtures use native button items;
React's render/nativeButton configuration adapts its element API to Angular's element directives.

Drivers own Menu's DOM snapshot and actions. `shared/run-scenario.ts` only shares the browser-page,
reference validation and reporting lifecycle with Popover. Select retains its specialized runner
because it also validates touch capabilities and geometry contracts. No universal control driver
or framework state mirror is introduced.

Raw records include source commit/digest, browser versions, open/change completions, native change
event types and trusted pointer coordinates/deltas. CSS layout and default focus are observed;
the adapters do not synthesize state, focus, pointer deltas or lifecycle completion.

## Reviewed limitations

`expected-differences.json` contains ten exact consequences of the pin suppressing programmatic
focus-out, a macOS WebKit native button click-focus pair, and exact WebKit pointer-travel pairs.
The intended Angular focus-out and coordinate-based hover behavior are retained. See the
[source matrix](../../../../packages/primitives/menu/PARITY.md) for the source rationale and pending
scope. Unchanged/disappeared exceptions fail; there is no blanket normalization or acceptance command.

Custom IDs change between opens in the differential scenario: the pin keys trigger registration
by id. Angular additionally supports live ID changes without replacing the popup, checked through
the Events story and unit/browser regressions. Pending work includes shared close-lifecycle adoption,
retained/deferred/CSS timing, hover grace areas, pointer press-drag-release, Context Menu/Menubar,
dynamic collections and real device/AT verification.
