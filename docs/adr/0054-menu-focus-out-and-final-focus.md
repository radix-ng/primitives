# ADR 0054: Resolve Menu focus-out cancellation and finalFocus

- Status: Accepted
- Date: 2026-11-12
- Decision owners: Radix NG maintainers
- Related: ADR 0017, ADR 0052, ADR 0053, `menu`, `focus-scope`, `floating-focus-manager`

## Context

The portal declaration bridge left cancellation and explicit return policies unaudited. Browser
comparisons exposed default trigger focus overriding finalFocus=false on Escape, explicit targets
stealing a completed forward Tab, and incorrect focus/highlight after vetoed departures.

Base UI separates forward Tab from Shift+Tab. Forward Tab uses portal guards. Shift+Tab is an
explicit cancelable list-navigation return request: it consumes the key, preserves focus on a veto,
and returns to the owner after an accepted close. This refines ADR 0053's blanket native-Tab wording.

## Decision

Menu handles Shift+Tab through its existing Root.close transaction, retaining the original
KeyboardEvent and trigger identity. A veto leaves the item focused. Escape's synchronous default
return only runs for the default/true policy; false and custom policies finish through the shared
scope. Callback policies resolve once per close with the actual closing interaction type.

The shared Floating Focus Manager suppresses return focus after its forward portal handoff, while
still resolving a callback policy. An explicit target cannot take focus back from Tab. Canceled
handoffs restore the previous suppression state, and reopening resets it.

Root Menu supplies its existing trigger-side trailing guard as the focus manager's forward target,
matching the pin. Trigger guard helpers request closing before resolving the next tabbable. A veto
retains the logical portal entry guard, which re-enters the still-open menu; an accepted close skips
the closed popup/guards. Outside-before guards distinguish entry from another outside guard from
return out of their content. This uses Angular's accepted state and existing DI signals, with no
React flushSync equivalent or forced Angular change detection.

Regular, link, checkbox and radio items retain logical highlight on blur; navigation, pointer leave
and actual close own changes to it. Returning to an open SubTrigger clears its child's highlight
and transfers it to the parent, independently of a close veto.

The common tabbability bridge observes logical guards and descendant portals outside its physical
surface through document capture. Local capture remains for shadow-root retargeting, and external
events are gated by the consumer's existing logical-inside policy. Leaving to a parent control
suspends the child Tab stops even when closing is canceled.

A neutral snapshot restoration callback lets the owner preserve authored tabindex policy. Menu
keeps its own closed items at -1 while restoring other controls from their saved values. This is an
Angular rendering adaptation: highlight may already have rendered -1 while suspended, so restoring
an old 0 later bypasses Angular's unchanged-binding check. No second roving state or observer loop
is introduced. Other floating consumers retain the default snapshot restoration.

## Evidence

Eighteen new differential cases cover parent/child/both focus-out vetoes, native controls in the
parent, Shift+Tab, false/element/callback finalFocus, fresh/retained closes and successive sessions.
They compare actual focus, highlight, tabindex, requests/reasons/triggers, callback interaction type
and invocation count, plus lifecycle completion. Browser-native callbacks remain unmodified in raw
attachments; React's delegated focusin and internal generated events are not manufactured in Angular.

The new 54 comparisons pass in Chromium, Firefox and WebKit on macOS and Linux, without new
exceptions or capability skips. Menu now defines 199 cases / 597 planned comparisons: 549 execute,
with the existing 48 touch skips. Focused existing Menu, Menubar, Context Menu, Popover and Select
checks guard the shared changes. The new Return Focus example exposes parent/child policies,
focus-out vetoes and keepMounted; browser regressions exercise real keyboard requests and cleanup.

## Compatibility and remaining scope

Shift+Tab now reports its original keydown as the focus-out source. Escape honors false rather than
focusing the trigger, and forward Tab honors its destination rather than a custom return target.
Applications depending on the previous behavior should update their event/focus assumptions.

Projected Angular wrappers, callback-null/undefined and removed-target combinations, remaining API
and lifecycle combinations, real devices and assistive technology remain separate audits. Context
Menu's modal forward-Tab/closeOnTab policy also needs its own comparison increment.

## Reference

The pinned Base UI 1.9.0 commit is cf696d6f6e08c699c5bda24d5a033430909f2285, available in the local
Base UI checkout and verified in the runner's archive cache. The local HEAD
fb9fbbf35e72bd4a5494b678c85d2ea0457fed60 was also compared: the relevant newer focus-manager change
only suppresses repeated focus-out closes after an accepted close. The automated pin is unchanged.

- packages/react/src/menu/popup/MenuPopup.tsx
- packages/react/src/menu/submenu-trigger/MenuSubmenuTrigger.tsx
- packages/react/src/utils/popups/interactions/useListNavigation.ts
- packages/react/src/utils/popups/useTriggerFocusGuards.ts
- packages/react/src/utils/popups/focus/FloatingFocusManager.tsx
- packages/react/src/utils/popups/portal/FloatingPortal.tsx
