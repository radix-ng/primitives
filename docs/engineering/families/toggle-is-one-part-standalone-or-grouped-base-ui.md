# Toggle is one part, standalone or grouped (Base UI)

`toggle`/`toggle-group` were realigned so a single `RdxToggle` works on its own **or** as a `[rdxToggleGroup]` item (pressed state derived from the group's array `value`, joining its composite focus) — there is no separate group-item directive. `data-pressed` replaces `data-state`. `RdxToggleGroup` takes an **array** `value` with `multiple`/`loopFocus` (shared logic in `toggle-group-base.ts`); `RdxToggleGroupWithoutFocus` is the focus-management-less variant for toolbars.
