# ADR 0051: Activate Menu through native host clicks

- Status: Accepted
- Date: 2026-11-12
- Decision owners: Radix NG maintainers
- Related: ADR 0049, ADR 0050, `menu`, Context Menu, Menubar

## Context

Item keyboard handlers emitted selection directly, so an application's native click listener did
not run for keyboard activation. Enter on an anchor used as Item did not navigate. LinkItem called
element.click(), losing keyboard modifiers. Angular's keydown.enter/keydown.space bindings also
filter modified key combinations, so custom-host Ctrl/Meta/Shift/Alt activation could be missed.

Host comparisons exposed these observable problems beyond the source-event differences in ADR 0050.
They also showed that retained Popup kept its previous typeahead query across a close/reopen.

## Decision

Use one Menu-local keyboard helper for Item, LinkItem, CheckboxItem, RadioItem and SubTrigger. Read
generic keydown/keyup events so modifiers are preserved. Enter on an actual button or anchor with
href delegates activation to the browser. Composite Space and Enter on a non-native host dispatch
one click through core's existing dispatchClickWithModifiers. Native button Space keyup prevents a
second activation. Native Item/CheckboxItem/RadioItem buttons default to type=button when their
constructor sees no explicit type; an application's explicit submit/reset type is preserved. This
prevents accidental form submission while allowing intentional native submission. This is actual DOM activation needed by a custom host, not event-shape rewriting.

Existing click handlers own selection, value transactions and submenu press policy. Native listeners
and onSelect now share that activation. Public change details retain the actual click, including
trust and modifiers; arrow navigation retains its original KeyboardEvent. Disabled click handlers
prevent native navigation while their items remain available to keyboard focus.

Popup continues to own its typeahead string/timer. Its existing Root registration supplies a typing
getter to items (and to SubTrigger through its parent Root), following the existing ID getter seam.
No duplicate query store is introduced. Space during a search bubbles to Popup instead of selecting
an item. Closing clears the query and timer even when Popup stays mounted.

## Evidence

Twenty-three host scenarios / 69 comparisons cover button/div/anchor Item hosts, LinkItem, custom
SubTrigger, Enter/Space, native click counts, modifier payloads, actual fragment navigation, default/explicit form button types, disabled
activation, typeahead Space and retained reopening. Frameworks retain uncontrolled state. A fixture
application guard cancels modified link navigation to avoid opening extra tabs; original click
metadata is recorded before that guard. Disabled targets are reached with real arrows after a
pointer open. No fixture forces focus or rewrites source events.

These cases pass in Chromium, Firefox and WebKit on macOS and Linux. Menu now defines 162 scenarios /
486 planned comparisons: 438 executable, 48 existing touch capability skips. The prior ten exact
native-keyboard-events pairs disappear because the actual click path now matches the pin. Reviewed
native-hover-events and macOS native-button-focus pairs remain unchanged.

The public Native Elements example uses normal Angular click handlers on button/div/link hosts.
Browser checks verify a single activation, actual link navigation, modifiers, typeahead, and the
existing touch-to-keyboard submenu cases. Checkbox/radio comparisons also verify one Space click
through keyup. Selected Menu, Context Menu and Menubar unit/composition checks guard shared behavior.
Unit tests use browser-style activation; the submenu focus unit supplies a native keyboard-click
shape because user-event in this jsdom harness assigns the literal string "undefined" to pointerType.
Real-browser tests continue to send actual Enter/Space input.

## Migration and limits

Keyboard selection/value/press change details now contain the activation click rather than the old
keydown. Enter on a native host is browser-generated; composite Space/custom-host clicks preserve
modifiers and have isTrusted=false. Inspect the original event accordingly. Reasons and
cancelable transactions retain their existing contract.

Initial keyboard focus when the first item is disabled needs a separate focus-boundary comparison:
the pinned fixture did not reach that first disabled button through the initial keyboard entry.
The host suite certifies disabled activation after pointer opening and keyboard entry, not that
initial-focus boundary. Interactive form controls nested inside a menuitem are also outside this
host contract. Further lifecycle/API combinations and real-device/AT audits remain open.

## Base UI References

Base UI 1.9.0, commit `cf696d6f6e08c699c5bda24d5a033430909f2285`:

- `packages/react/src/menu/item/useMenuItem.ts`
- `packages/react/src/menu/item/useMenuItemCommonProps.ts`
- `packages/react/src/menu/link-item/MenuLinkItem.tsx`
- `packages/react/src/menu/submenu-trigger/MenuSubmenuTrigger.tsx`
- `packages/react/src/internals/use-button/useButton.ts`
