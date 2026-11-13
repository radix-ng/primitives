# Popup close lifecycle (ADR 0026)

`core/floating/use-popup-lifecycle.ts` coordinates an accepted
close transaction, an external-animation hold, transition completion and registered Presence views.
Select, Popover and Menu compose this helper: Root exposes `close()` / `unmount()`, and Portal forwards `keepMounted`.
Presence optionally registers its live view and can bypass exit waiting after explicit completion.
Reopening invalidates the prior close; canceled/open requests cannot retain the next close. Other
popup families have not yet migrated to this helper (Popover: ADR 0033; Menu: ADR 0035). Keep these lifetime mechanics shared when
extending parity instead of adding another per-primitive retained-mount flag.
