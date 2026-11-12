# ADR 0057: Preserve Menu ownership through projected Angular wrappers

- Status: Accepted
- Date: 2026-11-12
- Decision owners: Radix NG maintainers
- Related: ADR 0001, ADR 0015, ADR 0053, ADR 0054; `menu`, `composite`, `context-menu`, `menubar`

## Context

Angular projection preserves the declaring injector tree. Items supplied to a wrapper whose template
owns Menu Popup could not inject that Popup's CompositeList or focus manager. A DOM fallback sometimes
moved focus, but item indices remained -1, highlighting and tab stops were incorrect, and mixed lists
skipped projected items. Nested projected Roots also missed the parent's floating registration, which
lived on Popup, so entering a portaled child dismissed its parent as an outside focus interaction.

Base UI resolves these contexts through its rendered tree. Its Menu Root owns the floating node; Popup
supplies list and focus contexts to its rendered children. React state/event synchronization is not a
requirement for the Angular implementation.

## Decision

Menu reuses the existing internal CompositeItem owner bridge from Tabs/Navigation Menu. Each Root
publishes its Popup's CompositeList signal. Item, LinkItem, CheckboxItem and RadioItem bind to their
own Root's list; SubTrigger binds to its parent Root's list. An absent Popup remains authoritative,
preventing registration with an unrelated ancestor. Popup disposal clears the published collection.
Standalone parts without a Menu Root retain their ambient-list fallback.

Root also publishes its Popup's existing isRestoringFocus callback. Projected parts read their owning
Popup's state instead of mistaking a focus restoration for new list navigation. A SubTrigger reads its
parent's state. This preserves the pin's focus/highlight behavior after in-place reorders.

Floating node registration moves from Popup to Root, using the unchanged shared registration helper.
Nested Roots inherit the right floating ancestry even when their declaring view is outside Popup.
Independent Context Menu state boundaries retain their ambient floating ancestry. Dismissal, presence,
focus and scroll-lock policies remain owned by the existing shared mechanisms.

Sibling submenu discovery reads the owning collection and the existing trigger-to-Root WeakMap.
It no longer requires a literal rdxMenuSubTrigger attribute, which hostDirectives composition need
not render. The public Composition story demonstrates native button wrappers, a Popup/Portal in a
wrapper view, mixed internal/projected items and a nested child.

The existing pointerout fallback performs the same cancellation and focus cleanup as pointerleave
when the pointer leaves the trigger, including engines that drop the latter event during fast travel.
Descendant-to-descendant movement remains ignored. Hover-cancel and click-promotion regressions use
trusted pointer input with controlled timer advancement so slow protocol calls cannot accidentally
cross the reference's 180ms open delay or 500ms promotion window.

## Evidence and precise remaining difference

Thirteen pinned scenarios cover keyboard/highlight/Tab indices, disabled activation, explicit labels,
checkbox/radio/link selection, mixed collections, reorder/insertion, LTR/RTL children, retained sessions,
focus-out cancellation and an explicit final-focus target. Fixtures only change application data;
they never repair primitive focus or state. Item order is compared inside each logical popup. Raw
document portal order is attached separately because eager Angular projection can mount a retained
child portal before its parent.

One exact pair remains at projection-retained-submenu / session 2 projected entry / tabStops. The pin
restores a saved tabindex=0 on a closed, hidden retained child; Angular's existing closed-snapshot
policy (ADR 0054) keeps -1. The child remains hidden and is not a live Tab stop. Visible focus, arrows,
selection and reopening match. The exception validates the entire exact table, with no ignored fields
or rewritten reference state. It is observed in all three engines on macOS and Linux.

Menu-family unit checks and focused Context Menu/Menubar comparisons guard the shared ownership
change. Public Storybook regressions reject runtime errors and exercise the mixed and nested paths.
This increment does not certify the entire API, real devices or assistive technology. Callback
null/undefined and removed-target finalFocus combinations were subsequently covered by ADR 0058.

## Reference

Pinned Base UI 1.9.0: cf696d6f6e08c699c5bda24d5a033430909f2285. Local checkout source comparisons use
fb9fbbf35e72bd4a5494b678c85d2ea0457fed60; the automated pin is unchanged.

- packages/react/src/menu/root/MenuRoot.tsx
- packages/react/src/menu/popup/MenuPopup.tsx
- packages/react/src/menu/item/useMenuItem.ts
- packages/react/src/menu/submenu-trigger/MenuSubmenuTrigger.tsx
- packages/react/src/utils/popups/focus/FloatingFocusManager.tsx
