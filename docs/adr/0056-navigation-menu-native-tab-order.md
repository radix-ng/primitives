# ADR 0056: Preserve Navigation Menu's native Tab order

- Status: Accepted
- Date: 2026-11-12
- Decision owners: Radix NG maintainers
- Related: ADR 0001, ADR 0055, `navigation-menu`, `composite`, `tabs`

## Context

The Angular top-level Navigation Menu inherited CompositeItem's roving tabindex. Tab reached only
the highlighted item and then left the group, skipping Handbook and GitHub in the default example.

Base UI uses Composite for registration and arrow navigation, but overrides its tab stop at the part
level: Trigger supplies tabindex=0 and Link supplies undefined, retaining the anchor's native order.
Those props merge after the composite props. Matching only the underlying composite missed the final
Navigation Menu behavior.

A rendered example from local Base UI HEAD fb9fbbf35e72bd4a5494b678c85d2ea0457fed60 confirms:

- Closed: Before → Overview → Handbook → GitHub → After; Shift+Tab reverses that order.
- Open: Overview → Quick Start → Releases → Handbook → GitHub.
- Open reverse: GitHub → Handbook → Releases → Quick Start → Overview.

## Decision

The existing internal CompositeItem owner can optionally supply a tabindex policy. Without it,
Composite and Tabs retain their existing roving behavior. Registration, focus tracking and arrow
navigation remain shared.

Navigation Menu supplies the part's authored static tabindex when present, otherwise 0 for a Trigger
and null for a Link so its native element determines Tab eligibility. CompositeItem remains the sole
DOM binding owner, avoiding competing Angular host bindings after highlight changes. No public
navigation mode or wrapper is introduced.

Forward Tab entry into open content and reverse return from ADR 0055 remain. Closed siblings stay
native Tab stops, including after arrow navigation and portal exit.

Shift+Tab from the next sibling enters the open panel's last Tab stop before returning to its
trigger, matching Base UI's portal guards. List handles this logical boundary through the existing
root/content references; it leaves all other native Tab movement alone.

List also composes the existing FloatingInsideElement: top-level links belong to the menu's logical
inside area, so focusing GitHub does not prematurely dismiss the popup before reverse navigation.

Safari's default Tab preference can skip native anchors, which the rendered Base UI probe also does.
Option+Tab visits them. The Tab bridges accept that native navigation gesture while leaving Ctrl/Meta
shortcuts alone; full-order WebKit checks use Option+Tab without changing anchor tabindex.

## Validation and limits

Focused checks cover horizontal, vertical and links-only examples, full forward/reverse paths, Tab
after arrows, the open-panel path, Angular projection and authored tabindex. Shared Composite and
Tabs unit tests retain their roving contract.

The Base UI browser probe verifies this Tab contract against local sources; it is not a full pinned
Navigation Menu differential suite.

## Reference

- packages/react/src/navigation-menu/trigger/NavigationMenuTrigger.tsx — defaultProps.tabIndex
- packages/react/src/navigation-menu/link/NavigationMenuLink.tsx — defaultProps.tabIndex
- packages/react/src/internals/composite/item/CompositeItem.tsx — prop merge order
- packages/react/src/internals/composite/item/useCompositeItem.ts — underlying roving tabindex
- packages/react/src/navigation-menu/root/NavigationMenuRoot.test.tsx — tabbing cases
