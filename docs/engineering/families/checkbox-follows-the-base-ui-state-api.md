# Checkbox follows the Base UI state API

`data-checked`/`data-unchecked`/`data-indeterminate` replace `data-state` (BREAKING). Added `defaultChecked`, a `readOnly` alias, `uncheckedValue`, and `keepMounted`; `rdxCheckboxIndicatorPresence` was **removed** in favor of the indicator's `keepMounted` input (BREAKING). Disabled checkbox buttons stay focusable via `aria-disabled` instead of native `disabled`. (Group co-location is unchanged — see below.)
