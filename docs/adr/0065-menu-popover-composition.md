# ADR 0065: Compose Menu and Popover through each layer's outside-press policy

- Status: Accepted
- Date: 2026-11-13
- Decision owners: Radix NG maintainers
- Related: ADR 0026, ADR 0035, ADR 0063, ADR 0064; `menu`, `popover`, `dismissable-layer`, `core`

## Context

Menu inside Popover exposed an incorrect press phase. Angular Popover used sloppy pointerdown for
all modes. Base UI uses intentional mouse clicks for ordinary/modal Popover and sloppy pointerdown
for trap-focus; touch uses sloppy dismissal. Closing the host too early also removed Menu before
its normal completion could run. Correcting the phase still left a fast-click race: Angular can
batch child and parent closures into one render, destroying the owner before the child's effect.

ADR 0063's descendant backdrop containment also suppressed sloppy parent dismissal. A backdrop
created after isolation could be mistaken for injected third-party content.

## Decision

Configure Popover's existing RdxDismiss with the per-pointer-type policy from the pin. Normal
Menu/Popover lifecycles complete in their own phases.

For an accepted ordinary Menu close interrupted by a closed floating ancestor's disposal, notify
through Menu's ngOnDestroy before Angular disconnects outputs. Angular marks the view destroyed
before directive hooks and disables outputs before DestroyRef callbacks; a cleanup callback is too
late for the notification. The shared lifecycle owns the one-shot guard and skips open/reopened
Roots, vetoes, manual holds, already-completed closes and actual CSS exits interrupted by disposal.
Abrupt application Root removal retains its abort behavior. Cleanup continues through DestroyRef.

Read pending CSS exits from PresenceMachine and useTransitionStatus's existing motion state.
Presence and Portal register the same observation with the lifecycle. Do not add a mirrored signal,
another lifecycle store or React event bookkeeping.

Keep dismissal surface containment narrow: popup, triggers and descendant popups/triggers. Include
descendant owned roots for press-start capture and third-party filtering. This recognizes late-owned
backdrops without marking arbitrary injected content as inside. Intentional parents consume the
trailing click of a child's backdrop gesture; sloppy parents may close on its pointerdown. The
existing floating tree and owned-element registry remain authoritative.

Menu backdrops also carry the positioner's existing menu-chain owner identity. A Menu ignores an
outside press on another chain's backdrop, including a nested independent Context Menu Root.
Submenus retain their parent's identity and normal chain dismissal. This keeps independent Root
dismissal separate without splitting the shared floating ancestry or adding a global layer store.

Use standalone imports and shared Tailwind styles in the Inside Popover example. Host callbacks
share only an observation shape with Dialog; each primitive retains its native state and actions.
The example defaults to trap-focus and can enable a fully modal host.

## Evidence and limits

Twenty-four pinned cases / 72 comparisons cover ordinary, modal and trap-focus hosts; modal and
non-modal Menu outside presses; Escape, selection, Tab/Shift+Tab, vetoes, retained/deferred exits;
and parent closure/removal/recreation through open or CSS/deferred phases. No new expected
differences are needed.

Outside-both comparisons use non-modal Menu with ordinary/modal Popover. A modal Menu's portaled
backdrop exposes unstable reference behavior: its React capture marker can suppress the host's
press, and ordinary/modal hosts wait for a click that Firefox/WebKit may not generate after backdrop
removal at pointerdown. The reference then closes both layers or leaves the host open. Do not add
retries or rewrite observations to hide this boundary. Modal Menu outside-both behavior is covered
by Angular browser regressions, not claimed as pinned equivalence.

Unit regressions distinguish intentional from sloppy parent dismissal, owned backdrops from
injected content, and the three Popover mouse press modes. A Menu/Popover integration test checks
completion during the native press phases, including immediate clicks, deferred exits and absence
of NG0953. Shared lifecycle regressions distinguish ordinary, deferred, Presence CSS and retained
CSS disposal.
Browser checks cover layered focus, selection, retained exits and explicit completion; shared Menu
consumers receive focused regressions.

This establishes incremental Menu host integration. An item opening Popover, independent Popover
API parity, and real-device/assistive-technology validation remain separate work.

## Reference

Pinned Base UI 1.9.0 cf696d6f6e08c699c5bda24d5a033430909f2285 from local committed objects.
Checkout HEAD fb9fbbf35e72bd4a5494b678c85d2ea0457fed60 was also inspected.

- packages/react/src/popover/root/PopoverRoot.tsx and PopoverRoot.test.tsx
- packages/react/src/utils/popups/interactions/useDismiss.ts and InternalBackdrop.tsx
