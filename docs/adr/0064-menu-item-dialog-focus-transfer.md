# ADR 0064: Transfer Menu item focus to Dialog and return past hidden views

- Status: Accepted
- Date: 2026-11-13
- Decision owners: Radix NG maintainers
- Related: ADR 0017, ADR 0027, ADR 0032, ADR 0063; `menu`, `dialog`, `focus-scope`, `floating-focus-manager`, `dismissable-layer`

## Context

An item can close Menu and open an independent Dialog, or keep Menu open under a nested Dialog.
With keepMounted, the default return candidate can remain connected inside a hidden Menu. Attempting
to focus it left focus on body. A Menu whose close was canceled also received focus-out and Escape
belonging to the newer independent Dialog: their floating nodes have separate ancestry, while the
existing document focus-scope stack already coordinates their activation.

## Decision

Reuse Focus Scope's existing focusability detection when selecting default return candidates and
the newest viable weak history entry. Hidden, inert, disabled and disconnected candidates are
skipped. Explicit focus targets and the moved-focus guard retain their current behavior. Reuse the
bounded per-Document history; do not add component-specific return state.

The focus manager skips focus-out while its scope is paused. Dismissal reads an optional scope on
its own host: a paused scope yields an Escape from an unrelated popup. Logical descendants remain
eligible for existing tree bubbling and closeParentOnEsc. Parts without their own Focus Scope keep
the existing tree policy. This uses Angular's scope ownership rather than copying the reference's
React open counter or synthetic keyboard handlers.

Keep Dialog Root outside the closing Menu portal for independent dialogs. Compose rdxMenuItem and
rdxDialogTrigger on a native button and connect it with a Dialog handle. For a nested Dialog, keep
Menu open through closeOnClick=false so the declaring view remains alive. Export the existing
menuImports array for direct standalone composition; existing module consumers remain supported.

## Evidence and limits

Eighteen pinned cases / 54 comparisons cover keyboard/pointer selection, handle and model opening,
submenu selection, trusted press-drag-release, retained/CSS/deferred exits, canceled Menu close,
nested Dialog Tab/Shift+Tab and pointer departure, and a canceled Dialog opening. Native WAAPI
finishes authored CSS; fixtures use application data and public APIs without manual focus transfer.
No new expected differences are introduced.

Angular's native inert isolation is preserved. Comparisons observe isolation through actual
inert/aria-hidden ancestors; raw spelling and ancestor locations remain attached per checkpoint.
Native focus, events, completion histories and visibility are compared directly.

Unit regressions cover return past a hidden connected command and independence of the vetoed Menu
from Dialog Escape/focus-out. The Open Dialog story checks fresh/retained and deferred return in real
browsers. Shared focus/dismissal consumers receive focused regression checks. Independent Dialog
parity and real-device/assistive-technology validation remain separate work.

## Reference

Pinned Base UI 1.9.0 cf696d6f6e08c699c5bda24d5a033430909f2285, prepared from local committed objects.
Checkout HEAD fb9fbbf35e72bd4a5494b678c85d2ea0457fed60 was also inspected.

- packages/react/src/menu/root/MenuRoot.test.tsx (nested popups and opening a Dialog from an item)
- packages/react/src/utils/popups/focus/FloatingFocusManager.tsx (return past a hidden retained item)
- packages/react/src/utils/popups/interactions/useDismiss.ts (Escape ownership and gesture timing)
