# 0038 — Menu collection boundaries and Menubar navigation

Status: Accepted

Date: 2026-11-10

## Context

The Base UI 1.9.0 suites covered ordinary collection updates but left empty lists, removed submenu
owners, current-trigger disabling and backward/single-menu switching unmeasured. These cases can
strand focus even when the final open state appears correct.

## Decision

Extend Menu to 73 scenarios / 219 comparisons and Menubar to 22 / 66. F3/F4 application commands
update signals or React state with stable keys. Tests do not force primitive state or focus.

Menu retains an ArrowDown request for index zero in its existing logical highlight signal while
the list is empty. A later item can satisfy that index without an additional pending-focus store.
Root and child lists cover empty/refill, child keyed reordering and removal/replacement of an open
owning branch. Empty hovered-child keyboard entry remains outside this increment.

Menu's existing DI owner chain resolves a surviving return-focus trigger when a submenu branch
and its trigger disappear together. Floating Focus Manager ignores a disconnected default anchor
before consulting the consumer's previous-element policy. Explicit final-focus policies and the
shared scope's moved-focus guard retain ownership; no document-global focus history is introduced.

Menubar navigates from the current trigger's position in the full DOM-ordered collection, then uses
the shared Composite search to skip unavailable destinations. Disabling the current open menu must
not block its horizontal navigation. Wrapping onto the same trigger is not a sibling transition.

## Reference limitations

The pin's `utils/popups/interactions/useListNavigation.ts` nested close-key handler first closes
with `list-navigation`, then focuses the reference. `Menu.Trigger` focus opens it again before
Menubar moves backward. With one enabled menu the popup remains open after that cycle but focus
lands on the trigger. Angular keeps its direct sibling transition and makes single-menu arrows a
no-op. Exact callback/focus pairs record those differences, without normalizing callback order.

When the current native trigger becomes disabled, the pin retains tabindex=0 on that disabled
button and leaves enabled siblings at -1. Angular retains an enabled Tab entry. A unit test guards
that policy; exact trigger-array pairs retain the native difference. This is an intentional library
decision rather than an Angular limitation.

## Consequences

The owning policies remain in Menu and Menubar, with shared Composite navigation and floating
return-focus infrastructure. Reviewed differences are exact and fail when changed or stale.
Entire-root removal, empty-list keyboard promotion, canceled sibling transitions, vertical/nested
Menubar composition and real device/AT verification remain separate audit work.
