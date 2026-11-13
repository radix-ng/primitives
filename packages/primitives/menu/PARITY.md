# Menu — Base UI compatibility

Audited 2026-11-13 against Base UI 1.9.0 commit
[`cf696d6f6e08c699c5bda24d5a033430909f2285`](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/menu).
This is incremental behavioral evidence, not complete API or accessibility certification.

| Contract                                                                                           | Evidence                                                 | Status                                                                  |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------- |
| Enter/Space/Up/Down opening and pointer opening                                                    | Pinned suite, three engines                              | Covered; keyboard highlights an item, pointer focuses the popup         |
| Roving focus, disabled focusable items, Home/End, loop/no-loop                                     | Pinned suite                                             | Covered                                                                 |
| Typeahead, repeated prefix and explicit label                                                      | Pinned suite                                             | Covered                                                                 |
| Enter/Space/click selection and closeOnClick=false                                                 | Pinned suite                                             | Covered                                                                 |
| Canceled open/close, checkbox and radio changes                                                    | Pinned suite                                             | Covered                                                                 |
| Modal/non-modal outside press, Tab/Shift+Tab                                                       | Pinned suite                                             | Covered                                                                 |
| Keyboard submenu entry, back/Escape, RTL and whole-chain selection                                 | Pinned suite                                             | Covered                                                                 |
| Generated/custom ARIA identities and changes between opens                                         | Pinned suite                                             | Covered                                                                 |
| Native ID changes while open                                                                       | Angular unit and Storybook regression                    | Additional Angular behavior; pin keys trigger identity by id            |
| Programmatic focus-out and WebKit pointer travel                                                   | Pinned suite                                             | Exact known differences below                                           |
| Deferred/retained exits, CSS completion, cancellation, late holds and reopening                    | Pinned suite                                             | Covered                                                                 |
| Nested CSS exits and child completion                                                              | Pinned suite                                             | Covered with exact nested-exit-completion difference                    |
| Hover grace areas and pointer drag/release                                                         | Pinned suite, three engines                              | Covered; exact WebKit coordinate-travel limits below                    |
| Context Menu and Menubar composition                                                               | Independent pinned suites                                | Initial scope covered; see each family matrix                           |
| Dynamic insertion/removal/reordering, disabled state and labels                                    | Pinned suite                                             | Covered with removed-item-focus limits                                  |
| Empty/refilled lists and removal/replacement of an open submenu owner                              | Pinned suite                                             | Four collection cases covered                                           |
| Whole-root removal, cleanup, final focus and recreation                                            | Pinned suite, three engines                              | Covered; existing Angular destruction lifetimes                         |
| Empty initial opens, delayed items and hovered-child keyboard promotion                            | Pinned suite and public browser examples                 | Covered; exact same-index child-focus limitation below                  |
| Trusted taps, disabled values, cancellation, retained reopening and LTR/RTL submenus               | Pinned suite, Chromium/WebKit                            | Covered within native tap capabilities                                  |
| Native touch cancel/pan and touch-opened small/wide scroll policy                                  | Pinned suite, Chromium CDP; tap/wheel policy also WebKit | Covered within emulator capabilities                                    |
| Mixed mouse/touch/keyboard, retained sessions, submenu toggles/veto and ARIA                       | Pinned suite, Chromium/WebKit and public examples        | Covered; exact native event/focus pairs below                           |
| Native/custom Item, LinkItem and SubTrigger keyboard activation, modifiers and navigation          | Pinned suite, three engines and public example           | Covered for button/div/anchor hosts                                     |
| Initial keyboard focus with disabled first/all/single items, nested and retained lists             | Pinned suite, three engines and public example           | Covered; enabled initial entry, disabled arrow navigation               |
| Forward/backward Tab through fresh/retained submenus and native parent controls                    | Pinned suite, three engines and public example           | Covered; logical portal declaration handoff (ADR 0053)                  |
| Focus-out vetoes and false/element/callback finalFocus across nested portals                       | Pinned suite and Return Focus browser example            | Covered for fresh/retained sessions; ADR 0054                           |
| Projected hostDirectives wrappers, mixed collections, nested ownership and restoration             | Pinned suite and Composition browser example             | Covered; exact hidden-child retained tabindex pair, ADR 0057            |
| Nullable callback finalFocus and removed targets                                                   | Pinned suite and Return Focus browser example            | Covered; exact child outside-close interaction-type pair, ADR 0058      |
| Multiple/detached triggers, payloads, handle actions, controlled identity and animated switching   | Pinned suite and three public examples                   | Covered; shared handle and viewport mechanisms, ADR 0059                |
| Highlight notifications, native input, labels, same-index replacement and nested Roots             | Pinned suite, unit tests and Item Highlight example      | Covered; exact stale text-label and existing host differences, ADR 0060 |
| Controlled/handle reopen during CSS/deferred exits, interrupted viewport switches and Root removal | Pinned suite and Switch During Exit example              | Covered; exact hidden controlled-label association, ADR 0061            |
| Handle ownership during overlapping Root attachment, removal and reassignment                      | Pinned suite, three engines                              | Covered; surviving owners regain control, ADR 0062                      |
| Menu inside modal Dialog: layered dismissal, focus, retained/deferred exits and parent removal     | Pinned suite and Inside Dialog example                   | Covered; descendant backdrop ancestry, ADR 0063                         |
| Dialog opened by Menu item: focus transfer, retained exits, native composition and drag release    | Pinned suite and Open Dialog example                     | Covered; shared focus-scope ownership, ADR 0064                         |
| Menu inside Popover: layered dismissal, modalities, focus, exits and owner removal                 | Pinned suite and Inside Popover example                  | Covered with modal-backdrop limit; per-layer press timing, ADR 0065     |
| Real touch, devices and assistive technology                                                       | Not established by this suite                            | Pending                                                                 |

The [runner](../../../apps/parity-testing/primitives/menu/README.md) defines 345 scenarios and
1035 planned comparisons: 987 execute, with 48 touch capability skips. Ordinary Menu and submenu fixtures use matching native buttons and uncontrolled
state. Checkbox/radio change requests are observed before cancellation; original event types and
trusted pointer coordinates are retained. No adapter forces focus, open state or completion.

Five collection scenarios insert/remove/reorder options and update disabled state or text while
open. Fixtures mutate application data through a native F3 shortcut; Angular uses `signal`/`@for`
and React uses state with stable keys. Highlight stays index-based, independently of DOM focus.
Restoring a surviving moved node does not rewrite that logical index. Both sets keep the primitive
state uncontrolled and record the actual native focus and item order. Four further cases cover
empty/refilled root and child lists, keyed child reordering and removal/replacement of an open
owning branch. The root's empty-list ArrowDown request retains index zero until data returns.
Removing a submenu and its trigger returns focus through the surviving DI owner chain. The common
focus manager ignores a disconnected default anchor; explicit final-focus policies remain authoritative.

## Known differences

- **programmatic-focus-out:** Angular closes when native focus moves to an unrelated input and
  preserves that input's focus. The pin leaves the menu open. Its FloatingFocusManager installs a
  portal capture focusout handler that sets `insideReactTree`; the queued close handler then consumes
  that marker and returns. Do not port this React portal workaround into Angular. Ten exact field
  pairs record this single policy difference at the `outside focused` checkpoint, including DOM,
  highlight and completion consequences. Native Tab/Shift+Tab have separate matching scenarios.
- **zero-delta-pointer-travel:** WebKit reports zero movement deltas for a trusted path whose viewport
  coordinates change. The pin's stateless guard drops that travel, while Angular highlights/focuses
  the target. Menu reuses core `createPointerMoveGuard`, already used by Select, with document capture
  per open menu. Actual stationary scroll events remain ignored. Exact pairs preserve the measured
  focus/highlight consequences through hover travel, press promotion and guarded releases, with
  raw pointer evidence in reports. Linux and macOS have separately reviewed scopes.

- **removed-item-focus:** in Firefox/WebKit the pin can leave focus on body after the focused
  option is removed without a native focusout. Angular observes actual DOM removal and restores the
  current tabbable item, so the next arrow still works. Exact focus/highlight consequences are scoped
  to the measured browsers/platforms; the fixture records the failed native keyboard continuation
  and then selects a surviving item with a real pointer click. It does not force reference focus.
- **nested-exit-completion:** with simultaneous parent/submenu CSS exits, Angular emits close
  completion for both roots. The pin omits the submenu's close completion when the parent removes
  its owning subtree and cleanup aborts the child's animation callback. Angular derives ancestor
  presence from actual child closing phases so the child can finish before its owning view is
  destroyed. One exact completion pair records this limitation; ordinary non-animated chain
  selection has matching callbacks. See [ADR 0035](../../../docs/adr/0035-menu-shared-close-lifecycle.md).

- **native-hover-events:** hybrid checkpoints retain native Pointer Events entry versus the pin's
  mouse movement entry, and safe-polygon movement versus mouse leave on canceled promotion.
  Exact source-event pairs remain scoped to checkpoint/engine. Keyboard activation now shares the
  actual click path; the ten old native-keyboard-events pairs have been removed after review.
  See [ADR 0051](../../../docs/adr/0051-menu-native-host-activation.md).

Exceptions are exact and fail if changed or disappeared. They do not establish complete parity.

The nullable-target audit also records **parent-close-interaction-type**: on an outside press that
closes both levels, the pin's child callback receives an empty close type while Angular preserves
mouse from the original native event. Only the exact callback tables differ; see ADR 0058 below.

## Migration

Arrow navigation opens/closes with `list-navigation`; item actions close with `item-press`.
Checkbox UI changes and radio UI changes also report `item-press` and retain the original native
event. Programmatic `RadioGroup.selectValue(value)` without an event retains `none`.
Selection closes ancestors before descendants, matching the pin's callback order.

Trigger, SubTrigger and Popup expose native `id` inputs with generated defaults. The owning Root
derives ARIA links from their reactive identity getters. A canceled Escape keeps item focus; Tab is
owned by native portal guards. Do not close synchronously in a keydown handler before Tab runs.
Roving tabindex is captured after Angular host bindings render, not before native buttons receive
their authored tabindex. See [ADR 0034](../../../docs/adr/0034-menu-differential-contracts.md).

Root now composes core `usePopupLifecycle`, already used by Select and Popover. Portal registers
actual Presence views, and Root exposes `unmount()` to finish a pending external exit. `close()`
defaults to `imperative-action`. Deferred completion waits for that action; repeated/stale actions
do not complete another close. Retained portals hide and stop tracking after completion. Context
Menu exposes the same actions through its composed Menu. Start external animations in
`onOpenChange`, not in the completion callback.

Positioner preserves its last placement during exit; a resource refresh must not reapply the
initial-placement animation guard. The animated story keeps Popup displayed for its actual CSS
exit and uses shared Tailwind utilities. Pending exits block pointer interaction without native
inert; native focus may remain in the popup. Closed items clear highlight and settled retained
popups remove their active ARIA label association. The suite compares retained checkbox state,
natural CSS timing, late/canceled holds and interrupted exits without forcing completion.

Hover opens with popup focus and no item highlight; a click promotes it to `trigger-press` without
closing or restarting the lifecycle. A press before the hover delay cancels that timer. Hover close
reports `trigger-hover` and its native mouse event, without returning trigger focus. Disabled items
can receive hover focus but cannot activate. Child Roots register through Angular DI; hovering a
parent item closes other branches through that existing registry. No DOM-wide query registry or
React interaction store is added.

The suite crosses root gaps and diagonal submenu grace polygons in LTR/RTL, checks canceled hover
and re-entry, then uses real down/move/up events for enabled, disabled, stay-open, checkbox and radio
commands. The 200ms release guard is observed without fake clocks. WebKit reports zero deltas while
trusted viewport coordinates change; exact focus/highlight pairs retain our coordinate guard. Native click-focus is normalized by explicit tabindex on button triggers (ADR 0059).
An Angular browser regression also repeats RTL diagonal travel with fractional popup sizes measured
in a Linux CI failure. The safe polygon uses a one CSS-pixel buffer so integer MouseEvent coordinates
do not fall through the fractional entry edge before native hit testing reaches the child.

Next: remaining API/lifecycle combinations and deeper composition in the independent
[Context Menu](../context-menu/PARITY.md) and [Menubar](../menubar/PARITY.md) suites.
Device/assistive-technology work remains open. See [ADR 0038](../../../docs/adr/0038-menu-collection-boundaries.md).

## Whole-root removal

The shared removal block compares conditional destruction of the entire Root, with open submenus,
retained views, paused CSS exits, a deferred close and a pending hover. Explicit final-focus targets
are tested both connected and removed with the Root. Cleanup restores background interaction, native
scrolling and document styles; no isolation attributes, guards or internal backdrops remain. Native
keyboard input works without a Root. Recreating the Root and advancing old timer deadlines does not
revive an old child or complete an abandoned close.

Angular uses its existing embedded-view and DestroyRef lifetimes. Destruction is not an invented
close transaction: callbacks, completion arrays and focus are observed against the pin unchanged.
Resource comparisons cover actual background hiding/hit testing and scroll blocking; raw framework
attributes/guard counts are recorded as measurements. See [ADR 0046](../../../docs/adr/0046-menu-root-removal.md).

Ten whole-root removal scenarios are included in this family.

The late-hold regression exposed a shared Presence animation callback racing its render effect.
Completion now adopts the actual presence before unmounting, preserving checkbox state and native
focus. Disposal invalidates queued animation promises. The test holds real CSS before F10 and
finishes through WAAPI, preserving actual lifecycle callbacks.

## Empty keyboard requests and async items

Fourteen new cases compare empty Enter/Space/Up/Down opening, pointer opening, pending forward/backward
requests, delayed root/child data, hover promotion, LTR/RTL, retained reopening and close-before-refill.
An arrow from Popup enters the first/last item rather than incrementing a highlight whose item never
received focus. Forward navigation in an empty open child retains logical index zero on the existing
Root signal. Enter promotion reuses the cancelable trigger-press transaction.

Newly mounted keyboard submenus hand off through the existing Floating Focus Manager's position-ready
Angular scope activation. Its keyboard-only policy runs after modal ancestors have been paused; later
data does not restart initial focus. The two ten-frame retry loops are removed.
Closed ancestors resolve the return target; hidden retained references defer to the composing owner's
fallback. Explicit final focus and deliberate moved focus retain their existing precedence.

The `empty-submenu-keyboard-focus` limitation is exact: after a hovered empty child receives a forward
request and late items arrive, the pin highlights its first item but leaves focus on the trigger.
Repeating that arrow does not re-run focus because its logical index is unchanged. Angular's explicit
request enters the child. Focus and resulting parent-highlight pairs are scoped to each browser for
LTR/RTL at `entered populated submenu`. The reference remains unmodified, then both fixtures finish
with a real pointer selection. Changed/disappeared pairs fail.

Public Async Items / Async Submenu examples use Angular resource with actual Root.open parameters
and abortable application loading. Browser checks verify pending-index continuation, no late focus
steal, cancellation/retry, no stale retained items and top-level focus return after chain selection.
See [ADR 0048](../../../docs/adr/0048-menu-empty-keyboard-requests.md).

## Trusted touch

Twenty-five trusted-touch cases compare actual taps and Chromium cancel/pan gestures. Callback
source types/trust, pressed/open state, native focus, values and scrolling remain observed. Root
resolves a compatibility mousedown through its trigger's pointer history while preserving the
original event. Touch SubTrigger opens on that mousedown and consumes the ensuing click once;
repeat activation closes it. Disabled items prevent pointer focus but remain keyboard-focusable.
Trigger data-pressed follows open state; use native :active for physical press feedback.

Firefox touch contexts and WebKit CDP gestures are unsupported by the runner, so their 31 planned
comparisons are explicit capability skips. The 44 executable touch comparisons pass on macOS and
Linux. This evidence does not certify real devices, mobile browser UI or assistive technology.
See [ADR 0049](../../../docs/adr/0049-menu-trusted-touch.md).

## Mixed input

Seventeen scenarios add 34 executable comparisons for input changes within an open menu and across
successive/retained sessions. The first tap promotes an arrow-opened child; the next toggles it.
Enter/Space toggles a touch-opened child. Arrow entry preserves the opening ARIA policy; a canceled
touch promotion preserves the keyboard session. Original events and the full input timeline remain
observable, with exact source-event adaptations documented above.

Hover promotion retains the session's original scroll policy. A fresh touch opening starts a new
small/wide policy. Placement settles before the wheel probe on both the first and subsequent open.
The new cases pass in Chromium/WebKit on macOS and Linux; unsupported Firefox touch contexts are
capability skips. Further API/lifecycle audits remain open; projected wrappers are covered by ADR 0057 below.

## Native host activation

Twenty-three scenarios compare actual button/div/anchor hosts, consumer click handlers, modifier
payloads, navigation, native form button types, disabled activation, typeahead Space and retained reopening. One Menu-local
keyboard helper serves Item, LinkItem, CheckboxItem, RadioItem and SubTrigger, using native Enter
where available and core dispatchClickWithModifiers for composite Space/custom-host Enter.
Keyup prevents duplicate Space activation. Arrow navigation remains its own keyboard contract.

Selection/value/press details now contain the activation click. Closing clears Popup's query/timer
for a fresh retained session. Native Elements demonstrates ordinary Angular click handlers. The
old keyboard source-event differences now match the pin and have been removed; hover/focus pairs
remain. See [ADR 0051](../../../docs/adr/0051-menu-native-host-activation.md).

Disabled activation is compared after pointer opening and native arrow entry. Initial keyboard focus is compared separately in the following boundary suite.

## Initial focus boundaries

Thirteen cases add 39 comparisons for native Enter/Space/Up/Down, pointer opens, disabled-first
button/div/anchor hosts, single/all-disabled lists and nested/retained reopening. Initial keyboard
entry chooses an enabled item; an all-disabled root focuses Popup without highlight. Once open,
arrows and Home/End still include disabled items, whose activation remains prevented.

The initial selector is shared by Popup scope activation and trigger recovery. SubTrigger keeps its
Tab entry while its child is open. Focus bridge disposal restores suspended attributes before the
owning Angular view applies closed-state tabindex bindings, so retained reopening has one authored
Tab stop. Setup still waits for rendered queries/bindings. No exception pairs were added.

Initial Focus demonstrates the contract. Native root Tab departure is checked. Nested departure
was subsequently covered by ADR 0053 below. See
[ADR 0052](../../../docs/adr/0052-menu-initial-focus-boundaries.md) for the initial-focus scope.

## Nested portal Tab departure

The shared Floating Focus Manager uses the structural portal's ViewContainerRef declaration anchor
for non-modal outside guards. Tab follows the logical template order across body-sibling portals;
Shift+Tab returns to SubTrigger. An intervening input in the parent keeps that parent open while
closing the child. Fresh and retained reopening compare native focus, highlight, Tab stops, close
request order/reasons and trigger identity. The public Initial Focus example includes the nested path.

Six new cases add 18 comparisons, plus forward departure in the existing retained-submenu case.
One exact nested-exit-completion pair records the pin dropping a fresh child's close completion;
Angular preserves its existing embedded-view lifecycle. Other fields and the retained/backward
paths match. Cancellation/finalFocus were subsequently covered by ADR 0054 below; projected wrappers were subsequently covered by ADR 0057 below.
See [ADR 0053](../../../docs/adr/0053-menu-portal-tab-handoff.md).

## Focus-out vetoes and explicit return policies

Eighteen cases / 54 comparisons cover parent/child/both focus-out cancellation, false/element/callback
finalFocus and repeated fresh/retained sessions. Forward Tab preserves its portal destination even
with an explicit target. Shift+Tab is an explicit cancelable return: a veto preserves current item
focus. Escape honors false, and a callback receives keyboard once per accepted close. Returning to
an open SubTrigger hands child highlight back to its parent. Suspended closed items keep tabindex=-1.

The Return Focus public example exposes both levels' policies and vetoes. All new cases pass on
macOS/Linux in three engines without new exceptions/skips. Nullable callbacks and removed targets
are covered by ADR 0058 below; projected wrappers are covered by ADR 0057 below. See
[ADR 0054](../../../docs/adr/0054-menu-focus-out-and-final-focus.md).

## Projected Angular wrappers

Thirteen cases / 39 comparisons cover regular, link, checkbox, radio and SubTrigger wrappers, mixed
internal/projected Popup content, explicit labels, reorder/insertion, LTR/RTL children, retained
reopening, a focus-out veto and an explicit final-focus target. Root publishes its Popup collection
and restoration state through the existing Composite owner bridge; its floating node preserves
ancestry through projection. Sibling discovery uses the registered collection rather than selector
attributes. The public Composition example checks native keyboard, disabled items, nested Escape,
selection and repeat opening without interaction-time errors.

One exact exception keeps Angular's closed retained child at tabindex=-1 when the pin restores a saved
0 on second parent entry. The child is hidden and cannot receive native Tab. Visible focus and actions
match; raw document portal ordering is attached separately from each popup's item order. See
[ADR 0057](../../../docs/adr/0057-menu-projected-composition.md). Remaining focus-target callbacks and
API/lifecycle combinations are not covered by this increment.

## Nullable callbacks and removed return targets

Twenty-four cases / 72 comparisons distinguish callbacks returning null (explicit default target)
from undefined (no unmount return), including outside clicks, native Tab/Shift+Tab and fresh/retained
sessions. A detached explicit element remains a native no-op; a live query returning null selects
the surviving Menu owner. Application data removes the target before close or in onOpenChange,
then recreates it for another session. No fixture moves focus or repairs primitive state.

The shared Focus Manager passes an explicit default request to Focus Scope without evaluating the
callback twice. Automatic true remains guarded, and a completed forward Tab still takes precedence.
The Return Focus example demonstrates both callback policies and displays their interaction type.

Exact finalFocusCalls pairs retain mouse for Angular's trusted outside press and an empty string
from the pin's child callback when the parent closes the chain. The native event is preserved; no
React interaction bookkeeping is added. Focus, invocation counts and lifecycle checkpoints match.
See [ADR 0058](../../../docs/adr/0058-menu-nullable-final-focus.md). Remaining API/lifecycle combinations
and device/assistive-technology verification remain open.

## Multiple triggers, handles and animated switching

Eighteen cases / 54 comparisons cover inline and detached triggers, live typed payloads, default and
externally controlled opening, canceled opens/switches/closes, disabled activation, imperative
actions, removed triggers, Root recreation, retained reopening and viewport transitions. Root keeps
its actual active native trigger; only that trigger is expanded and controls the popup. Switching
an open menu keeps trigger focus and resets item highlight. Removing the trigger retains payload.

`createRdxMenuHandle<Payload>()` connects external declaring trees. An explicit unattached handle is
authoritative and never falls back to an unrelated ambient Menu. Root uses Angular models for open
and trigger identity; the handle exposes a signal isOpen and imperative open/close. Detached triggers
reconnect to a recreated owner. Shared registration lifetimes also serve Popover and Dialog.

Menu and Popover share visual-snapshot viewport handling. One direct content wrapper remains live;
the outgoing snapshot is inert, aria-hidden and has ids removed. Size variables reach Popup and its
Positioner. Data-activation-direction is compared as a CSS space-separated token list, with raw
spelling recorded per checkpoint. The held CSS comparison finishes actual animations through WAAPI.

Native button triggers receive an explicit tabindex=0 only when the consumer supplied none; a
Composite coordinator still owns roving tabindex. Safari can then focus the pressed trigger and
continue keyboard navigation. Fourteen previously recorded native-button-focus pairs disappeared
and were removed after review. One remaining hover focus consequence is classified with the
existing zero-delta pointer-travel policy rather than native-button focus.

Programmatic return focus prefers a surviving pre-open control and falls back to the connected owner
reference when that control was body/removed. The existing Focus Scope queue owns timing; Menubar's
coordinated return policy remains intact. Public Multiple Triggers / Controlled Triggers / Animated
Triggers examples use our semantic Tailwind styles and the Base UI moving-popup anatomy.

This is not a complete API certification: further controlled/lifecycle/handle composition
combinations, real devices and assistive technology remain separate audits. Highlight notifications
are covered by ADR 0060 below. See
[ADR 0059](../../../docs/adr/0059-menu-multiple-triggers-and-viewport.md).

## Highlight notifications

Thirteen cases / 39 comparisons cover arrows, typeahead, explicit labels, disabled hover, leave,
insertion/replacement/reorder, label updates, retained reopening and LTR/RTL submenu ownership.
`onItemHighlighted` emits one Angular event object with item, label, reason and the source event.
Signals and `afterRenderEffect` observe the settled Composite registration; no intermediate neighbour
is reported while a new item is registering. No-op focus/index writes do not duplicate notifications
or leave keyboard/pointer provenance on a later data-driven change. Late subscribers receive future
changes without replaying the current item.

Each Root's callback sequence is compared independently. Cross-Root callback ordering and raw native
event types remain attached to reports; MouseEvent and PointerEvent are both valid pointer sources.
Source-event identity is checked against actual document-capture events. Automatic changes use a
generic Event; the implementation-specific fallback event type is recorded in the attachment.

One new exact **stale-highlight-text-label** difference records the pin retaining an old fallback
text label after the item's text changes. Angular reads the current text on the next highlight;
explicit label updates agree. Existing **zero-delta-pointer-travel** and **removed-item-focus**
policies also apply to these cases. Their exact browser/platform scopes remain fail-on-change.
See [ADR 0060](../../../docs/adr/0060-menu-highlight-notifications.md).

## Interrupted exits and trigger sessions

Twelve cases / 36 comparisons combine CSS/deferred exits with multiple triggers, externally bound
open state and handle actions. They cover fresh/retained portals, payload updates and trigger removal
while closing, repeated content switches, close during a switch, and Root destruction/recreation.
Paused real CSS holds the intermediate states; WAAPI finishes actual animations. An interrupted
close emits no false completion, and old hold/unmount calls while open do not close the new session.

Escape delegates return-focus timing to the existing Focus Scope, after the accepted exit. Menubar
retains its synchronous coordinator handoff. A programmatic reopening of a still-mounted Popup can
otherwise reuse an old pre-open target. Menu passes its existing native focus snapshot to the Focus
Manager's guarded default resolver; connectivity is checked when returning, after DOM disposal.
Explicit finalFocus and deliberate moved focus retain precedence. Retained and removed Popup nodes
have different native lifetimes, matching the reference's observed targets.

The shared Menu/Popover viewport follows actual presence/closing state, preserving outgoing inert
content through the popup exit. Transition completion, interruption and destruction still clean up
the snapshot through the existing helper. Popover has an independent deferred-exit unit regression.

One exact **controlled-retained-label** pair records the settled hidden Popup: the pin preserves
aria-labelledby when triggerId is controlled, while Angular follows its existing policy of removing
that association after close completion. The Popup is hidden and absent from the accessibility tree;
visible associations, focus and completion agree. No React controlled-prop ownership detection is
added to Angular's models. See [ADR 0061](../../../docs/adr/0061-menu-interrupted-trigger-exits.md).

## Overlapping handle owners

Six cases / 18 comparisons cover the temporary overlap of independently mounted Roots using one
handle. The latest attachment owns detached triggers, imperative actions and isOpen. Removing an
inactive Root leaves the current owner connected; removing or reassigning the current Root restores
the latest surviving owner. Trigger replacement under the same id, current payloads, complete
detachment/recreation and an already-open previous owner are compared without new exceptions.

The shared registry keeps context registrations in attachment order and reconnects existing native
triggers only when the active owner changes. Cleanup belongs to its exact registration. Angular's
signals remain the reactive boundary; no fallback React store or subscription layer is needed.
Menu resolves its popup label through the current native trigger or the accepted trigger id, so a
still-open previous owner keeps its name while the trigger is connected elsewhere. Root open state
is independent: the handle neither broadcasts actions nor closes the previous owner automatically.
Use one mounted Root per handle in normal application composition. See
[ADR 0062](../../../docs/adr/0062-menu-overlapping-handle-owners.md).

## Menu inside Dialog

Eighteen cases / 54 comparisons exercise Menu and submenu inside a modal Dialog with matching
portal structure. They compare Escape order, item selection, Tab/Shift+Tab, modal/non-modal Menu
outside presses, close vetoes, retained/deferred exits, parent closure, and parent destruction during
open/CSS/deferred states. Parent recreation proves that no old focus trap or isolation survives.
Dialog changes and completions are recorded separately from each Menu Root; all snapshots include
native focus and Dialog/Menu visibility and inert state. No new expected differences are added.

A modal Menu's backdrop is outside its own popup but belongs to its ancestor Dialog. Dismissal now
uses the existing descendant floatingElements footprint when recording press-start containment.
When Menu closes on pointerdown and removes that backdrop, the trailing click does not also dismiss
Dialog. The next outside gesture remains eligible. Own-layer backdrops still dismiss their owner;
no React synthetic-event flags, global gesture store or additional public API is introduced.

The public Inside Dialog example includes a submenu, keepMounted and deferred completion. Browser
checks cover fresh/retained layer-by-layer dismissal, focus return and explicit completion. Shared
dismissal consumers receive focused regression checks. See
[ADR 0063](../../../docs/adr/0063-menu-dialog-layered-dismissal.md).

## Dialog opened by a Menu item

Eighteen cases / 54 comparisons exercise selection opening an independent controlled Dialog or a
Dialog handle trigger on the same native item. They include Enter/Space/pointer selection, trusted
press-drag-release, submenu selection, retained portals and CSS/deferred completion. A second
composition keeps Menu open through closeOnClick=false with a nested Dialog; Tab/Shift+Tab,
pointer departure, close veto and canceled Dialog opening are compared without new exceptions.

Shared Focus Scope uses existing focusability checks for default return candidates and history.
A connected but hidden retained item is skipped, so the surviving opener can receive focus.
Focus-out stands down while its scope is paused. Dismissal yields a paused scope's unrelated Escape
while preserving logical descendant bubbling. No per-Menu focus history or React open counter is
introduced. Angular keeps native inert isolation; comparisons observe actual inert/aria-hidden
isolation, with raw attributes and ancestor locations attached per checkpoint as measurements.

The Open Dialog example composes rdxMenuItem and rdxDialogTrigger, with Dialog Root outside the Menu
portal and optional retained/deferred exit. Browser checks prove focus remains in Dialog during Menu
completion and returns after Dialog closes. menuImports is exported for standalone composition.
See [ADR 0064](../../../docs/adr/0064-menu-item-dialog-focus-transfer.md).

## Menu inside Popover

Twenty-four cases / 72 comparisons cover non-modal, modal and trap-focus Popover hosts, modal and
non-modal Menus, Escape order, selection, native Tab/Shift+Tab, inside/outside presses, vetoes,
retained/deferred exits and parent closure/removal during an open or CSS/deferred state. Destroyed
parents are recreated through application state. Host callbacks are separate from Menu callbacks;
focus, live ARIA, isolation, visibility and completion arrays are observed without new exceptions.

Trap-focus Popover's sloppy pointerdown closes both surfaces when pressed outside both; Dialog's intentional
click retains its one-layer behavior. Descendant backdrop ownership is used for press-start capture
and third-party filtering, while the actual outside surface still follows each layer's policy.
Owned child backdrops created after a marker pass remain eligible, unlike injected third-party DOM.

Popover now uses intentional mouse clicks in ordinary/modal mode and sloppy pointerdown in
trap-focus mode, following the pin. A fast click can still remove Menu before its close effect runs.
Its ngOnDestroy finishes an accepted ordinary close before Angular disconnects outputs, only when
a closed floating ancestor removes the owner. Open Roots, vetoes, manual holds and interrupted CSS
exits remain incomplete. Presence/transition helpers expose their existing pending phase for the
shared lifecycle guard; cleanup still uses DestroyRef. The Inside Popover example covers nested
keyboard focus, selection, outside dismissal and explicit completion. Outside-both comparisons use
non-modal Menu with ordinary/modal Popover. With modal Menu, the pin's React capture marker and removed backdrop make
parent dismissal unstable; equivalence for that combination is not claimed. Angular browser checks
cover its own deterministic modal Menu behavior.
See [ADR 0065](../../../docs/adr/0065-menu-popover-composition.md).

Popover opened by a Menu item and real device/AT verification remain separate audits. Menu host
integration evidence does not certify independent Popover or Dialog API/behavior parity.
