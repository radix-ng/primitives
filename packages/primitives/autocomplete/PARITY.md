# Autocomplete — Base UI compatibility

Audited 2026-11-17 against Base UI **1.9.0**, commit
[`cf696d6f6e08c699c5bda24d5a033430909f2285`](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/autocomplete),
as pinned in [reference.json](../../../apps/parity-testing/reference.json).
`pnpm parity:prepare` validated the prepared source digest:
`a54f36f00fe2fbba6a754491764edd77dea627c67efaa6bab1283f57b4bb8d4c`.
The local Base UI checkout's current HEAD differs from this pin; its working tree was not used as the contract.

This matrix separates implemented functionality, Angular regression coverage and differential evidence.
The [Autocomplete differential suite](../../../apps/parity-testing/primitives/autocomplete/README.md)
now contains **137 scenarios / 411 comparisons** across Chromium, Firefox and WebKit:
14 G1 initial/default, 79 G2 navigation and 44 G3 read-only cases, without skips or exceptions. Other contracts retain their
source/Angular-only evidence below; this increment does not certify full Autocomplete parity.
The pin's [Autocomplete tests][base-tests] and [virtual-navigation tests][base-navigation-tests]
provide concrete reference scenarios for the findings below.

## Reading the matrix

| Status  | Meaning                                                                        |
| ------- | ------------------------------------------------------------------------------ |
| Present | The listed subset exists; evidence describes its actual scope.                 |
| Partial | Infrastructure exists, with a known gap or an unverified part of the contract. |
| Missing | The public capability has no equivalent contract yet.                          |
| Angular | A framework adaptation or an explicitly recorded deviation; see its ADR.       |

Evidence: **S** = pinned-source comparison; **U** = Angular unit regression; **B** = Angular browser
regression; **probe** = a focused audit observation, not a permanent regression or a differential test.
Gap IDs below identify follow-up work. Absence of a test is not itself evidence of a runtime defect.

## Public parts

The pinned [export list][base-parts] has 21 parts and two hooks. Angular maps 20 parts, omits
`Collection`, and adds `Anchor`, `Label` and `ItemIndicator`. The structural-portal misuse guard is
an Angular diagnostic, not another widget part.

| Base UI               | Radix NG                                                                        | Status            | Contract and evidence                                                                                                                                                                                                          |
| --------------------- | ------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Root`                | `RdxAutocompleteRoot`                                                           | Partial           | Shared Combobox engine with `selectionMode='none'`; string value and popup models exist. G1–G7 cover state, navigation, events and data contracts. S, U.                                                                       |
| `Input`               | `RdxAutocompleteInput`                                                          | Partial           | Native input, virtual highlight, four modes, IME/edit handling, Field integration. G2 navigation and G3 read-only covered; query/preview gaps remain G4. S, U, B.                                                              |
| `InputGroup`          | `RdxAutocompleteInputGroup`                                                     | Partial           | State wrapper exists; automatic anchor/inside registration and several state attributes are missing. G8, G9. S.                                                                                                                |
| `Trigger`             | `RdxAutocompleteTrigger`                                                        | Partial           | Native button; outside-input toggle and inside-popup combobox layouts. Local `disabled` input and full state surface are absent. U through shared parts, B for trigger reachability. G9.                                       |
| `Icon`                | `RdxAutocompleteIcon`                                                           | Present           | Shared decorative combobox icon; source audit only for this adapter. S.                                                                                                                                                        |
| `Clear`               | `RdxAutocompleteClear`                                                          | Partial           | Clears and returns focus; differs in reason, read-only disabled state, local props, mounting and transition attributes. G5, G9. S, U.                                                                                          |
| `List`                | `RdxAutocompleteList`                                                           | Partial           | Listbox/grid, ID and Enter handling exist. Read-only listbox ARIA is covered; Collection and `data-empty` remain G7, G9. S, U.                                                                                                 |
| `Status`              | `RdxAutocompleteStatus`                                                         | Present           | Persistent polite, atomic live region through Combobox Status. S; screen-reader announcement behavior is not certified.                                                                                                        |
| `Empty`               | `RdxAutocompleteEmpty`                                                          | Present           | Keeps its status host mounted and conditionally projects the message. Uses registered visible items without requiring Root `items`; adds `data-empty`. S, U.                                                                   |
| `Portal`              | `RdxAutocompletePortal`                                                         | Angular / Partial | Structural `ng-template`, explicit container, flattened roots: ADR 0010. `keepMounted` remains absent: G6. S, U; direct-body relocation has an Angular browser regression in the Combobox spec.                                |
| `Backdrop`            | `RdxAutocompleteBackdrop`                                                       | Partial           | Shared backdrop and registered animation target. No dedicated Autocomplete modal/retention comparison; starting/ending attributes are absent. G9, G10. S.                                                                      |
| `Positioner`          | `RdxAutocompletePositioner`                                                     | Angular / Partial | Inherited Popper API and shared CSS variables: ADR 0012. Anchor policy and widget-state attributes differ: G8, G9. No geometry comparison.                                                                                     |
| `Popup`               | `RdxAutocompletePopup`                                                          | Partial           | Presentation/dialog roles, input focus handoff, dismissal, scroll lock and animation registration exist. Shared focus-manager adoption and Popup focus override inputs are missing. G6, G10, G11. U, B cover ordinary layouts. |
| `Arrow`               | `RdxAutocompleteArrow`                                                          | Present           | Shared Popper arrow adapter. Source-level surface exists; no dedicated geometry comparison. S.                                                                                                                                 |
| `Group`               | `RdxAutocompleteGroup`                                                          | Partial           | DOM groups, visible-item tracking and label context exist. Grouped Root data is a separate missing contract: G7. S; grouped story exists.                                                                                      |
| `GroupLabel`          | `RdxAutocompleteGroupLabel`                                                     | Present           | Shared label registration and group association. S; dedicated Autocomplete dynamic-label comparison is missing.                                                                                                                |
| `Item`                | `RdxAutocompleteItem`                                                           | Partial           | Value/text/disabled/index, option/gridcell roles, click/drag selection and virtual indices exist. Native activation/event dispatch and label precedence need comparison. G5, G7. U.                                            |
| `Row`                 | `RdxAutocompleteRow`                                                            | Present           | DOM row/column grouping, `role=row`, inferred item gridcell role. S, U, B cover LTR examples. RTL is not covered.                                                                                                              |
| `Collection`          | Consumer `@for`                                                                 | Missing           | Explicit Angular loops render examples, but no equivalent grouped/context collection contract exists. G7.                                                                                                                      |
| `Value`               | `RdxAutocompleteValue`                                                          | Partial           | `slotText()` reads committed Root value and adds placeholder behavior. Base UI reads displayed input value, including preview, and accepts a render function. G4. S.                                                           |
| `Separator`           | `RdxAutocompleteSeparator`                                                      | Present           | Shared separator role/orientation; adapter source audited. S.                                                                                                                                                                  |
| `useFilter`           | Core `useFilter`                                                                | Angular           | Same filtering mechanism is reusable from core, rather than re-exported from Autocomplete. Locale behavior has U coverage; ADR 0014 records resolver differences.                                                              |
| `useFilteredItems`    | `root.filteredItems()`                                                          | Partial           | Readonly signal exposes flat results. No exported hook or externally supplied `filteredItems` input; grouped data is absent. G7.                                                                                               |
| No corresponding part | `RdxAutocompleteAnchor`, `RdxAutocompleteLabel`, `RdxAutocompleteItemIndicator` | Angular           | Extra composition adapters. `Anchor` selects a Popper anchor, `Label` uses shared label registration, Indicator reuses Combobox's selection context. These are not missing Base UI parts.                                      |

## Root API and defaults

Defaults below come from the pinned [Autocomplete Root][base-root] and [AriaCombobox][base-engine],
not from the current website. Native input attributes belong on the consumer's input; React refs,
render props and event argument lists do not require identically named Angular inputs.

| Contract                        | Pinned default / shape                                              | Radix NG                                                                                             | Status                                                                                                                                            |
| ------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`, `defaultValue`         | Empty string; controlled value wins; default is initial-only        | `model<string>('')`, optional default                                                                | Pinned G1 initial/default precedence, including empty values; models retain Angular ownership (ADR 0071).                                         |
| `open`, `defaultOpen`           | `false`; explicit controlled `false` wins                           | `model(false)`, `defaultOpen=false`                                                                  | Pinned G1 explicit false/default precedence and initial-only snapshot.                                                                            |
| `mode`                          | `'list'`; `'list'`, `'both'`, `'inline'`, `'none'`                  | Same modes/default                                                                                   | G3 read-only completion is covered; query/preview lifecycle remains G4.                                                                           |
| `openOnInputClick`              | `false`                                                             | `false`                                                                                              | Present, U.                                                                                                                                       |
| `autoHighlight`                 | `false`, `true`, `'always'`                                         | Same values/default; boolean attribute coercion                                                      | G2 compares opening and list boundaries in each mode. Async clearing remains G10.                                                                 |
| `loopFocus`                     | `true`; input-only state participates when auto-highlight is off    | Same policy; false clamps navigation                                                                 | G2 pinned DOM/virtualized and grid boundary comparisons.                                                                                          |
| `keepHighlight`                 | `false`                                                             | `false`                                                                                              | Present for pointer leave, U.                                                                                                                     |
| `highlightItemOnHover`          | `true`                                                              | `true`                                                                                               | Present for pointer movement, U. Native event detail is missing. G5.                                                                              |
| `disabled`                      | `false`                                                             | `false`, CVA state also participates                                                                 | Present mutation guards, U; native disabled interactions need browser comparison.                                                                 |
| `readOnly`                      | `false`; browsing remains possible, edits/inline completion blocked | Same value-lock and browsing policy; discarded completion resumes only on a new editable interaction | G3 compares native read-only browsing/activation, completion invalidation, input/listbox ARIA, grids and form Enter.                              |
| `required`, `name`, `form`      | `false`, optional name/external form                                | Same native form capabilities                                                                        | Present subset, U for FormData, synchronous submit, reset and portalled input. SSR covers initial/default state only; form hydration remains G10. |
| `filter`, `locale`, `limit`     | Locale-aware contains; runtime locale; `-1`                         | Same basic filtering/defaults                                                                        | Partial due to query ownership/normalization. G4. Resolver differences are accepted in ADR 0014.                                                  |
| `items`                         | Optional flat or grouped data                                       | Optional flat `AcceptableValue[]`; DOM registration remains primary outside virtualization           | Partial. G7.                                                                                                                                      |
| `filteredItems`                 | Optional externally filtered flat/grouped input                     | Readonly result signal only                                                                          | Missing input contract. External `@for` + `filter=null` is an alternative composition. G7.                                                        |
| `virtualized`                   | `false`; consumer owns virtualizer                                  | `false`; filtered data index navigation                                                              | Present flat subset, U; actual window/IDREF lifecycle is unverified. G10.                                                                         |
| `grid`                          | `false`                                                             | Same default; RTL rows/columns and native caret behavior                                             | G2 compares both directions, loops/clamps and shorter final rows.                                                                                 |
| `itemToStringValue`             | Optional resolver; object `label` fallback                          | Resolver plus DOM-aware label lookup                                                                 | Partial: mounted-item selection/preview prefers its text over Root resolver; compare labels that intentionally differ. G7.                        |
| `modal`                         | `false`                                                             | `false`                                                                                              | Backdrop/scroll lock exist, but shared focus/isolation policy is not adopted. G11; modal/touch comparison is missing. G10.                        |
| `submitOnItemClick`             | `false`                                                             | `false`                                                                                              | U verifies newly selected text is submitted synchronously. Pointer/Enter/external form browser comparison still missing.                          |
| `inline`                        | `false`; inline list is distinct from completion `mode='inline'`    | No input; inferred behavior through absence of Popup                                                 | Partial: always-open command-palette composition exists, but visibility/dismissal/reset contract is not explicit. G10.                            |
| `actionsRef`                    | `close()`, `unmount()`                                              | Template directive reference exposes `closePopup`/`setOpen`; no public `unmount`                     | Partial framework mapping with a missing operation. G6.                                                                                           |
| `id`, `inputRef`                | Root identity / input reference                                     | Input `id` binding and native/template references                                                    | Angular adaptation; exact popup/list IDREF association still needs comparison, especially with an inside-popup input.                             |
| `onValueChange`, `onOpenChange` | Value/open plus event details                                       | Angular object payloads with cancelable details, plus model outputs                                  | Partial: native event identity and clear reason differ. G5.                                                                                       |
| `onItemHighlighted`             | Value or `undefined`, index/reason/native event details             | `{ value, index, reason }`; `null` when clear                                                        | Partial: payload adaptation is possible, but event metadata is lost. G5.                                                                          |
| `onOpenChangeComplete`          | Boolean after completed lifetime                                    | Boolean output from shared render lifecycle                                                          | Partial: basic implementation exists; manual hold/retention/exact callback trace unverified. G6, G10.                                             |
| Extra `isItemEqualToValue`      | Omitted by Autocomplete's public Root type                          | Function or key comparator                                                                           | Angular extension documented in ADR 0014; not a required Base UI input.                                                                           |
| Positioner defaults             | `sideOffset=0`, `align='center'`                                    | `4`, `'start'`                                                                                       | Recorded Angular defaults, ADR 0012. Bind equal settings in geometry comparisons.                                                                 |

## Behavior and evidence

| Area                                                               | Current evidence                                                                                                                                                                  | Status / remaining boundary                                                                                                                      |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| String value, typing, item press, clearing                         | [Core Autocomplete tests](__tests__/autocomplete.spec.ts), [forms](__tests__/autocomplete-forms.spec.ts): U                                                                       | Present subset; does not prove controlled/default ownership or event equivalence. G1, G5.                                                        |
| Four completion modes and selected suffix                          | [Modes](__tests__/autocomplete-modes.spec.ts): U; inline story: B                                                                                                                 | Present ordinary edit/navigation behavior; G3, G4 cover read-only, controlled preview and Value.                                                 |
| Delete/cut/paste/IME suppression                                   | Modes: U                                                                                                                                                                          | Present edit-driven suppression; real IME, Android predictive input and native browser autofill are unverified. G10.                             |
| Contains/custom/null filtering, locale and limit                   | [Locale](__tests__/autocomplete-locale.spec.ts), [limit/highlight](__tests__/autocomplete-engine-parity.spec.ts), [filter values](__tests__/autocomplete-filter-value.spec.ts): U | Present tested subset; whitespace and external-value query behavior differ. G4. A spec named “parity” is still Angular-only.                     |
| Async results                                                      | [Async story](stories/autocomplete-async.ts): B                                                                                                                                   | Present status/empty-query example; late arrival, stale request, external clear, close/reopen and auto-highlight require pinned scenarios. G10.  |
| DOM reorder and reactive metadata through child components         | [Shared collection test](../combobox/__tests__/ordered-collection.spec.ts): U                                                                                                     | Present after ADR 0086; same native options survive moves and updated disabled/text metadata. No Autocomplete-specific browser reorder case yet. |
| Arrow navigation and input-only loop position                      | [G2 differential scenarios](../../../apps/parity-testing/primitives/autocomplete/tests/navigation.scenarios.ts), core/unit regressions                                            | Pinned opening/boundary/auto-highlight and native keyboard traces.                                                                               |
| Grid rows, disabled highlighting, column clamping                  | [Grid](__tests__/autocomplete-grid.spec.ts): U; G2: differential                                                                                                                  | LTR/RTL rectangular and shorter final rows, closed/open input and native caret comparisons.                                                      |
| Pointer hover/leave                                                | [Hover](__tests__/autocomplete-hover.spec.ts): U                                                                                                                                  | Present flags; native pointer/mouse event identity and open-method transitions need comparison. G5, G10.                                         |
| Click/programmatic click/drag end/right button                     | [Pointer lifecycle](__tests__/autocomplete-pointer.spec.ts): U; G2 keyboard activation                                                                                            | Input Enter/empty Space dispatch the mounted Item click; full event/cancellation ordering and trusted touch/pen remain G5/G10.                   |
| Virtualized filtering/navigation/selection                         | [Virtualized](__tests__/autocomplete-virtualized.spec.ts): U                                                                                                                      | Present flat subset; no real-browser virtual-window, offscreen active ID or grouped-data comparison. G7, G10.                                    |
| Escape, outside press, input containment                           | [Browser behavior](../../../apps/visual-regression/tests/autocomplete.behavior.spec.ts): B                                                                                        | Present ordinary dismissal; InputGroup padding/adornments and nested Escape need separate cases. G8, G10.                                        |
| Trigger reachability and inside-popup focus restoration            | [Popup input](__tests__/autocomplete-popup-input.spec.ts): U; emoji picker: B                                                                                                     | Present mouse/keyboard examples; trusted touch, blur cancellation and consumer focus movement need comparisons.                                  |
| Scroll highlighted item into view                                  | Browser behavior: B                                                                                                                                                               | Present long-list example; scroll reset on query change and virtualized reveal are unverified.                                                   |
| Read-only/disabled mutation guards                                 | [Read-only](__tests__/autocomplete-readonly.spec.ts): U                                                                                                                           | Only Clear/guard subset; does not establish read-only browsing or preview reset. G3.                                                             |
| Roles, selection-free options and label/description wiring         | Core tests and [selection attributes](__tests__/autocomplete-aria-selected.spec.ts): U                                                                                            | Input/list/item relationships exist; read-only ARIA and full part-state surface differ. G3, G9.                                                  |
| Empty/status announcements                                         | Empty and Status source; empty-state U                                                                                                                                            | Persistent polite/atomic regions exist; no assistive-technology announcement certification.                                                      |
| Native forms, CVA and Signal Forms                                 | Forms: U                                                                                                                                                                          | Native FormData/submit/reset plus Angular form integrations exist; native browser validation/autofill need comparisons.                          |
| Portal lifetime, manual hold and interruption                      | Core tests assert retained popup after `preventUnmountOnClose`; shared lifecycle source                                                                                           | Partial: that test does not release the hold or compare completion order. G6.                                                                    |
| Layout-aware focus ownership and Popup `initialFocus`/`finalFocus` | [Popup](src/autocomplete-popup.ts) uses manual focus handoff; ADR 0023 tracks deferred manager adoption                                                                           | Partial: no shared focus-manager/isolation integration or focus override inputs. G11.                                                            |
| SSR/hydration and ID recovery                                      | Shared mechanisms in ADR 0085                                                                                                                                                     | No dedicated Autocomplete SSR/hydration case in the current SSR fixtures. Combobox coverage is not an Autocomplete result. G10.                  |

## State attributes and CSS variables

Sources: the pin's per-part `*DataAttributes.ts`, part state mappings and [Positioner CSS variables][base-css].
React render/className state functions map to Angular bindings on the consumer's host.

| Part           | Present in Angular                                                                                   | Missing or different from the pin                                                                                                                                                            |
| -------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Input          | `data-popup-open`, `data-list-empty`, disabled/required/valid/invalid/touched/dirty/filled/focused   | `data-readonly`, `data-popup-side`; read-only `aria-autocomplete` should be `none`. `data-focused` currently depends on Field, so standalone input focus has no corresponding state. G3, G9. |
| InputGroup     | `data-popup-open`, `data-disabled`, `data-required`, `data-filled`                                   | Pinned pressed/read-only/popup-side/list-empty and Field valid/invalid/touched/dirty/focused states. G9.                                                                                     |
| Trigger        | `data-popup-open`, `data-pressed`, `data-disabled`                                                   | Read-only/popup-side/list-empty and Field required/valid/invalid/touched/dirty/filled/focused states. G9.                                                                                    |
| Clear          | Native disabled and `hidden`                                                                         | Pinned `data-disabled`, `data-visible`, popup/starting/ending state and `keepMounted` surface; read-only currently sets native disabled in Angular. G9.                                      |
| List           | Listbox/grid role, ID, `tabindex=-1`, read-only listbox ARIA                                         | Pinned `data-empty`. G9.                                                                                                                                                                     |
| Item           | `data-highlighted`, `data-disabled`; no `aria-selected` or `data-selected`                           | Selection-free option contract matches the pinned Autocomplete item subset. Extra `data-hidden`/native hidden handles DOM filtering.                                                         |
| Popup          | Open/closed, starting/ending, empty, placement attributes                                            | Names exist; transitions and removal timing are not differentially established. G6, G10.                                                                                                     |
| Positioner     | Side/align/anchor-hidden and shared CSS variables                                                    | Pinned open/closed/empty widget-state attributes are absent. G9.                                                                                                                             |
| Backdrop       | Open/closed                                                                                          | Starting/ending state is absent. G9.                                                                                                                                                         |
| Positioner CSS | `--available-width`, `--available-height`, `--anchor-width`, `--anchor-height`, `--transform-origin` | Names are present via shared Popper. Equal names do not prove equal geometry or anchor choice. G8; compare with equal explicit positioning options.                                          |

## Gaps and comparison backlog

Priorities describe observable behavior and architecture work, not the number of public props.
The findings below are not reviewed entries in an `expected-differences.json` file.

| ID  | Priority / owner                               | Finding and concrete trigger                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Required evidence / follow-up                                                                                                                                                                                                                                                                                                                                                                |
| --- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G1  | Resolved — initial/default precedence          | Explicit `value=""`, `open=false` and initial form writes now win over defaults. One `watch([], ...)` consumes initial defaults, including absence/false, so late updates cannot refill a cleared input or reopen a closed popup. Models and Signal Forms stay intact; ADR 0071 records the narrow input-presence hook.                                                                                                                                                         | 14 pinned cases / 42 comparisons on macOS and Linux; nine initialization/form/reset unit regressions and one SSR markup regression. Accepted parent updates and remounts compare. Frozen one-way controlled requests remain outside this initial-state subset.                                                                                                                               |
| G2  | Covered — navigation policy above the registry | First no-auto arrow opens a list without a highlight. Looping includes the input-only position; non-looping clamps. Each auto-highlight mode, Space/editing/modifiers, disabled activation guards and RTL grid/native caret policies are compared. Registry ownership is preserved.                                                                                                                                                                                             | 79 pinned cases / 237 comparisons plus focused unit regressions. Actual virtual windows, query/preview, read-only and full event metadata remain G3–G5/G10.                                                                                                                                                                                                                                  |
| G3  | Covered — read-only browsing and completion    | Root/Trigger allow opening while value mutations remain guarded. Input exposes `aria-autocomplete="none"`, native/ARIA read-only; only a listbox exposes `aria-readonly`. The shared engine discards a completion until a fresh editable input/keyboard interaction, including after browsing while read-only.                                                                                                                                                                  | 44 pinned cases / 132 comparisons, plus units and axe. DOM/flat virtualized lists, all modes, opening arrows/input/Trigger, pointer handoff, native Enter, RTL grids/caret and preview toggles. G4 query/preview and G5 complete event ordering remain separate.                                                                                                                             |
| G4  | P1 — committed value/query/preview ownership   | Root query is gated by a separate `typed` signal and is not trimmed. Probe with `items`, `open=true`, value `Beta`: query is empty and all three options are visible; replacing the external value with `Gamma` still shows all three. The pin filters from the trimmed supplied input value; its `both` mode keeps the committed query separate from preview. Angular Value reads committed value while the pinned Value reads displayed input value.                          | Compare initial/external values before and after editing, whitespace-only/padded queries, reopen after selection/Escape, controlled preview replacement, pointer hover preserving a pending preview, and Value during completion. Keep one explicit contract for committed text, query and transient preview.                                                                                |
| G5  | P1 — event and native activation contract      | `setQuery`, item commit and Clear do not thread the originating event into `commitValue`; highlight output has no native event. Probe: native InputEvent yields `event.type='autocomplete.value-change'` and a different object. Clear reports `input-clear`, while the pinned Clear uses `clear-press`. Input Enter/empty Space now dispatch the mounted Item click; List Enter still calls Root selection directly. Full activation/cancellation ordering remains unverified. | Compare exact reason/event/trigger/index traces, input/Item/List Enter and empty-input Space, consumer click handlers/default prevention, value/open cancellation, native submit and user focus changes. Angular object payloads can remain; event information and activation semantics must be preserved.                                                                                   |
| G6  | P1 — popup lifetime                            | Portal exposes only container; `keepMounted` is absent. Root accepts `preventUnmountOnClose` but provides no `unmount()` action to release that closed view; its local hold resets on reopening. Existing U only checks that the popup survives a close. The pin tests explicit release, canceled close, repeated release and close+unmount in one batch.                                                                                                                       | Add a public Angular lifetime action through the directive reference, complete retained/automatic/manual close ownership, then compare callbacks, focusability, interruption, Root removal and live child identity. Reuse core's lifecycle rather than adding another machine.                                                                                                               |
| G11 | P1 — shared focus/isolation policy             | [Popup](src/autocomplete-popup.ts) composes Popper/node registration, dismissal and manual input focus; neither Autocomplete nor its shared Combobox Popup configures `RdxFloatingFocusManager`. The pinned [Popup][base-popup] uses the manager with layout-dependent modality and `initialFocus`/`finalFocus` overrides. Angular exposes neither override. Backdrop/scroll lock alone do not supply the manager's isolation and focus ownership.                              | Complete [ADR 0023 WS1](../../../docs/adr/0023-complete-floating-focus-manager-rollout.md) through one shared configuration seam. Compare outside/inside input, modal/typeable behavior, background isolation/markers, custom initial/final focus, focus moved by consumers, nested portals and close interruption. This is already recorded deferred architecture work, not a new decision. |
| G7  | P2 — data/collection and label contract        | No Collection or `filteredItems` input; Root items are flat. Virtualized indices and DOM registration are separate existing paths. Mounted selection/preview reads Item text before the Root string resolver.                                                                                                                                                                                                                                                                   | Compare grouped filtering/limits, externally filtered groups, object labels that differ from DOM text, asynchronous group replacement, and flat virtual windows. Provide an Angular data/templating adapter where necessary; `@for` replaces rendering syntax but not grouped data semantics.                                                                                                |
| G8  | P2 — InputGroup geometry/containment           | [InputGroup](src/autocomplete-input-group.ts) only publishes attributes. The pin registers the group as the default anchor and treats its padding/adornments as inside dismissal. Angular requires an explicit `rdxAutocompleteAnchor` for wrapper positioning, and Root's dismissal reference follows the input.                                                                                                                                                               | Browser comparison with a wider decorated control, clear/trigger/blank padding presses, input inside popup, custom anchor, viewport changes and RTL. Decide/document the explicit-anchor policy independently of inside-element registration.                                                                                                                                                |
| G9  | P2 — per-part styling and local capability     | The attribute table records missing state hooks. Trigger has no exposed local disabled input; Clear lacks the pinned local disabled/keepMounted/motion API and is always instantiated, hidden when empty. The read-only Clear native-disabled policy differs from the pin's guarded but enabled button.                                                                                                                                                                         | Source/API assertions plus browser visibility/focus/exit cases. Retained Clear and Portal must follow G6's lifetime contract. Keep attributes per part; do not introduce a generic state enum.                                                                                                                                                                                               |
| G10 | P2 — comparison and platform coverage          | G1/G2 have a pinned suite and G1 an SSR initial-state check; no dedicated hydration fixture exists. Existing B cases cover ordinary desktop examples; many source-compatible paths have no exact comparison. Inline-list behavior is inferred without a Root `inline` contract.                                                                                                                                                                                                 | Add popup/inline/inside-input layouts, async clear/late arrival, nested overlays, trusted touch/pen, real virtual windows, native forms/autofill/validation and hydration comparisons.                                                                                                                                                                                                       |

G1 initial/default, G2 navigation and G3 read-only rules are covered above. G4–G6 and G11 affect shared state protocols and user-visible behavior. G7–G10 complete data, composition,
public-state and verification contracts. None requires replacing DI registration with queries.
Queries cannot discover items inside another component's template; the
[shared registry decision](../../../docs/adr/0086-shared-element-registry.md) remains applicable.
ADR 0014 explicitly deferred `keepMounted`; it remains a capability gap rather than verified equivalence.

## Recorded Angular adaptations

- [ADR 0014](../../../docs/adr/0014-unify-combobox-autocomplete-engine.md): one shared Combobox engine;
  Autocomplete owns string semantics. Custom filters always receive a defined, DOM-aware text resolver.
  The comparator's key shorthand is an Angular extension. These differences are not exact callback parity.
- [ADR 0010](../../../docs/adr/0010-structural-portal-presence.md): structural Portal relocates template roots
  without a React-style portal wrapper. Native hosts, templates and directive references replace render props/refs.
- [ADR 0012](../../../docs/adr/0012-thin-positioners.md): thin inherited Positioner, shared variables and
  explicit per-family defaults, including the `4`/`start` defaults listed above.
- [ADR 0024](../../../docs/adr/0024-share-label-registration-and-interaction.md): shared label registration
  supports Angular's extra Label part and Field composition.
- [ADR 0086](../../../docs/adr/0086-shared-element-registry.md): registration/order/metadata are shared;
  roving tabindex and aria-activedescendant retain their own navigation policies.
- [ADR 0071](../../../docs/adr/0071-menu-initial-model-defaults.md): initial/default precedence uses
  binding presence and one default snapshot while preserving native models; G1 covers this subset.
- Angular CVA, template-driven forms and Signal Forms adapt to one string value. Their passing tests
  establish the Angular integrations, not Base UI Field/Form equivalence.

## Verification performed for the original audit

```bash
pnpm parity:prepare
pnpm exec vitest run --config packages/primitives/vite.config.ts \
  packages/primitives/autocomplete/__tests__ \
  packages/primitives/combobox/__tests__/ordered-collection.spec.ts
pnpm build-storybook
pnpm exec playwright test -c apps/visual-regression/playwright.floating.config.ts \
  autocomplete.behavior.spec.ts
pnpm agents:check
```

- **95 passing unit tests**: 93 Autocomplete tests across 15 files plus two shared collection tests
  (one Autocomplete, one Combobox). No skips. These are not paired React comparisons.
- **36 passing browser checks**: 12 existing Autocomplete scenarios in each of Chromium, Firefox and
  WebKit. No skips. Storybook was rebuilt before the run.
- Five temporary diagnostic cases reproduced the observations recorded under G1–G5. They were removed
  after the audit; they are not included in the maintained coverage counts. The equivalent reference
  behavior was read from pinned implementation/tests, not executed through a new differential fixture.
- That audit had **zero differential scenarios**. The G1 increment below adds a registered suite
  with no reviewed differential exceptions. Existing Combobox smoke coverage and the new Autocomplete
  initial-state SSR check do not fill the actual hydration gap.

Continue with G4–G5's small state/event traces, then G6's automatic/manual/retained
lifetime matrix and G11's shared focus-manager integration. Add grouped data, real virtual windows and platform compositions after those core
protocols are stable. Record each resolved finding here with its actual scenario/engine evidence.

## G1 initialization increment, 2026-11-17

The pinned suite compares omitted/default/explicit values, empty strings and false booleans,
initially absent and later changed defaults, native Clear/Escape followed by default changes,
accepted external updates, and recreation with fresh defaults. Both fixtures receive actual Root
props/inputs and use native input; no fixture writes private state. Raw DOM, IDs, focus, detailed
reasons/native event metadata and Angular model outputs are retained. G1 compares rendered values,
open/visibility, native FormData and detailed request value/count/cancellation. Full request metadata,
query/preview, geometry and focus ownership remain G2–G11 work.

The first baseline reproduced eight initial/default cases failing only in Angular with passing
reference assertions. Its clearing case also exposed an unrelated typed-empty close policy and was
changed to use the actual Clear part; that initial report is not a clean whole-suite baseline.
The raw report remains in `dist/parity-testing/autocomplete/g1-before/`. Six of seven initial unit
regressions failed before the fix; two subsequent cases cover native reset baseline ownership.

All **42 comparisons** pass on macOS and Linux/arm64 in Playwright 1.60.0 Noble, with two workers and
original timeouts. **254 units** pass across Autocomplete and Combobox (including nine new G1 tests).
The new Autocomplete SSR serialization check and the existing Menu initialization control pass;
library build, scoped lint, generated consumer docs and contributor checks pass. No public model
API is replaced and no comparison exception is added. Reports are retained in
`dist/parity-testing/autocomplete/g1-final/` and `dist/autocomplete-g1-linux/results/`.

Angular `model()` remains locally writable and supplies Signal Forms' value contract. Use two-way
bindings or cancelable requests for application ownership; ignored/delayed/transformed one-way
controlled requests are not certified by G1. Native form reset behavior is Angular unit coverage,
not a paired React form-reset verdict. Full bootstrap/incremental hydration remains separate work.

## G2 navigation increment, 2026-11-17

The 79 native keyboard cases compare initial opening, arrow boundaries and highlight callback
index/count traces for each auto-highlight mode, DOM/flat virtualized lists, disabled item activation,
Space editing/selection, modifiers, Home/End/caret, and LTR/RTL rectangular/ragged grids.
`mode="none"` isolates G4 query/preview behavior. Virtualized cases mount all options; actual virtual
window reveal remains G10. Full highlight value/reason/native event and cancellation equivalence
remains G5, retained as raw measurements rather than certified by index/count comparisons.

The corrected ten-case negative baseline had seven Angular failures and three passing controls;
all reference assertions passed. It is retained in
`dist/parity-testing/autocomplete/g2-before-final/`. Core's input-only-loop unit also failed before
the fix. Existing characterization tests now retain their assertions with pinned opening and boundary
preconditions. Shared engine policies are opt-in for Autocomplete; Combobox's previous defaults remain.

All **279 G1/G2 comparisons** pass on macOS and Linux/arm64 in Chromium, Firefox and WebKit,
Playwright 1.60.0 Noble with two workers, original timeouts, no retries, skips or exceptions.
The reports are `dist/parity-testing/autocomplete/g2-final/` and
`dist/autocomplete-g2-linux/results/`. **269 units** pass across Autocomplete, Combobox and core
highlight, with library build, Angular fixture compilation, scoped lint, consumer generation and
contributor checks. An optional standalone strict React-source type check reports 68 upstream-source
diagnostics and no fixture diagnostics; it is not counted as a passing check.

## G3 read-only increment, 2026-11-17

The 44 cases compare native read-only browsing in all four modes, DOM and flat virtualized lists,
opening by both arrows/input click/Trigger click and keyboard, guarded mutation paths, pointer
handoff after keyboard navigation, Enter with/without a highlight, listbox/grid ARIA, LTR/RTL native
caret behavior and pending completion invalidation. Root preserves one value guard; Trigger delegates
opening to the Root policy. Actual form submission is observed for unhighlighted Enter. Read-only
Clear's native-disabled styling remains G9; inside-popup focus ownership and real virtual windows
remain G11/G10.

Typing setup in preview scenarios is retained as a full measurement, outside the paired checkpoints:
G4 still differs in when a suffix appears. Public `filter=null` isolates G3 from filtered query
ownership. Once settled native typing/navigation establishes the preview, G3 compares the displayed
and committed values, active IDREF/highlight, readonly/ARIA, popup/focus, callback counts and native
keys across the toggle. Completion caret selection and exact value/open callback ordering remain
G4/G5; every complete state/DOM/event trace is retained without exceptions or fixture state repair.
Other read-only cases compare the full navigation snapshot, including selection and request order.

The corrected 44-case baseline failed only Angular (38 assertion failures and six differential-only
failures), with all reference assertions passing; seven new unit regressions failed before the fix.
The report is `dist/parity-testing/autocomplete/g3-before-final/`. Earlier development cases had wrong
preview expectations and tried to focus the outside-input list against the reference focus manager;
those are not a clean negative baseline. The final fixture records G4 setup separately and leaves
inside-popup/List focus ownership to G11.

The final G3 verification passes **411 G1–G3 comparisons on macOS** and **132 new G3 comparisons
on Linux/arm64**, Chromium/Firefox/WebKit, Playwright 1.60.0 Noble, two workers, original timeouts,
zero retries/skips/exceptions. **279 units** pass across Autocomplete, Combobox and core highlight,
including the read-only axe checks. Library build, Angular fixture compilation, test-fixture types,
scoped lint, consumer generation and contributor checks pass. Reports:
`dist/parity-testing/autocomplete/g3-final/` and `dist/autocomplete-g3-linux/results/`.

In the first broad macOS run, WebKit Backspace navigated back from a read-only input on both sides,
so 26 scenarios lost their pages before reporting. The final edit-guard test uses native Delete;
native browser Backspace/history remains unmodified. The original traces are retained in
`dist/parity-testing/autocomplete/g3-platform-before/`. Axe scans the host and portaled popup as
primitive subtrees; application landmarks belong to the host application.

[base-parts]: https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/autocomplete/index.parts.ts
[base-root]: https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/autocomplete/root/AutocompleteRoot.tsx
[base-engine]: https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/combobox/root/AriaCombobox.tsx
[base-css]: https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/combobox/positioner/ComboboxPositionerCssVars.ts
[base-tests]: https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/autocomplete/root/AutocompleteRoot.test.tsx
[base-navigation-tests]: https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/utils/popups/interactions/useListNavigation.test.tsx
[base-popup]: https://github.com/mui/base-ui/blob/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/combobox/popup/ComboboxPopup.tsx
