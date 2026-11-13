# Popover lifecycle (ADR 0033)

Root uses the shared popup lifecycle rather than its own hold flag.
Portal forwards `keepMounted`; `root.unmount()` ends an external exit and `root.close()` defaults to
`imperative-action`. Completion follows actual Portal exit or CSS completion for a retained view.
Inactive retained Positioner/Backdrop hide; tracking and focus scopes stop. Pending exits suppress
pointer events while preserving native focus. The manager's post-open fallback restores natural
portal candidates on interrupted exits even when the existing scope never deactivated.
