# ADR 0060: Report Menu highlights from Angular's rendered collection

- Status: Accepted
- Date: 2026-11-13
- Decision owners: Radix NG maintainers
- Related: ADR 0034, ADR 0038, ADR 0057, ADR 0059; `menu`, `composite`

## Context

Base UI Menu exposes onItemHighlighted with the native item, label, input reason and original event.
Menu already owns an activeIndex signal and a reactive Composite collection, but exposes no output
for consumers to preview a command. Watching only the index misses replacement at an unchanged
index and can attach an old keyboard event to a later application-data update.

## Decision

Expose an Angular `output<RdxMenuItemHighlightedEvent>()` on each Root. Its single event object
contains item, label, reason (`keyboard`, `pointer`, `none`) and event. Item is undefined after
clearing; explicit label takes precedence over current trimmed text. Automatic changes carry a
generic Event, as they do in the reference; its internal type string is not a native input contract.

Navigation and item hover/leave pass their original DOM event through the existing setActiveIndex
operation. The subsequent native focus event does not overwrite a no-op index write. A write back
before rendering discards pending provenance. Ordinary focus uses none. Each Root owns its own
notifications; changing a label alone does not emit and adding a subscriber does not replay state.

Observe open, index and Composite registration through afterRenderEffect. Deduplicate by both index
and native element. Composite items register after their first render; defer a candidate while the
new DOM item at that index is awaiting registration, rather than reporting its temporary neighbour.
Existing Angular rendering, DI ownership and registration cleanup own this lifetime. No animation
frame retry, extra event listener, copied item collection or React subscription store is needed.

The mechanism stays Menu-local: Combobox's existing output reports selected values and a different
event shape. Their contracts do not yet justify a shared notification engine. Context Menu and
Menubar inherit Menu parts and are checked as consumers.

## Evidence and limits

Thirteen differential cases compare keyboard/typeahead, disabled hover and leave, explicit/fallback
labels, insert/replacement/reorder, retained reopen and LTR/RTL children. Native event identity is
checked against document capture. Compare complete callback sequences per Root; attach the original
cross-Root order and source types separately. Angular and React schedule independent Roots in
different orders, which does not change an individual Root's output contract. MouseEvent and
PointerEvent are both permitted pointer-event sources, so that category is compared together;
the raw types and trust flags remain visible.

The pin caches a fallback text label after registration. Updating text alone leaves the old label
in its later callback, while Angular returns current text. Retain current text rather than copying
the stale cache; one exact stale-highlight-text-label exception records it. Explicit label updates
match. Existing zero-delta-pointer-travel and removed-item-focus policies retain exact observations
for the new cases. Local browser runs use macOS; Linux expectations extend those previously
established host policies and remain checked by CI.

Unit tests check original-event identity, duplicate suppression, same-index replacement, current
labels, all four ordinary item parts and late subscribers. The public Item Highlight example and
its browser regression show keyboard, typeahead, disabled hover and clearing with semantic Tailwind
utilities. Context Menu forwards the output through its existing hostDirectives composition; a
dedicated unit test checks the public template binding and original keyboard event.

Further controlled/lifecycle/handle combinations and device/assistive-technology audits remain open.

## Reference

Pinned Base UI 1.9.0 cf696d6f6e08c699c5bda24d5a033430909f2285 and the local Base UI checkout:

- packages/react/src/menu/root/MenuRoot.tsx
- packages/react/src/menu/root/MenuRoot.test.tsx (`prop: onItemHighlighted`)
- packages/react/src/menu/store/MenuStore.ts (`setActiveIndex`)
- packages/react/src/internals/createBaseUIEventDetails.ts
