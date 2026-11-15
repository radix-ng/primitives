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
since been addressed below, along with A2's pinned positioning contracts. Remaining work consists of
A3–A5 and the unimplemented filterable Menu capability A6. Native device/AT verification remains
separate. The main matrix is [PARITY.md](PARITY.md); the executable comparison scope is documented
in the [runner](../../../apps/parity-testing/primitives/menu/README.md).

## Public part inventory

All 28 public export symbols are accounted for below (Handle/createHandle share a row).
“Mapped” identifies the Angular counterpart; it does not certify every possible composition.

| Pinned Base UI export | Angular counterpart                 | Audit result                                                                                                                                    |
| --------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Root                  | RdxMenuRoot                         | State, disabled/modal/orientation, highlighting, cancellation, completion, trigger identity and handle mapped; default initialization issue A3. |
| SubmenuRoot           | Nested RdxMenuRoot                  | DI-owned submenu composition; a second selector is unnecessary. Shares A2/A3.                                                                   |
| Trigger               | RdxMenuTrigger                      | Native/custom host, disabled, hover delays, handle/payload and native id mapped.                                                                |
| SubmenuTrigger        | RdxMenuSubTrigger                   | Native/custom host, disabled, label, hover delays and native id mapped.                                                                         |
| Item                  | RdxMenuItem                         | Native click/keyboard activation, label, disabled, closeOnClick and highlight mapped.                                                           |
| LinkItem              | RdxMenuLinkItem on an anchor        | Native href/router composition and stay-open default mapped; Angular also supports disabled links.                                              |
| CheckboxItem          | RdxMenuCheckboxItem                 | Checked model and cancelable change mapped. No separate defaultChecked input; see adaptations below. Indeterminate is an Angular extension.     |
| CheckboxItemIndicator | RdxMenuCheckboxItemIndicator        | Lifecycle, disabled state and decorative semantics addressed in follow-up A1.                                                                   |
| RadioGroup            | RdxMenuRadioGroup                   | Value/defaultValue/disabled and cancelable change mapped; A3.                                                                                   |
| RadioItem             | RdxMenuRadioItem                    | Required value, disabled/label, checked/highlight and closeOnClick mapped.                                                                      |
| RadioItemIndicator    | RdxMenuRadioItemIndicator           | Same follow-up as CheckboxItemIndicator, A1.                                                                                                    |
| Popup                 | RdxMenuPopup                        | Public id/finalFocus and documented popup state attributes mapped. initialFocus is internal in the pin.                                         |
| Positioner            | RdxMenuPositioner / shared Popper   | Pinned positioning contracts covered; zoom evidence uses Chromium emulation, A2.                                                                |
| Portal                | Structural RdxMenuPortal            | keepMounted and custom element containers mapped; unsupported targets, A4.                                                                      |
| Backdrop              | RdxMenuBackdrop                     | Open/closed/transition attributes mapped; internal modal backdrop remains shared infrastructure.                                                |
| Arrow                 | RdxMenuArrow / RdxPopperArrow       | Open/closed, side/align and composed data-uncentered mapped.                                                                                    |
| Viewport              | RdxMenuViewport / usePopupViewport  | Current/previous snapshots, direction, transition/instant attributes and dimensions mapped.                                                     |
| Group                 | RdxMenuGroup                        | Group role and label association mapped.                                                                                                        |
| GroupLabel            | RdxMenuGroupLabel                   | Generated association works; authored id and decorative semantics differ, A5.                                                                   |
| Separator             | RdxMenuSeparator                    | Orientation and semantic/data attributes mapped.                                                                                                |
| Handle / createHandle | RdxMenuHandle / createRdxMenuHandle | Detached trigger/payload, open/close, isOpen and owner lifetime mapped.                                                                         |
| FilterProvider        | None                                | Missing capability A6.                                                                                                                          |
| Input                 | None in Menu                        | Missing capability A6; a native input alone does not supply its focus/filter contract.                                                          |
| List                  | None in Menu                        | Missing capability A6; an Angular item loop alone does not supply its navigation contract.                                                      |
| Clear                 | None in Menu                        | Missing capability A6.                                                                                                                          |
| Empty                 | None in Menu                        | Missing capability A6.                                                                                                                          |
| useFilter             | Existing core.useFilter             | Reusable locale-aware predicate building block; does not implement the missing Menu filtering lifecycle.                                        |

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

### A3 — P2: defaults can overwrite an explicit or already-changed model

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

### A4 — P2: Portal rejects valid ShadowRoot and cross-realm containers

[RdxPortalContainer / resolvePortalContainer](../portal/src/resolve-container.ts) exclude ShadowRoot
and test native elements against the caller realm's HTMLElement constructor. A ShadowRoot resolves
to null; so does a valid element created by an iframe. PortalPresence then falls back to document.body.
Both resolver outcomes were reproduced with real jsdom nodes; this proves target rejection, not
cross-document layout correctness.

The pin's MenuPortalProps accepts ShadowRoot explicitly. Supporting native DOM container identity
does not require React refs or a React portal wrapper. This is shared Portal infrastructure.

Next checks: actual browser mounting in a shadow root and another document, style/ARIA boundaries,
cleanup, retained reopening and affected Dialog/Popover/Select consumers.

### A5 — P2: GroupLabel replaces an authored id

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

Current expected-differences.json has 143 exact field entries in 10 categories across 29 scenarios.
No entry was added, removed or loosened by this audit.

| Category                               | Fields | Disposition / decision                                                                                                          |
| -------------------------------------- | -----: | ------------------------------------------------------------------------------------------------------------------------------- |
| programmatic-focus-out                 |     10 | Intentional native Angular focus-out instead of React capture suppression; ADR 0034.                                            |
| zero-delta-pointer-travel              |     80 | Pin ignores actual WebKit coordinate travel; keep coordinate-based behavior and exact browser/platform scopes. ADR 0036 / 0066. |
| removed-item-focus                     |     16 | Native DOM-removal recovery instead of leaving body focused; ADR 0037 / 0060.                                                   |
| nested-exit-completion                 |      2 | Angular completes accepted child close before owner disposal; pin aborts it. ADR 0035 / 0053.                                   |
| native-hover-events                    |     10 | Original Pointer/Mouse event records remain unmodified; ADR 0050 / 0051.                                                        |
| empty-submenu-keyboard-focus           |     12 | Pin's unchanged-index keyboard entry leaves focus on the trigger; ADR 0048.                                                     |
| parent-close-interaction-type          |     10 | Angular preserves original mouse type; pin's child callback receives empty type. ADR 0058.                                      |
| closed-retained-child-tabindex-restore |      1 | Hidden child remains -1 in Angular rather than restoring 0. Actual visible Tab stops match; ADR 0057.                           |
| controlled-retained-label              |      1 | Closed hidden Popup loses its active association in Angular; pin retains a controlled id. ADR 0061.                             |
| stale-highlight-text-label             |      1 | Angular reads current label text; pin retains registration text. ADR 0060.                                                      |

The targeted three-engine run selected all 29 scenarios: 82 passed, four capability skips and one
failure in the React assertion for hybrid-hover-touch-promote on WebKit. The pin closed on a native
mousedown where the scenario expected touch promotion. Five isolated repeats then passed with the
existing exact exceptions. This remains a reproducibility issue; the initial failure is not erased
by the repeat. Do not add an exception or rewrite reference state to make that assertion disappear.
Linux-only fields still require Linux CI; this audit ran on macOS.

## Validation and next increment

- Existing Menu unit suite: 235 tests passed.
- Thirteen temporary contract probes reproduced the DOM/model/resolver differences described above.
  They intentionally asserted the missing contracts and failed; no failing test was left in the suite.
- Chromium checked the indicator's accessible name and immediate hiding despite an authored paused exit.
- Public source inventory and the prepared pin were checked; no runtime/public examples were changed.
- Exception validation is qualified by the WebKit reference assertion and platform scope above.

A1 is addressed. Continue with A2/A4 through shared Popper/Portal consumers,
A3/A5 initialization/identity, and a separate filtering increment A6. Add focused regressions against
the missing contracts, not more permutations of already-covered plain Menu commands. Independent
Context Menu Tab and Popover/Dialog audits remain separate work.
