# Popup close lifecycle (ADR 0026)

For Menu owner disposal before its normal removal effects finish, see
[ADR 0065](../../adr/0065-menu-popover-composition.md). The owner hook notifies before output cleanup;
Presence and transition helpers supply their actual pending CSS phase so interrupted exits stay incomplete.

`core/floating/use-popup-lifecycle.ts` coordinates an accepted
close transaction, an external-animation hold, transition completion and registered Presence views.
Select, Popover and Menu compose this helper: Root exposes `close()` / `unmount()`, and Portal forwards `keepMounted`.
Presence optionally registers its live view and can bypass exit waiting after explicit completion.
Reopening invalidates the prior close; canceled/open requests cannot retain the next close.
See the Popover and Menu migrations in ADRs 0033 and 0035. Keep these lifetime mechanics shared when
extending parity instead of adding another per-primitive retained-mount flag.

Automatic completion also waits for one native frame after close acceptance, even without CSS
motion. That frame runs alongside Presence/CSS exit, so a finished animation gains no extra frame.
Reopening invalidates the pending completion; explicit `unmount()` and owner disposal keep their
own boundaries. See [ADR 0082](../../adr/0082-popup-close-completion-frame.md).

Menu and Popover's shared viewport follows this presence/closing lifetime for its outgoing visual
snapshot. A logical close can still be in a CSS or deferred exit; do not discard the snapshot at
close-start. See [ADR 0061](../../adr/0061-menu-interrupted-trigger-exits.md) for interrupted trigger sessions.
