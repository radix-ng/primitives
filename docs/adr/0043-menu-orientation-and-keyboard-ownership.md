# ADR 0043: Respect Menu orientation and portaled keyboard ownership

- Status: Accepted
- Date: 2026-11-11
- Decision owners: Radix NG maintainers
- Related: ADR 0001, ADR 0040, ADR 0041, ADR 0042, `packages/primitives/menu`, `packages/primitives/menubar`, `apps/parity-testing`

## Context

Menu Root exposed `orientation`, but Popup navigation and SubTrigger opening assumed vertical lists.
Menubar comparisons only exercised vertical popup lists. Horizontal arrows therefore switched bar
menus instead of navigating horizontal items, and mixed-orientation submenu returns skipped their
parent list's keyboard ownership.

## Decision

Reuse Composite's `getCompositeNavigationKeys` for axis and RTL mapping. Standalone triggers open on
their menu's main axis; submenu triggers open on the parent's cross axis. Popup navigates its own
main axis and returns on its own cross-axis backward key. Home/End remain DOM-order boundaries.
The native event's consumption at a return depends on whether its parent also navigates on that key.

Menu Root derives parent orientation through DI or its registered Menubar coordinator. Popup
registers a lifecycle-owned arrow handler. Portaled children relay their original KeyboardEvent
through those handlers because Angular's body portals do not bubble DOM events to their owning
Popup. Direct keys are consumed locally; bubbled child keys at a directly owned Menubar popup first
reach the bar's delegated handler, matching the pin's actual ancestor routing. Menubar only maps its
own navigation axis to sibling destinations. No synthetic key, React store or parallel focus state
is introduced. Internal navigation registration now passes KeyboardEvent instead of an X-axis offset.

Add sixteen scenarios: horizontal root lists, vertical children of horizontal parents, horizontal
children of vertical parents, and horizontal lists at both levels. Each runs under horizontal and
vertical bars in LTR/RTL. Compare real focus, highlight, semantic ARIA orientation, native reasons,
callback order and completions; exercise fresh-session Tab exit and selection after navigation.
Menu's implicit ARIA orientation is resolved to vertical when recording it. Save actual item tabindex
and highlight together after synchronous navigation return.

Default, Vertical and KeepMounted keep the existing Base UI hero anatomy and Radix NG styles. A
HorizontalPopup story uses the same component with independently oriented root menus, vertical
submenus, semantic separator orientation and cross-axis indicators.

Menubar reconciles root registrations by Root/trigger identity. Angular's descendant content query
also changes when a portaled submenu mounts or unmounts; unchanged top-level registrations must
survive that query update. Replacing them cleared the active owner and made a later navigation
return reopen with popup autofocus instead of retaining native trigger focus. Registration teardown
now follows actual removal, trigger replacement or owner destruction.
Refocusing an already-open trigger with visible keyboard focus still requests `trigger-focus`,
including after a canceled parent selection. A pointer focus does not promote a pressed menu to
keyboard ownership. These requests remain compared against the pinned native callback sequence.

## Consequences

Menubar grows to 77 scenarios / 231 comparisons. The prior eleven reviewed pairs remain.
Two exact `stale-tab-stop-after-return` pairs record a pin limitation: after synchronous close/reopen,
the pin restores tabindex=0 on the previously highlighted Bravo while Alpha is already highlighted
and tabindex=0. Angular keeps one item in the Tab order. The raw attribute difference stays compared;
the scenario closes that session with Escape and reopens before comparing ordinary native Tab.
This is a reviewed reference defect, not an Angular requirement or a claim of Tab equivalence through
the pin's stale stop. Changed or vanished exceptions fail.

## Alternatives Considered

- Duplicate key tables in Menubar and SubTrigger: rejected; Composite already owns axis/RTL mapping.
- Redispatch a key after a portal: rejected; callbacks must retain the original native event.
- Reproduce the pin's cached second Tab stop: rejected; it would introduce stale roving state.

## Acceptance Criteria

1. The 77-case Menubar suite passes in three engines on macOS/Linux with exact reviewed differences.
2. Shared Menu and Context Menu comparisons and their browser consumers remain covered.
3. Standalone horizontal trigger opening and wrong-axis rejection are characterized in unit tests.
4. The public horizontal example is covered by browser behavior and platform screenshots.

## Base UI References

Base UI 1.9.0 at `cf696d6f6e08c699c5bda24d5a033430909f2285`:
`menu/root/MenuRoot.tsx`, `menu/submenu-trigger/MenuSubmenuTrigger.tsx`,
`utils/popups/interactions/useListNavigation.ts`, and `internals/composite/root/useCompositeRoot.ts`
under `packages/react/src`. The reference is imported unmodified.
