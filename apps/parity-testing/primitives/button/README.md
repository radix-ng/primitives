# Button behavioral comparisons

Run `pnpm test-parity button` with Node 24. The suite is discovered automatically and previews on
port 4513. Angular is AOT compiled; React imports the unmodified Base UI 1.9.0 commit in
[`reference.json`](../../reference.json). `BASE_UI_SOURCE` can point at a local checkout containing
that committed object. The runner verifies the archived source digest before each build.

## Scope

126 scenarios run in Chromium, Firefox and WebKit (378 comparisons):

- native `<button>`, `<div>`, `<span>`, `<a href>` and `<a>` without an href;
- DOM semantics, `data-disabled`, native disabled state, effective tabindex and ARIA disabled state;
- pointer activation and separate Enter/Space keydown and keyup checkpoints;
- trusted native button/link clicks, synthetic click targets, detail and modifier keys;
- keyboard repeat, prevented Enter keydown / Space keyup, and prevented click defaults;
- descendant keys and moving focus away before releasing Space;
- disabled/focusableWhenDisabled tab order, pointer focus retention and activation suppression;
- live disabled/focusable/type updates, including becoming disabled while focused;
- native submit/reset pointer and keyboard activation, submitter identity and actual field reset.

68 `consumer-`, `composite-` and `toolbar-` cases extend the initial 58:

- consumer-before-click order, template cancellation, native host listeners installed after bootstrap,
  and stopPropagation without canceling activation;
- Button rendered through a CompositeItem or Toolbar.Button on native button, span and link hosts;
- one roving tab stop, arrow focus, forward Tab exit, repeated and modified composite Space;
- focusable/unfocusable disabled items and Toolbar group/root disabled ownership;
- consumer-prevented Enter and composite Space defaults, with separate down/up checkpoints.

React uses the pin's actual `render={<Button />}` composition; Angular applies the corresponding
directives to one element. Toolbar forwards disabled state into its rendered Button: the fixture
leaves that prop unspecified unless the application explicitly disables the target.

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

The composition/consumer baseline in `dist/parity-testing/button/before-interaction-fix/` retains
the first 46 new scenarios: 34 Angular comparisons failed while all reference assertions passed.
Six consumer-handler unit witnesses also failed before the correction. The later cases add composite
cancellation and modifiers. The dynamic F6 re-enable command now waits for the rendered disabled
attribute to disappear before requesting the next activation, as F8 already did for native type.

## Limits

Authored role/tabindex overrides, bare Toolbar.Button without Button composition, other compound
families, auxiliary/modifier link navigation, real touch/pen, iframe/shadow realms, SSR/hydration and
assistive technologies remain separate checks. Ancestor propagation and stopImmediatePropagation
are outside the consumer-handler contract checked here.
The pin does not retain a Space keydown cancellation flag for non-native hosts: a prevented keydown
can still be followed by keyup activation. That behavior is tested explicitly. Programmatically
focusing an unfocusable disabled non-native host also preserves Space's native scroll; normal Tab
navigation skips it.
