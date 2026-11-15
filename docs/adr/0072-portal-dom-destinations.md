# Support native Portal destinations across DOM roots and realms

- Status: Accepted
- Date: 2026-11-15
- Related: [ADR 0010](0010-structural-portal-presence.md), Menu audit A4, shared Portal/focus infrastructure

## Context

Portal resolved native targets using the declaring window's HTMLElement constructor. This rejects
valid iframe elements and ShadowRoots. ElementRef skipped validation entirely, while raw targets
could throw on the server if HTMLElement was absent. The Base UI 1.9.0 reference
(`cf696d6f6e08c699c5bda24d5a033430909f2285`) accepts HTMLElement and ShadowRoot destinations, including
ref objects. The local Base UI checkout has the same target surface; the pin remains unchanged.

Actual iframe interaction exposed more than target rejection: constructor checks in Menu and the
shared focus/composite chain failed to recognize foreign keyboard events and nodes. A same-origin
iframe Menu initially opened without keyboard item focus in Chromium. Live relocation also cleared
focus when appendChild moved an already active Angular view.

## Decision

Export RdxPortalTarget=HTMLElement|ShadowRoot. RdxPortalContainer accepts either target, Angular
ElementRef of either, or a selector resolved in the declaring Document. Validate selector results,
raw targets and wrappers through the same checks. Plain DocumentFragments, SVG destinations and
invalid wrappers are rejected. Missing/invalid targets retain the existing body fallback.

Core owns shared DOM guards for Node/Element/HTMLElement/ShadowRoot and native keyboard/mouse event
brands. Node identity uses DOM properties rather than a single realm's constructor, so adoption
does not invalidate a target. Native event brands also recognize foreign events with null view.
Portal, Composite, Focus Scope, floating focus, dismissal and Menu reuse the guards where relevant.
There is no platform sniffing, private Angular metadata or per-primitive copy of these checks.

Both Portal implementations share an internal node mover. It retains the Angular view, moves all
roots, and restores focus only when focus belonged to a moved root. Shadow ancestry is included.
Unrelated focus is left alone. Attribute Portal still restores its declaration anchor for disposal;
structural Portal still owns Presence/WAAPI and destroys the actual view. Inputs and component state
are retained across a live target change.

## Intentional live-retarget adaptation

The pinned React Portal recreates its portal subtree when the container changes. In the two
keyboard-driven retarget witnesses, focus/highlight return to Alpha and an extra true open-completion
is emitted. Angular keeps the same view, Bravo focus/highlight and the existing completion sequence.
Preserving the view is the native Angular Portal contract from ADR 0010; destroying it to reproduce
a React remount would reset consumer state. The initial focus loss in Angular was fixed, rather than
accepted as an exception.

Twelve exact fields in category portal-view-relocation record this measured difference: focus,
highlight and four completion-array checkpoints for each of portal-shadow-switch and portal-frame-switch.
All three engines produced the same pairs. These framework-lifetime pairs are platform-independent
and not new guessed platform-specific pointer/focus behavior. Full raw callbacks remain observed;
any other value or disappearance of a pair fails comparison. Existing 143 fields remain unchanged.

## Verification and limits

Ten Menu cases cover native/ref destinations, keyboard/pointer input, retained reopening, live
retargeting, selection, ARIA links and owner removal in open shadow trees and same-origin iframe
documents. The complete interactive widget shares the destination tree/document, allowing native
label and id references to resolve. Stylesheets are installed by the test app, not the library.

Separate Angular-only checks exercise Popover, Dialog and Select in both surfaces, plus real
cross-document/ShadowRoot transfer of ordinary attribute-Portal content. Edited input values,
Angular listeners, DOM identity, focus and cleanup survive relocation. These checks do not certify
the independent family audits.

Iframe focus assertions follow the native document/shadow activeElement chain. Firefox's hasFocus
also depends on which parallel browser window is foreground; its raw value is retained. The driver
activates the iframe page without focusing any widget node. No primitive/reference state or focus
is forced in fixtures.

Unit regressions cover invalid targets, adopted iframe nodes, missing global constructors and both
Portal implementations' identity/focus/cleanup. SSR checks keep custom-container views at their
declaration position and retain hydration serialization without a global HTMLElement constructor.

Affected-scope validation passed 772 unit tests, 48 pinned Menu comparisons (30 new destination
cases and 18 existing keyboard/radio/cancellation checks), 24 new Angular consumer browser checks,
45 existing floating-consumer checks and two SSR cases. Two production Storybook API checks and
30 documentation-generator tests passed. Library/Storybook compilation and consumer generation passed.
The common metadata resolver now publishes explicitly exposed hostDirectives inputs/outputs,
including nested aliases and models, in Storybook and consumer exports; wrappers remain thin.
The final API result of
resolvePortalContainer is `RdxPortalTarget | null`; callers using HTMLElement-only properties must
narrow that result first.

These are affected-scope checks. Mixed-document overlays with the trigger left in another document,
closed-shadow interactive behavior, cross-origin access and real AT/device behavior are not certified.
Ordinary cross-document DOM transfer is covered. Portal acceptance does not make native ARIA id
references cross tree/document boundaries. Explicit null waiting and React ref retry semantics remain
an open A4 API policy. This increment
retains Angular's existing fallback semantics and does not certify that part of Portal parity.
