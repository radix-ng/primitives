# Dialog is a declarative compound

`dialog` was rewritten off `cdk/dialog` into a Base UI-style compound (Root/Trigger/Portal/Backdrop/Popup/Title/Description/Close, plus Viewport and a detached-trigger handle) built on the shared floating engine (`RdxDismiss` dismissal + `RdxFloatingFocusManager` focus) plus `presence` + `portal`. It mirrors `popover` (the reference for this pattern)
