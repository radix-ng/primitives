# Dialog behavioral comparisons

```bash
pnpm test-parity dialog
pnpm test-parity dialog --project=webkit --grep 'non-modal|trap-focus'
```

The suite exercises real Angular Dialog parts and Base UI React 1.9.0 at the workspace pin
`cf696d6f6e08c699c5bda24d5a033430909f2285`.
The 22 cases pass in Chromium, Firefox and WebKit on macOS and Linux/arm64, with no entries in
`expected-differences.json`.

| Area              | Cases | Behavior                                                                                                       |
| ----------------- | ----- | -------------------------------------------------------------------------------------------------------------- |
| Open ownership    | 5     | Initial and late defaults, controlled false, delayed parent acceptance and cancellation                        |
| Modal background  | 1     | Focus cycling, background isolation, scroll lock, outside press and restored background activation             |
| Other modal modes | 7     | Non-modal Tab and pointer focus departure, press timing, `trap-focus`, authored Backdrop and dismissal opt-out |
| Trigger identity  | 2     | Bound ID before the default, null fallback, active trigger removal and replacement                             |
| Close lifetime    | 7     | Automatic and manual release, retained and disposable content, reopen, same-batch release and CSS motion       |

Checkpoints compare actual browser focus and visibility, mounted content, native form values, resolved
ARIA links, change details and completion order. Raw measurements preserve generated IDs, the rendered
markup, background attributes and native change event type and trust. In full modal mode Angular uses
`inert` for background isolation. Base UI uses `aria-hidden` and an internal backdrop. The keyboard and pointer actions also
check that focus stays inside and an outside press dismisses without activating the page.

On macOS WebKit, ordinary Tab previously skipped Angular Close because the native button lacked the
explicit tabindex emitted by Base UI. Option+Tab reached Close but stalled on the next forward press:
the focus scope redirected focus before its own boundary guard could wrap. The regression checks both
ordinary Tab and the native Option+Tab cycle. The correction uses a static Close tabindex default and
lets each manager's registered guards redirect focus at the boundary.

Non-modal mouse dismissal distinguishes a completed outside press from a pointer-induced focus move
to a focusable element. Tab follows the portal's logical trigger position and leaves focus at its
destination. `trap-focus` cycles Tab, hides the background from assistive technologies and permits
outside pointer interaction without scroll lock. A primary pointerdown releases the trap before the
subsequent click when there is no Backdrop. An authored Backdrop is verified as the actual pointer
target and waits for a completed press. The secondary press ends its case because WebKit can open a
system context menu.

Both fixtures request changes through the public Dialog APIs. The CSS case finishes the running browser
animation and waits for the public completion signal. See the
[Dialog matrix](../../../../packages/primitives/dialog/PARITY.md) for other evidence and pending cases.
