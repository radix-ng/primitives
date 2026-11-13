# Retained focus scopes (ADR 0027)

the floating focus manager drives `RdxFocusScopeConfig.enabled`
so a retained Angular view can deactivate its scope, return focus and resume its parent without DOM
destruction. Keep initial/return-focus ownership in this shared path; Select placement and Menu close
effects must not separately steal or return focus. Select Popup exposes `closeOnFocusOut` as an opt-in,
default `false`; changing the default or switching to item DOM focus remains gated on real AT review.

For return past a retained hidden item and event ownership when an independent popup pauses the
scope, see [ADR 0064](../../adr/0064-menu-item-dialog-focus-transfer.md). Default return selection
reuses the shared focusability checks and per-Document history.
