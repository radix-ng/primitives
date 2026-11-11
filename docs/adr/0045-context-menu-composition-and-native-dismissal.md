# ADR 0045: Preserve Context Menu composition through native event boundaries

- Status: Accepted
- Date: 2026-11-11
- Decision owners: Radix NG maintainers
- Related: ADR 0015, ADR 0017, ADR 0029, ADR 0037, ADR 0043, packages/primitives/context-menu, packages/primitives/core, packages/primitives/dismissable-layer, packages/primitives/floating-focus-manager, apps/parity-testing

## Context

Context Menu lacked independent comparisons for submenus and shared/nested areas. A canceled nested
request bubbled into its parent. Shared dismissal discarded secondary presses; backdrop hit testing
and outside inert state survived an accepted close until rendering and intercepted the next native event.

## Decision

Add sixteen cases for keyboard/pointer submenus in LTR/RTL, child cancellation and parent selection
with retry, sibling/nested areas, outside switching and cancellation, point anchors, previous focus
and retained views. Reuse actual Menu parts. Areas remain outside Menu trigger registration; their
open/pressed state is shared and callbacks retain original native events and null trigger identity.

The nearest area stops contextmenu and primary touch pointerdown, even when opening is canceled.
Suppress the native menu on the internal backdrop while open. During interrupted closing, preserve
the outside return target rather than capturing our closing popup or temporary body focus.

Correct ADR 0015's primary-button restriction in RdxDismiss. Sloppy dismissal allows all mouse buttons.
Native mousedown retries a vetoed pointerdown close; an accepted close is already inactive. Arm this
retry only from a non-touch pointerdown observed while active, so a touch which opens a popup
mid-gesture cannot dismiss it via its compatibility mouse event. Intentional dismissal still waits
for a click. Owner predicates, touch/scroll/inside guards, pointer cancellation and pre-hooks remain.

Backdrop hit testing and focus-manager isolation release through accepted `openchange` events.
Effects own creation/cleanup, releases are idempotent, and listeners unregister with their owner.
Canceled requests retain isolation. Do not force Angular rendering or redispatch synthetic input.

The shared lifecycle preserves an atomic close/focus/reopen's enter phase. A close surviving the
microtask boundary starts a new enter completion when another native event reopens before render.
Pending-close identity and destruction checks protect later cycles from stale microtasks.

Switching uses a bounded paint frame through Playwright's clock, shared with visual tests. This
defines JS timer/render cadence without replacing native events, targets, trust or primitive state.
CI protocol latency cannot choose whether the old view exits between pointerdown and contextmenu.
Fully closed sessions are compared separately.

## Consequences

There are 36 cases / 108 planned comparisons: 90 execute on macOS and 91 on Linux with existing
native capability skips. Four WebKit focus/highlight pairs expose the existing zero-delta-pointer-travel
reference limitation; trusted coordinate travel is recorded. The two prior Linux right-release pairs
remain. Composition adds no cancellation, callback-order or return-focus exceptions.
Shared dismissal also removes Select's two canceled-compatibility-press event-sequence exceptions.

Keep a cancellation policy active until retry is allowed: another native event can request closing
again. The implementation uses Angular signals, DI owners and lifetimes rather than React stores.
Independent nested Roots, whole-root removal, further overlay composition and real device/AT work
remain separate audits.

## Alternatives Considered

- Fix only Context Menu: rejected; the outside-button restriction belonged to shared dismissal.
- Force rendering or replay input: rejected; release native resources on accepted changes.
- Delete completion outputs: rejected; characterize native boundaries and preserve owned lifetimes.

## Acceptance Criteria

1. Areas, anchors, submenus and cancellation/retry match the pinned source.
2. Secondary outside gestures reopen from another area with original event records.
3. Vetoes retain resources; releasing a long-press does not dismiss its opening.
4. Shared consumers retain intentional/sloppy policy and atomic navigation return.
5. Public multiple/nested-area examples have browser and screenshot coverage.

## Base UI References

Base UI 1.9.0 at `cf696d6f6e08c699c5bda24d5a033430909f2285`: `context-menu/root/ContextMenuRoot.tsx`,
`context-menu/trigger/ContextMenuTrigger.tsx`, `menu/submenu-trigger/MenuSubmenuTrigger.tsx`,
`utils/popups/interactions/useDismiss.ts`, and `utils/popups/focus/FloatingFocusManager.tsx`
under `packages/react/src`. Fixtures import the reference unmodified.
