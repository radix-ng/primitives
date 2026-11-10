# 0033 — Reuse popup lifecycle for Popover

Status: Accepted
Date: 2026-11-10

## Context

Popover used a separate hold boolean and transition callback. A deferred close could emit completion
while its view was still held, offered no explicit completion method, and could not retain its portal.
Select already has the shared lifecycle needed for accepted/canceled requests, late holds, Presence
registration and stale completion protection. Interrupted exits also exposed a shared autofocus gap:
a retained scope did not mount again, so reopening left focus on its trigger.

## Decision

Compose Popover Root with `usePopupLifecycle`, replacing its independent hold and transition state.
Forward Presence registration and explicit exit completion through Portal. Expose `keepMounted` on
Portal and `unmount()` on the exported Root. `close()` defaults to `imperative-action`. An Angular
template reference calls these methods directly; no React `actionsRef` adapter is added.

Completion follows actual view exit, or CSS completion for a retained view. An accepted external
animation hold delays completion until `unmount()`. Canceled requests and obsolete callback closures
cannot retain another close. Reopening interrupts the previous exit without emitting its completion.

Keep retained Positioner/Backdrop hidden after closing, disable pointer interaction during closing,
and stop anchor tracking once inactive. Do not use native inert for this Popover exit: the pin uses
pointer-events suppression, preserving native keyboard focus until teardown. Managed focus stays
active through a pending exit, then deactivates even when its Angular view remains mounted. On an
interrupted exit, the manager's post-open fallback restores portal tabbability and reuses FocusScope's
first-tabbable default. Explicit false/target policies and deliberate later focus moves remain respected.

## Migration and verification

`close()` changes its default reason from `none` to `imperative-action`. A deferred close no longer
emits `onOpenChangeComplete(false)` before its external animation finishes. Consumers begin that
animation from `onOpenChange` and call `unmount()` to finish it. Portal `keepMounted` is additive.

Ten new pinned Popover scenarios cover retained draft state, natural CSS exits, deferred completion,
late/canceled holds, duplicate/stale actions, modal background recovery and interrupted reopening.
The actual CSS timeline is observed; tests do not force state or dispatch fake completion events.
Storybook includes the same public composition, with browser regressions for both mount policies.
Shared focus changes are checked through Select and the existing floating consumer suite.
