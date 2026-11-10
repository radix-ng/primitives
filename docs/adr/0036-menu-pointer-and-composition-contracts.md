# 0036 — Compare Menu pointer gestures and its compositions

Status: Accepted

Date: 2026-11-10

## Context

Keyboard/lifetime Menu comparisons did not establish hover ownership, grace travel or native
press-drag-release. Context Menu and Menubar compose Menu but have distinct opening, focus and
coordinator contracts, which Angular-only regression tests cannot establish against Base UI.

## Decision

Extend Menu's pinned suite with real mouse paths, delays and releases. Keep Context Menu and
Menubar in independent discovered suites. Share native event recording, actual Menu item markup
and their common DOM recorder; retain per-family cases, actions and configuration. Angular's static
template fragment preserves owning-view queries rather than adding a wrapper component. No
fixture forces framework state, focus, movement deltas or completion.

Menu hover opens with popup focus, promotes to press ownership on click and cancels pending hover
timers when pressed. Child Roots use the existing DI registry for parent-item hover ownership.
Grace handlers retain the original mouse event for `trigger-hover` close requests. Disabled items
may receive hover focus, while activation remains disabled. After entering a submenu, sibling
parent-item hover closes it; leaving the child floating area alone does not.

An accepted press disposes Angular's hover tunnel through the existing reason signal and effect
cleanup, even while logical open remains true. Guard that resource cleanup in Angular browser
regressions. Cross-framework comparisons check press ownership, focus and real release behavior;
the pin's transient internal body styles are not a required output contract.

Menubar inherits disabling through a DI signal and routes native mouse-down, keyboard and focus
events to Menu with explicit reasons. Its existing focus manager includes the bar during native
sibling focus transfer. Context Menu captures actual pre-open focus for that same manager instead
of registering a context area as an ordinary trigger or forcing focus to it.

The trigger coordinator registers its actual native host. Focus containment and the internal
backdrop cutout use that registration, preserving Angular `hostDirectives` composition without
depending on the original selector attribute. The Menubar fixture deliberately uses that composition.

Keep the coordinate-based WebKit hover guard already shared with Select. The pin drops trusted
coordinate travel when WebKit emits zero movement deltas. Record only exact observed
focus/highlight consequences, including native macOS click focus, scoped by engine and platform.
Stale or changed exceptions continue to fail.

## Consequences

Menu, Context Menu and Menubar changes are checked together because they share production parts.
Reason/focus corrections are intentional observable changes; their matrices document migration.
No new React-style interaction store, controlled-state mirror or generic control engine is needed.
The choice to preserve child exit completions remains library policy, not a framework requirement.

Initial composition suites leave touch/keyboard context origins, additional context areas, dynamic
collections, vertical Menubar behavior, deeper nesting and real device/AT work open. Passing this
scope does not establish complete parity.
