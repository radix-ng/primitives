# 0039 — Menubar transactions, orientation and nested ownership

Status: Accepted

The interaction-mode decision and two overlapping-state exceptions below are superseded by
[ADR 0040](0040-menu-navigation-return.md).

Date: 2026-11-10

## Context

Pinned Base UI 1.9.0 comparisons left sibling cancellation, vertical navigation and nested Menubar
composition unmeasured. Duplicate activation paths could retry a canceled close and focus-out could
then close the menu anyway. DOM selector checks also obscured actual Menu ownership.

## Decision

Extend Menubar to 36 scenarios / 108 comparisons. Native keyboard and pointer actions cover canceled
destination opening, canceled source closing and retry. An application F5 command changes only its
cancellation policy; fixture Menu state remains uncontrolled. A canceled source close may leave both
popups open, matching the reference's per-Root transaction contract.

Coordinator activation follows an accepted closed-to-open Root change. Native focus owns the switch
request rather than a second request after focus. Focusing an already-open menu does not re-close
its siblings. Logical highlight survives focus transfers inside the coordinator.

Menu exposes the coordinator's inside elements through its existing DI owner chain. Focus-out does
not bypass canceled sibling closing, including through nested portaled popups. `RdxDismiss.escapeKey`
receives the original KeyboardEvent. Menubar resolves its owning menu once per native event using
an event-keyed WeakMap, so an earlier document listener's close/focus changes cannot redirect the same
Escape to another menu. A subsequent native Escape resolves anew. This stores event routing identity,
not popup state or focus history. Synchronous return focus respects an event on another trigger;
the existing shared focus scope retains its moved-focus guard.

Up/Down rove a vertical bar, while its cross-axis arrow opens a vertical popup (Right LTR, Left RTL).
Popup item navigation remains vertical. Horizontal roving and sibling switching follow text
direction; a three-enabled-item RTL case distinguishes opposite directions. Nested forward arrows
delegate through parent Roots to the owning bar. The coordinator filters declared submenu Roots,
independent of original popup selector attributes. A consumer `hostDirectives` popup fixture verifies it.
The DOM fallback for initial focus recognizes semantic menu/item roles as well as original selectors;
the composed fixture also omits item selector attributes. Wait for actual parent focus and opening
completion before exercising a child, so an unready ancestor cannot invalidate the nested gesture.

`data-has-submenu-open` describes directly owned Menu Roots. Derive it from their actual open signals,
including after a child closes or canceled closing leaves overlapping menus. Add a vertical Storybook
example using the existing demo component and Tailwind utilities.

## Reference limitations

Keep the ten exact reviewed pairs from ADR 0038. Add two bar-state pairs where closing one overlapping
menu clears the pin's flag while another stays open. Add six child-completion pairs where disposing
the nested branch loses the pin's final callback; Angular retains actual completion. No callback
normalization or manufactured completion is used. Changed or disappeared pairs fail.

## Remaining scope

Vertical close-direction arrows and custom popup orientation need their own comparison increment:
the pin's shared nested close handler can produce the same close/reopen cycle recorded in ADR 0038.
Canceled nested requests, retained Menubar portals and real device/AT coverage remain open.
