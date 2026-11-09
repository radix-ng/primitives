# ADR 0026: Popup close lifecycle and Presence

- Status: Accepted
- Date: 2026-11-09
- Decision owners: Radix NG maintainers
- Related: ADR 0011, ADR 0015–0017, `core`, `presence`, `portal`, `select`

## Context

Select's Base UI audit identified missing imperative close and manual unmount capabilities.
`eventDetails.preventUnmountOnClose()` already exists on the shared event details, but Select did
not consume it. Several other popup families retain a separate boolean to hold their portal.
Transition completion and the Presence view lifetime are also separate: a popup's own transition
can finish before an exit on a descendant or the positioner.

The pinned Base UI source handles these capabilities in its shared popup store and close lifecycle.
Porting a React ref or adding another Select-specific retention flag would not establish the same
lifetime guarantees in Angular.

## Decision

Add `usePopupLifecycle` in `core/floating` and use Select as its first consumer. It coordinates:

- logical `open` state and the transient transition status;
- an opt-out belonging to an accepted close transaction;
- automatic transition completion and the registered Presence view lifetime;
- explicit completion, which skips a second exit-animation wait;
- invalidation on reopening and a single close-completion notification.

An opening or canceled request never commits a hold. Late opt-outs affect only their still-pending
accepted close. Reopening invalidates that close. `unmount()` while open or after completion is a
no-op, and batched `close(); unmount()` is valid. An application's animation callback must still be
canceled or scoped on reopening: a parameterless action cannot identify which animation called it
after an entirely different close has started.

Presence continues to own Angular view creation, CSS exit detection and destruction. Its optional
registration reports live mount state and `keepMounted` policy to the lifecycle. An optional
`skipExitAnimation` signal lets an imperative completion remove an ordinary view immediately.
Existing Presence consumers retain their previous behavior unless they opt into these hooks.

Select exposes `close()` and `unmount()` directly on Root, through a template reference or view
query, and exports `RdxSelectRootActions`. `close()` emits the cancelable `imperative-action`
request. `rdxSelectPortal` exposes its shared `keepMounted` input: manual unmount completes closing
without removing a view that is deliberately kept mounted. A closed positioner is inert, and
closed popup/item handlers ignore selection and navigation. Once closing completes, the positioner
hides and stops tracking its anchor; reopening a retained view refreshes its geometry.

The existing Angular `model()` remains the open-state owner. Outputs are synchronous requests;
accepted model changes and view updates use Angular's normal signal/render scheduling. There is
no React ref object, controlled-prop mirror, external store or forced synchronous render.
The selected item and its text element are computed from the existing reactive item collection.
This replaces mount-only ref callbacks, so item-aligned geometry follows the current value even
when Angular reuses the same portal view. DOM measurements run in `afterRenderEffect`.
`animate.leave` remains the native choice when an application template owns removal. Replacing
the established structural Portal/Presence lifecycle with compiler leave hooks would be a separate
migration, including portaled view ownership and focus cleanup; it is not required by this action API.

`useTransitionStatus.cancel()` invalidates automatic completion work without emitting an event. Its active-transition guard
prevents a finished promise and the safety timer from completing the same transition twice.

## Consequences

The generic lifetime mechanism is ready for later popup migrations without embedding Select
selection, forms or positioning in core. This increment does not migrate Dialog, Popover, Menu or
Tooltip, and does not certify their existing opt-out semantics.

Presence is the sole CSS-exit owner for disposable Angular views. Select completes ordinary closing
when those views have exited. Opening and keep-mounted CSS transitions use `useTransitionStatus`;
there is no second CSS clock for an ordinary Presence exit. A deferred close retains the ending phase until released. Keep-mounted views are
excluded from the wait for DOM destruction. Focus remains governed by the shared focus manager;
scroll lock and dismissal continue to read logical `open`.

## Verification

Shared unit scenarios cover transaction cancellation, late hooks, keep-mounted presence, duplicate
completion, a batched close/unmount and reopen races. Select tests cover the public actions and
portal contract. Browser scenarios exercise a paused external animation, inert closed content,
return focus, deliberate outside focus, descendant CSS exit and reopening.
Retained item-aligned views are checked for DOM identity, updated selection, geometry and navigation.

Reference: Base UI source commit `cf696d6f6e08c699c5bda24d5a033430909f2285` (package version 1.9.0),
`select/root/SelectRoot.test.tsx`, `utils/popups/store.ts` and `utils/popups/popupRoot.tsx`.
