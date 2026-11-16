# Button behavioral comparisons

Run `pnpm test-parity button` with Node 24. The suite is discovered automatically and previews on
port 4513. Angular is AOT compiled; React imports the unmodified Base UI 1.9.0 commit in
[`reference.json`](../../reference.json). `BASE_UI_SOURCE` can point at a local checkout containing
that committed object. The runner verifies the archived source digest before each build.

## Scope

58 scenarios run in Chromium, Firefox and WebKit (174 comparisons):

- native `<button>`, `<div>`, `<span>`, `<a href>` and `<a>` without an href;
- DOM semantics, `data-disabled`, native disabled state, effective tabindex and ARIA disabled state;
- pointer activation and separate Enter/Space keydown and keyup checkpoints;
- trusted native button/link clicks, synthetic click targets, detail and modifier keys;
- keyboard repeat, prevented Enter keydown / Space keyup, and prevented click defaults;
- descendant keys and moving focus away before releasing Space;
- disabled/focusableWhenDisabled tab order, pointer focus retention and activation suppression;
- live disabled/focusable/type updates, including becoming disabled while focused;
- native submit/reset pointer and keyboard activation, submitter identity and actual field reset.

The driver uses real browser input. F6/F7/F8 are application commands that update each fixture's own
state; subsequent actions wait for the relevant rendered state. The recorder does not synthesize
component state, focus, form results or activation events. Non-native synthesis comes from the
primitive being tested.

Checkpoints compare semantic disabled values and effective tabindex. Redundant `aria-disabled=false`
versus an absent attribute is normalized; raw DOM remains in measurements. Native buttons explicitly
set `tabindex=0`, which matters for WebKit keyboard navigation on macOS. The surrounding fixture
buttons also opt into the tab order. Raw native capture/bubble events are retained as evidence, while
the compared click records come from the consumer handler. Angular capture guards and React event
delegation have different propagation mechanics; identical native ancestor propagation is outside
this increment.

## Runtime changes established by the comparisons

The initial Chromium run had 25 failing Angular comparisons with every reference assertion passing.
Six focused unit regressions also failed before the runtime correction. The local baseline is in
`dist/parity-testing/button/before-button-fix/`; subsequent reports live in `results/`.

One baseline failure was a fixture race: the dynamic native type case pressed Enter before Angular
rendered the new type after F8. It now awaits the actual type attribute. The other 24 comparisons
exposed Button behavior differences.

Non-native Space now activates on keyup, Enter on valid links uses the browser's native click,
synthesized clicks preserve modifiers, and descendant keys do not activate the outer button.
Disabled pointerdown prevents the browser from moving focus; explicit native tabindex preserves
WebKit tab order and pointer focus. Firefox's native link Enter reports click detail 1; both fixtures
retain and assert that browser value. See the
[primitive contract and migration notes](../../../../packages/primitives/button/PARITY.md).

`expected-differences.json` is empty: this increment introduces no differential exceptions.

## Limits

This is standalone Button evidence. Composite-widget ownership, authored role/tabindex overrides,
consumer key handlers registered later on the same host, auxiliary/modifier link navigation, real
touch/pen, iframe/shadow realms, SSR/hydration and assistive technologies remain separate checks.
The pin does not retain a Space keydown cancellation flag for non-native hosts: a prevented keydown
can still be followed by keyup activation. That behavior is tested explicitly. Programmatically
focusing an unfocusable disabled non-native host also preserves Space's native scroll; normal Tab
navigation skips it.
