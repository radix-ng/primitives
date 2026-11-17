# Popup close lifecycle (ADR 0026)

For Menu owner disposal before its normal removal effects finish, see
[ADR 0065](../../adr/0065-menu-popover-composition.md). The owner hook notifies before output cleanup;
Presence and transition helpers supply their actual pending CSS phase so interrupted exits stay incomplete.

`core/floating/use-popup-lifecycle.ts` coordinates an accepted
close transaction, an external-animation hold, transition completion and registered Presence views.
Select, Popover and Menu compose this helper: Root exposes `close()` / `unmount()`, and Portal forwards `keepMounted`.
Root owns the shared `useRenderLifecycle`; Portal consumes its `mounted` signal and registers the
physical view so completion follows actual destruction. CSS is observed once for retained and
disposable views. Explicit unmount ends the shared render lifetime immediately. See [ADR 0084](../../adr/0084-signal-render-lifecycle.md).
Reopening invalidates the prior close; canceled/open requests cannot retain the next close.
See the Popover and Menu migrations in ADRs 0033 and 0035. Keep these lifetime mechanics shared when
extending parity instead of adding another per-primitive retained-mount flag.

Automatic completion also waits for one native frame after close acceptance, even without CSS
motion. That frame runs alongside Presence/CSS exit, so a finished animation gains no extra frame.
An ordinary reopen invalidates the pending completion. Visual `ending` follows the unfinished
CSS/Presence/deferred lifetime, independently of that notification frame. A new native `focusin`
request completes an already-finished exit before opening again; unfinished exits remain
interruptible. Menu supplies its original event to `prepareOpenChange`. Explicit `unmount()` and
owner disposal keep their own boundaries. See [ADR 0082](../../adr/0082-popup-close-completion-frame.md).

Changing animation participants aborts the old observation before a post-render rescan. That abort
does not complete an unfinished CSS exit: retain its pending phase until the new scan, explicit
cancellation or unmount. Angular can unregister a Popup child before its Root's destruction hook;
clearing the phase in that gap incorrectly lets `finishPendingCloseOnDestroy()` notify an interrupted
close. The observer's AbortSignal distinguishes this cleanup from an actual completed scan.

Menu and Popover's shared viewport follows this presence/closing lifetime for its outgoing visual
snapshot. A logical close can still be in a CSS or deferred exit; do not discard the snapshot at
close-start. See [ADR 0061](../../adr/0061-menu-interrupted-trigger-exits.md) for interrupted trigger sessions.
