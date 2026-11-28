# Toolbar follows the Base UI part set

`toolbar` was rewritten to `Root`/`Button`/`Link`/`Input`/`Group`/`Separator` over `CompositeRoot`, with root/group `disabled` cascading through context and `focusableWhenDisabled` keeping disabled items reachable. Toggle groups use `rdxToggleGroup` + `rdxToggle` and share the Toolbar's focus navigation. `RdxToolbarInput` is a **composite input**: a constructor-registered `keydown` listener keeps arrow keys for the text caret and only yields to composite navigation when the caret is at the matching edge.
