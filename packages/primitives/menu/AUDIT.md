# Menu — API and deviation audit

Audited 2026-11-15 at Radix NG `d000174e`. Reference: Base UI 1.9.0,
[`cf696d6f6e08c699c5bda24d5a033430909f2285`](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/menu).
Local checkout HEAD `fb9fbbf35e72bd4a5494b678c85d2ea0457fed60` was inspected separately.
The pinned exports were also read directly from committed Git objects; checkout-only additions
were not counted as gaps. Scope: public exports, part inputs/events, state attributes, CSS variables,
accepted decisions and exact comparison exceptions. The initial audit changed no runtime behavior;
subsequent implementation status is recorded below.

## Result

The existing suite establishes substantial plain Menu behavior, not complete Menu parity.
The source inventory is now complete for this pin. Five defect/contract groups were found; A1 has
since been addressed below, along with A2's pinned positioning contracts and A3's initialization rules.
Pending Portal destinations (A4) and GroupLabel identity (A5) are addressed in ADR 0073 below.
Remaining capability work is filterable Menu (A6). Native device/AT verification remains
separate. The main matrix is [PARITY.md](PARITY.md); the executable comparison scope is documented
in the [runner](../../../apps/parity-testing/primitives/menu/README.md).

## Public part inventory

All 28 public export symbols are accounted for below (Handle/createHandle share a row).
“Mapped” identifies the Angular counterpart; it does not certify every possible composition.

| Pinned Base UI export | Angular counterpart                 | Audit result                                                                                                                                         |
| --------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Root                  | RdxMenuRoot                         | State, disabled/modal/orientation, highlighting, cancellation, completion, trigger identity and handle mapped; default initialization addressed, A3. |
| SubmenuRoot           | Nested RdxMenuRoot                  | DI-owned submenu composition; a second selector is unnecessary. Shares A2/A3.                                                                        |
| Trigger               | RdxMenuTrigger                      | Native/custom host, disabled, hover delays, handle/payload and native id mapped.                                                                     |
| SubmenuTrigger        | RdxMenuSubTrigger                   | Native/custom host, disabled, label, hover delays and native id mapped.                                                                              |
| Item                  | RdxMenuItem                         | Native click/keyboard activation, label, disabled, closeOnClick and highlight mapped.                                                                |
| LinkItem              | RdxMenuLinkItem on an anchor        | Native href/router composition and stay-open default mapped; Angular also supports disabled links.                                                   |
| CheckboxItem          | RdxMenuCheckboxItem                 | Checked model and cancelable change mapped. No separate defaultChecked input; see adaptations below. Indeterminate is an Angular extension.          |
| CheckboxItemIndicator | RdxMenuCheckboxItemIndicator        | Lifecycle, disabled state and decorative semantics addressed in follow-up A1.                                                                        |
| RadioGroup            | RdxMenuRadioGroup                   | Value/defaultValue/disabled and cancelable change mapped; initialization addressed, A3.                                                              |
| RadioItem             | RdxMenuRadioItem                    | Required value, disabled/label, checked/highlight and closeOnClick mapped.                                                                           |
| RadioItemIndicator    | RdxMenuRadioItemIndicator           | Same follow-up as CheckboxItemIndicator, A1.                                                                                                         |
| Popup                 | RdxMenuPopup                        | Public id/finalFocus and documented popup state attributes mapped. initialFocus is internal in the pin.                                              |
| Positioner            | RdxMenuPositioner / shared Popper   | Pinned positioning contracts covered; zoom evidence uses Chromium emulation, A2.                                                                     |
| Portal                | Structural RdxMenuPortal            | Native destinations and pending null containers covered, A4 and ADRs 0072–0073.                                                                      |
| Backdrop              | RdxMenuBackdrop                     | Open/closed/transition attributes mapped; internal modal backdrop remains shared infrastructure.                                                     |
| Arrow                 | RdxMenuArrow / RdxPopperArrow       | Open/closed, side/align and composed data-uncentered mapped.                                                                                         |
| Viewport              | RdxMenuViewport / usePopupViewport  | Current/previous snapshots, direction, transition/instant attributes and dimensions mapped.                                                          |
| Group                 | RdxMenuGroup                        | Group role and label association mapped.                                                                                                             |
| GroupLabel            | RdxMenuGroupLabel                   | Authored/generated/reactive ids, naming and guarded cleanup covered, A5 and ADR 0073.                                                                |
| Separator             | RdxMenuSeparator                    | Orientation and semantic/data attributes mapped.                                                                                                     |
| Handle / createHandle | RdxMenuHandle / createRdxMenuHandle | Detached trigger/payload, open/close, isOpen and owner lifetime mapped.                                                                              |
| FilterProvider        | None                                | Missing capability A6.                                                                                                                               |
| Input                 | None in Menu                        | Missing capability A6; a native input alone does not supply its focus/filter contract.                                                               |
| List                  | None in Menu                        | Missing capability A6; an Angular item loop alone does not supply its navigation contract.                                                           |
| Clear                 | None in Menu                        | Missing capability A6.                                                                                                                               |
| Empty                 | None in Menu                        | Missing capability A6.                                                                                                                               |
| useFilter             | Existing core.useFilter             | Reusable locale-aware predicate building block; does not implement the missing Menu filtering lifecycle.                                             |

## Findings and required evidence

### A1 — resolved: indicator lifecycle and decorative semantics (originally P2)

Follow-up 2026-11-15: both indicators now compose the existing core useTransitionStatus through
one Menu helper. Phases are transient; exit completion hides the consumer-owned host, reselection
invalidates the old wait, and initial selection does not animate in. Both parts set aria-hidden=true
and inherit effective disabled state through the item context. keepMounted leaves the settled host
displayed. Public docs describe the migration from permanent phase attributes to checked-state styling.

Twelve new Angular tests cover semantics, item/group/Root disabling, initial selection, indeterminate
state, real completion promises and stale waits. Ten pinned scenarios cover fresh/retained hosts,
native names, paused/natural CSS exits and interruption in all three engines, with no new exception.
Validation: 276 scoped unit tests passed, 30 indicator comparisons passed across Chromium/Firefox/WebKit,
and the existing checkbox/radio selection/cancellation cases passed in all three engines.

Original audit evidence:

[Checkbox indicator](src/menu-checkbox-item-indicator.ts) and
[radio indicator](src/menu-radio-item-indicator.ts) permanently set data-starting-style while checked
and data-ending-style while unchecked. With keepMounted=false, display:none is applied immediately,
so an authored exit animation cannot finish. Both omit aria-hidden and the documented inherited
data-disabled attribute. Their item contexts currently publish only checked state.

Browser reproduction on the Checkbox Item story: the checked item's accessible snapshot is
`menuitemcheckbox "✓ Crows" [checked]`. After unchecking with a paused 30-second ending animation,
the indicator has display:none and zero running animations. This is visibility evidence from Chromium,
not an inference from jsdom. Six focused DOM contract probes also reproduced the missing aria-hidden,
disabled state and non-transient enter attributes for both parts.

Reference: menu/checkbox-item-indicator/MenuCheckboxItemIndicator.tsx and its radio equivalent use
useTransitionStatus plus completion before removing an indicator, publish item state and set
aria-hidden=true. Existing Angular tests mostly check display/state and currently assert the permanent
ending attribute; they do not establish this transition contract.

Next checks: fresh/retained indicators, settled enter, natural/paused exit, rapid recheck/reselection,
disabled styling and accessible item names. Reuse existing transition/presence mechanisms. Angular may
retain its consumer-owned host; copying React element creation is unnecessary.

### A2 — addressed: pinned positioning contracts; device zoom remains external verification

Follow-up 2026-11-15: Menu now resolves contextual side/alignment/offset/collision defaults from
existing owner signals through the shared Popper policy hook. Retained Menubar orientation changes
are reactive. Root direction reaches the positioning engine through DI. Context Menu's point-anchor
shift policy preserves its two-pixel alignment offset. Sixteen geometry scenarios / 48 comparisons
passed in Chromium, Firefox and WebKit without new exceptions. Validation also passed 554 scoped unit tests,
24 shared-consumer live-anchor browser checks and the Storybook API-table regression.
See [ADR 0067](../../../docs/adr/0067-menu-contextual-positioning.md).

Follow-up 2026-11-15: shared collisionBoundary now accepts clipping ancestors, native elements,
ElementRef/mixed arrays and viewport Rect records. The default follows the actual floating ancestry,
with explicit [] preserving viewport-only collision checks. ElementRef remains an Angular adaptation.
See [ADR 0068](../../../docs/adr/0068-popper-collision-boundaries.md) for migration and the pin's
native DOMRect replacement limitation; canonical Rect updates are compared without new exceptions.
Validation passed 563 scoped unit tests, 42 boundary comparisons, 45 shared/family browser regressions
and the Storybook API-table check. Library/Storybook builds, consumer generation and focused lint passed.

Follow-up 2026-11-15: shared positionMethod now defaults to absolute and sticky is boolean/false.
Context Menu forces fixed throughout its chain and zero arrow padding on the point-anchored root.
Arrow/attachment behavior now follows the pin, including the popup-box offset and the limiter's
arrow/padding allowance. See [ADR 0069](../../../docs/adr/0069-popper-position-method-and-sticky.md)
for the breaking migration and native-scroll comparison scope.

Validation passed 569 scoped unit tests, 126 geometry comparisons across all three engines
(placement, boundaries and method/sticky), and 57 shared-consumer browser regressions. Library and
Storybook builds, consumer generation, the Storybook API-table check and focused lint passed.

Follow-up 2026-11-15: Context Menu's point-anchored root now uses Floating UI's layoutViewport for
shift only. Descendant/ordinary Menu keeps visual-viewport shifting; Navigation Menu composes the
same layout policy as its pin. Flip, size and explicit collision boundaries retain their own rules.
The workspace dependency and published peer minimum are both Floating UI DOM ^1.8.0. Six Chromium
comparisons cover zoom/reset, native viewport pan, RTL, descendants, an explicit boundary and an
ordinary Menu control; each passed twice. A separate Navigation Menu browser regression passed.
See [ADR 0070](../../../docs/adr/0070-layout-viewport-shift.md). This addresses A2's pinned contract;
Firefox/WebKit zoom lack a public automation API, and real-device/keyboard/AT verification remains
external. This is not full Menu parity.

Validation after the dependency update passed 570 scoped unit tests, 132 positioning comparisons
with twelve explicit zoom capability skips, 60 shared-consumer browser checks and the additional
Navigation Menu zoom regression. Library/Storybook builds, consumer generation, focused lint and
agent checks passed. The complete Menu suite was not rerun locally.

Original audit evidence:

[Menu Positioner](src/menu-positioner.ts) always uses the dropdown preset and inherited bottom/center
defaults. The pin selects inline-end/start and POPUP_COLLISION_AVOIDANCE for a submenu, and start
alignment plus orientation-dependent side for Menubar. Context Menu has additional offset defaults.
A focused Angular probe confirmed bottom/center on an unconfigured submenu. Existing comparison
fixtures normally author side and align explicitly, so they do not detect this default gap.

The [shared wrapper](../popper/src/popper-content-wrapper.ts) also exposes positionStrategy with a
fixed default instead of positionMethod with an absolute default. Its sticky partial/always surface
corresponds to the pin's false/true policies rather than accepting its boolean contract. Collision
boundaries accept ElementRef values; the pin additionally supports native elements, rectangles and
clipping-ancestors. The Angular default resolves to an empty boundary list rather than that mode.
ElementRef is a useful Angular input adaptation, but missing boundary modes and context defaults
are not consequences of Angular's rendering model.

[ADR 0012](../../../docs/adr/0012-thin-positioners.md) documents the inherited surface and truthful
runtime defaults, including Menu's center alignment. It does not establish that these defaults
match the current pin in every parent context. Keep that composition architecture; revising a
documented default or input type needs an explicit migration decision, not a duplicate positioner.

Reference: menu/positioner/MenuPositioner.tsx and internals/useAnchorPositioning.ts.
The shared seven CSS variables are present: --anchor-width/height, --available-width/height,
--positioner-width/height and --transform-origin. Viewport's --popup-width/height are also mapped;
there is no missing-variable finding here.

Next checks: omitted placement inputs in LTR/RTL, vertical Menubar, edge fallback, clipping ancestors,
rectangle/native boundaries and transformed custom containers. Resolve the shared API/default policy
once in Popper/configuration and verify Select, Popover, Context Menu and Menubar consumers.

### A3 — addressed: initial models take precedence over one-time defaults

Follow-up 2026-11-15: Menu Root and RadioGroup now initialize through the owned watch([], ...)
utility. A defined initial model wins; defaults are consumed once, including false/undefined defaults.
Root retains model(false) and uses Angular's public ngOnChanges only to identify explicit initial
open bindings. RadioGroup preserves every defined value, including null, false and zero, and only
uses the initial default when value is undefined. No React controlled store, private signal-node
patch, widened boolean output or second state owner was added.

Seven assertions first reproduced the old behavior. Eleven unit cases now cover explicit/default
precedence, late changes, native model writes, nested Roots and a hostDirectives wrapper. Twelve
new pinned cases cover initial/default open, late defaults before/after close or radio selection,
explicit null/undefined radio values and accepted nested updates in all three engines. No new
comparison exception is needed. A server render verifies model/default precedence before hydration
serialization. See [ADR 0071](../../../docs/adr/0071-menu-initial-model-defaults.md).

Validation passed 292 scoped unit tests, 54 Menu and 27 Menubar comparisons, one SSR case and
twelve Storybook consumer checks. Library/Storybook builds, consumer generation, focused lint,
parity tools typecheck and agents:check passed. Full suites were not rerun locally.

Original audit evidence:

[Root's initialization effect](src/menu-root.ts) applies defaultOpen=true even when open=false was
explicitly bound. [RadioGroup](src/menu-radio-group.ts) applies defaultValue over an explicit value;
if the initial default is undefined, a later default also overwrites an existing selection.
Three focused probes reproduced these outcomes:

| Trigger                                                         | Expected contract            | Current result           |
| --------------------------------------------------------------- | ---------------------------- | ------------------------ |
| open=false, defaultOpen=true                                    | Explicit state remains false | Menu becomes open.       |
| value="controlled", defaultValue="default"                      | Explicit value is retained   | Value becomes "default". |
| Initially no default; select "chosen"; then defaultValue="late" | Existing selection survives  | Value becomes "late".    |

The last case is an uncontrolled initialization problem as well, not just a difference in React's
controlled-prop detection. Current tests cover initial defaults and changing an already-applied
default, not these combinations.

Next checks: explicit model/default precedence, undefined/null policy and late async defaults for
Root, nested Root and RadioGroup. Define the Angular model contract before changing initialization;
do not introduce a React controlled/uncontrolled store or a second state owner merely to match names.

### A4 — addressed: native destinations and pending containers

Second follow-up 2026-11-15: explicit container=null now defers structural view creation, even with
keepMounted. Undefined retains the existing default. Signal queries supply later targets directly.
Suspension destroys the old view and invalidates its exit; restoration creates a fresh view. Shared
popup completion waits for an actual destination, including close/reopen before the first mount.
Attribute Portal detaches/reconnects its existing host in the browser and preserves server in-place
rendering. Presence uses the animated roots' document clock for iframe exits. See
[ADR 0073](../../../docs/adr/0073-portal-pending-and-menu-labels.md).

Six new pending cases cover both existing DOM surfaces, retained views and interrupted CSS exits.
They observe actual open requests/completions, focus, isolation and owner removal without new
exceptions. Popover/Dialog/Select have affected destination regressions; this does not certify their
independent callback/API audits.

Follow-up 2026-11-15: shared Portal now accepts ShadowRoot, foreign/adopted HTML elements and
ElementRef wrappers through one resolver. Shared core node/event guards fix the iframe keyboard
and focus chain across Menu, Composite, Focus Scope and floating focus; dismissal reuses the same
guards. The common node mover retains view identity, edited values and moved focus. SSR keeps
custom-container views at their declaration location without a global HTMLElement constructor.

Ten pinned scenarios exercise keyboard/pointer input, native/ref targets, retained reopening,
live retargeting and owner disposal in open shadow trees and same-origin iframe documents.
Separate Angular checks cover Popover, Dialog and Select in both surfaces, plus ordinary Portal
transfer between documents. Interactive widgets share one tree/document for native ARIA; mixed
document overlays and closed-shadow interactions remain unverified. See
[ADR 0072](../../../docs/adr/0072-portal-dom-destinations.md).

Live target changes preserve Angular's view, current item and completion sequence. The pin remounts
its Portal, restores its initial item and emits an additional true completion. Twelve exact fields
in portal-view-relocation record the identical witnesses from all three engines. Initial Angular
focus loss during relocation was fixed; it is not accepted as a difference.

Earlier source follow-up found a further Portal API policy: Base UI's explicit container=null waits for a
target, and a React ref can retry while empty. Angular's existing container surface has no explicit
pending-target state. That finding was implemented in the second follow-up above through native
Angular signal queries and shared Presence/lifecycle ownership.

Original audit evidence:

[RdxPortalContainer / resolvePortalContainer](../portal/src/resolve-container.ts) exclude ShadowRoot
and test native elements against the caller realm's HTMLElement constructor. A ShadowRoot resolves
to null; so does a valid element created by an iframe. PortalPresence then falls back to document.body.
Both resolver outcomes were reproduced with real jsdom nodes; this proves target rejection, not
cross-document layout correctness.

The pin's MenuPortalProps accepts ShadowRoot explicitly. Supporting native DOM container identity
does not require React refs or a React portal wrapper. This is shared Portal infrastructure.

Original proposed checks (now covered above): browser mounting in a shadow root and another document, style/ARIA boundaries,
cleanup, retained reopening and affected Dialog/Popover/Select consumers.

### A5 — addressed: authored GroupLabel identity and semantics (originally P2)

Follow-up 2026-11-15: GroupLabel now exposes the native id as a signal input, retains a stable
generated fallback and publishes the resolved id reactively. Guarded cleanup preserves newer label
ownership. The host is aria-hidden=true while naming Group/RadioGroup through aria-labelledby.
Eight unit tests (including accessible names and axe), six comparison scenarios, the Custom
Container example and server serialization cover this contract. See ADR 0073.

A4–A5 validation: the focused 60-browser-check run passed in all three engines; an additional
highlighted-item witness found a stale index on popup disposal. Guarded collection cleanup fixed it,
and the final 36 comparisons passed without new exceptions. Unit checks passed 343 Menu/Portal/
lifecycle tests and 50 Context Menu/Menubar tests. See ADR 0073 for the initial timeout/exit-window
failure record and the broader affected-consumer checks.

Original audit evidence:

[GroupLabel](src/menu-group-label.ts) always writes its generated id and registers that value with
Group. A focused probe authored id="custom-group-label" and observed an rdx-menu-group-label-\* id
instead. The pin resolves the consumer's id and updates the group association when it changes.
Angular also omits the pin's aria-hidden=true on the label.

Generated group naming works today; the gap concerns authored references and decorative-label
semantics. Next checks: authored/reactive ids, Group and RadioGroup associations, removal/replacement,
and accessible names. Use the existing reactive id approach from Trigger/SubTrigger/Popup.

### A6 — capability gap: the public filtering family is not implemented

The pinned menu/index.parts.ts exports FilterProvider, Input, List, Clear and Empty. Provider options
include filter/filter=null, value/defaultValue, onValueChange, locale and autoHighlight=false/true/always.
Neither corresponding Menu parts nor their behavior scenarios exist in Radix NG.

This is a functional search/query, keyboard/virtual-focus, clear/reset and empty-results contract,
not a requirement to copy React providers. Native inputs and manual item filtering alone do not
establish it. Root's pin also includes close-press in its public reason union; Angular's current
union omits that reason, so filtering integration needs an event-contract review as well.

[core.useFilter](../core/src/composables/use-filter.ts) already provides locale-aware predicates and
accepts Intl.Collator options. Reuse that building block and the owned Menu/composite mechanisms;
evaluate query/focus reuse with Combobox rather than duplicating a React interaction store.

Next checks: query changes, locale/punctuation matching, filter=null, disabled/grouped results,
all auto-highlight modes, IME, Escape/reset, clear, empty/refilled results and searchable submenus.

## Adaptations that are not missing parts

- Attribute directives/native hosts/hostDirectives replace render/ref/element component composition.
- Nested RdxMenuRoot replaces SubmenuRoot; declared DI ownership must remain intact across portals.
- Root close()/unmount() replace actionsRef. Angular outputs carry the cancelable change object;
  consumers also retain native DOM events. isOpen is a signal on the handle.
- checked model initialization does not require a second defaultChecked input solely for React API
  symmetry. Its initialization contract should be documented with A3; indeterminate remains an extension.
- MenuPopupPlainProps.initialFocus is internal in the pin. It is not a missing public Menu.Popup input.
- Structural portals may retain a consumer-owned host; wrapper count and React stores are not parity
  requirements. Visibility, lifetime, focus, native input and documented state remain contracts.

## Exact exception review

Current expected-differences.json has 75 exact field entries in ten categories across 18 scenarios.
The original audit reviewed 143 fields in ten categories across 29 scenarios. ADR 0072 added
twelve measured live-retarget fields. The Playwright 1.65.1 upgrade resolved all 80 WebKit
pointer-travel fields in Menu.

| Category                               | Fields | Disposition / decision                                                                                |
| -------------------------------------- | -----: | ----------------------------------------------------------------------------------------------------- |
| programmatic-focus-out                 |     10 | Intentional native Angular focus-out instead of React capture suppression; ADR 0034.                  |
| removed-item-focus                     |     16 | Native DOM-removal recovery instead of leaving body focused; ADR 0037 / 0060.                         |
| nested-exit-completion                 |      2 | Angular completes accepted child close before owner disposal; pin aborts it. ADR 0035 / 0053.         |
| native-hover-events                    |     10 | Original Pointer/Mouse event records remain unmodified; ADR 0050 / 0051.                              |
| empty-submenu-keyboard-focus           |     12 | Pin's unchanged-index keyboard entry leaves focus on the trigger; ADR 0048.                           |
| parent-close-interaction-type          |     10 | Angular preserves original mouse type; pin's child callback receives empty type. ADR 0058.            |
| closed-retained-child-tabindex-restore |      1 | Hidden child remains -1 in Angular rather than restoring 0. Actual visible Tab stops match; ADR 0057. |
| controlled-retained-label              |      1 | Closed hidden Popup loses its active association in Angular; pin retains a controlled id. ADR 0061.   |
| stale-highlight-text-label             |      1 | Angular reads current label text; pin retains registration text. ADR 0060.                            |
| portal-view-relocation                 |     12 | Angular preserves the existing view/item; the pin remounts and repeats open completion. ADR 0072.     |

The original targeted three-engine run selected its 29 scenarios: 82 passed, four capability skips and one
failure in the React assertion for hybrid-hover-touch-promote on WebKit. The pin closed on a native
mousedown where the scenario expected touch promotion. Five isolated repeats then passed with the
existing exact exceptions. This remains a reproducibility issue; the initial failure is not erased
by the repeat. Do not add an exception or rewrite reference state to make that assertion disappear.
Linux-only fields still require Linux CI; this audit ran on macOS.

## Validation and next increment

Original audit-only validation:

- Existing Menu unit suite: 235 tests passed.
- Thirteen temporary contract probes reproduced the DOM/model/resolver differences described above.
  They intentionally asserted the missing contracts and failed; no failing test was left in the suite.
- Chromium checked the indicator's accessible name and immediate hiding despite an authored paused exit.
- Public source inventory and the prepared pin were checked; no runtime/public examples were changed.
- Exception validation is qualified by the WebKit reference assertion and platform scope above.

A1/A2/A3 and A4's destination-node rejection are addressed in the follow-ups above. The ADR 0072
Portal increment passed 772 unit tests, 48 Menu comparisons, 24 new Angular consumer browser
checks, 45 existing floating-consumer checks and two SSR cases. Two production Storybook API
checks and 30 documentation-generator tests passed. Library/Storybook builds and consumer generation passed.

A4's pending-target policy and A5 label identity are addressed by ADR 0073, with focused validation
recorded there. Continue with filtering A6. Independent Context Menu Tab and Popover/Dialog audits
remain separate work.
