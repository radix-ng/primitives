# 0035 — Reuse popup lifecycle for Menu and preserve nested view ownership

Status: Accepted
Date: 2026-11-10

## Context

Menu used its own hold boolean and transition watcher. An external close could retain a popup but
had no public completion action, and completion did not wait for portal disposal. Select and Popover
already share the accepted-close lifecycle. Menu also owns submenu roots inside its embedded view,
even when their popups are teleported to other DOM locations.

## Decision

Compose Menu Root with core `usePopupLifecycle`, removing its independent hold and transition state.
Portal forwards actual Presence registration and explicit completion. Root exposes `unmount()`;
`close()` defaults to `imperative-action`. Context Menu delegates both actions to its composed Menu.
Retained portals hide and stop tracking after completion. Pending exits suppress pointer interaction
without native inert; native focus can remain inside. Inactive items stop advertising highlight and
settled retained popups remove their active ARIA label association, matching the reference.

Accepted close, cancellation, late holds, reopening and duplicate completion use the same helper as
Select/Popover. Test fixtures also share the concrete lifecycle settings and CSS exit class; Menu and
Popover retain independent actions, models, drivers and assertions. No React actions-ref adapter or
framework state store is added to Angular.

Menu registers actual child Root instances through Angular DI and unregisters them with DestroyRef.
An accepted ancestor close requests child closes after its own callback, preserving ancestor-first
change order. Parent presence derives a hold while accepted child exits are ending. This preserves
the Angular view that owns each child Root until its portal exits and completion output runs.
Canceled child closes do not indefinitely retain an already closed ancestor.
An explicit ancestor `unmount()` completes accepted child exits too, so child animations cannot
retain the owning view after the consumer has completed the whole chain. A stale action while
the ancestor is open leaves children untouched.

## Observed reference limitation

With simultaneous CSS exits in a nested menu, the pin removes the parent and omits the child's
`onOpenChangeComplete(false)`. `popupRoot.tsx` wires completion through `useUnmountAfterClose`;
`useOpenChangeComplete.tsx` aborts the animation callback on cleanup. Removing the parent disposes
the nested Root before that callback completes. The browser scenario observes both exits and actual
callbacks; it does not invoke primitive completion actions or normalize state. The nested case uses
paused real CSS animations and native WAAPI finish so the pending checkpoint cannot race a short
animation under CI load. Root CSS-exit cases retain natural completion timing.

Angular waits for child exit before deleting its owning view and emits both completions. Keep this
behavior rather than reproducing the missing callback. Record the single exact `completions` pair
as `nested-exit-completion`; it is verified across three engines and fails if changed or disappeared.
The same subtree without CSS exits has matching completion callbacks. This is a known difference,
not a claim of complete Menu parity.

## Migration and verification

Applications inspecting the default `close()` reason should handle `imperative-action`. Start an
external animation from `onOpenChange` and finish it with `unmount()`; deferred completion now waits
for that action. Reopening invalidates the old close and its late callbacks.

Eleven added Menu scenarios cover retained checkbox state, natural CSS exits, external and late
holds, canceled holds, duplicate/stale actions, interrupted reopening, modal background recovery
and nested CSS ownership. Angular Storybook checks exercise both mount policies and cancellation
with all lifetime controls enabled. Context Menu and Menubar receive shared regressions; their
independent composition parity suites remain pending.
