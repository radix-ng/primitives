# ADR 0055: Give nested Navigation Menu content its keyboard ownership

- Status: Accepted
- Date: 2026-11-12
- Decision owners: Radix NG maintainers
- Related: ADR 0001, ADR 0032, `navigation-menu`, `composite`, `popper`

## Context

In the positioned Nested example, ArrowDown cycled through three links and skipped Handbook. The
nested List created a second roving composite. It registered while Popper temporarily hid the popup
for positioning, leaving its trigger with tabindex=-1. Popup collected only Tab candidates and then
ignored all keys originating in a nested Root. Directly focusing Handbook in a browser test concealed
the inaccessible path. Nested inline content also had no Popup to handle its keys.

Base UI's nested NavigationMenu.List skips its own CompositeRoot: its triggers belong to the parent
Content's composite. This is distinct from Menu's item collection and keyboard interactions.

## Decision

Top-level Lists continue to own their composite through the existing Angular projection bridge.
Nested Lists publish null composite contexts so their triggers retain native tab order and participate
in the enclosing content's arrow navigation. Angular host directives are static; the nested List's
composite host remains empty instead of requiring another component or a second ownership adapter.

Viewport owns its rendered content's keyboard handling, including inline children without Popup.
Popup retains a fallback for keys on its surface. A shared Navigation Menu helper prevents duplicate
handling, scopes arrows to the nearest viewport and leaves nested triggers in the parent collection.
Arrow candidates include focusable Navigation Menu parts with a negative tabindex; Tab follows native
tab order. Inline children delegate Tab departure to the enclosing portaled viewport.

The inline story uses defaultValue plus the existing cancelable onOpenChange event to prevent closing.
Ignoring an emitted null value is not an Angular controlled-state veto. No React state synchronization
or change-detection workaround is introduced.

Shared Composite, Menu, floating dismissal and Popper behavior stay unchanged. The arrow demo recipe
sets fill-current for consumer-supplied SVG polygons, preserving the headless arrow's styling contract.

## Validation and limits

Focused unit and browser regressions cover the normal top-level collection, the actual ArrowDown path
to Handbook, entry/return through nested portals, inline viewport ownership and logical Tab departure.
Layout checks cover arrow surface colors in both themes, stable Large Menu scroll padding and aligned
full-width Vertical rows. Browser listeners reject interaction-time errors.

These are Angular regressions plus a local source comparison, not a complete pinned Navigation Menu
differential suite. Consumer-supplied composites inside content, arbitrary focusable controls,
additional lifecycle combinations and assistive technology remain separate audits.

## Reference

Compared with local Base UI HEAD fb9fbbf35e72bd4a5494b678c85d2ea0457fed60:

- packages/react/src/navigation-menu/list/NavigationMenuList.tsx
- packages/react/src/navigation-menu/content/NavigationMenuContent.tsx
- packages/react/src/navigation-menu/trigger/NavigationMenuTrigger.tsx
- docs/src/app/(docs)/react/components/navigation-menu/demos/nested/tailwind/index.tsx

The Menu parity runner's pinned reference is unchanged.
