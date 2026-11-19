# Dialog behavioral comparisons

```bash
pnpm test-parity dialog
pnpm test-parity dialog --grep touch-
```

The suite exercises real Angular Dialog parts and Base UI React 1.9.0 at the workspace pin
`cf696d6f6e08c699c5bda24d5a033430909f2285`.
The suite has 62 cases and reports native-input capability skips by engine. `expected-differences.json` records the focus
destination after nested owner removal and the payload of a new unassociated open after a named session.

| Area              | Cases | Behavior                                                                                                       |
| ----------------- | ----- | -------------------------------------------------------------------------------------------------------------- |
| Open ownership    | 5     | Initial and late defaults, controlled false, delayed parent acceptance and cancellation                        |
| Modal background  | 1     | Focus cycling, background isolation, scroll lock, outside press and restored background activation             |
| Other modal modes | 7     | Non-modal Tab and pointer focus departure, press timing, `trap-focus`, authored Backdrop and dismissal opt-out |
| Nested Dialogs    | 5     | Deepest dismissal, descendant counts, owner removal and a retained child with an animated exit                 |
| Mixed nesting     | 2     | Drawer-only styling counts, Popup autofocus, and Dialog or AlertDialog dismissal inside two Drawers            |
| Overlapping Roots | 5     | Independent focus and isolation, per-layer dismissal, authored and internal Backdrops, and retained Portals    |
| Detached handles  | 8     | Named and unassociated opens, live payloads, Trigger and Root remount, handle swap and controlled refusal      |
| Trigger identity  | 2     | Bound ID before the default, null fallback, active trigger removal and replacement                             |
| Focus targets     | 8     | Explicit and default focus, callback results, interaction type, Trigger removal and retained exits             |
| Touch             | 12    | Native taps, focus policy, scroll, pointer dismissal, cancellation and two-contact gestures                    |
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

Nested cases read each popup's computed `--nested-dialogs`, open-descendant attribute and Trigger
ARIA relationships. They record per-layer changes and completions, native focus and Backdrop
visibility. By default Angular hides the nested Backdrop view and Base UI omits its element. Both
show it when the consumer supplies `forceRender`. The retained case finishes a real CSS animation
and checks the child input after reopening.

When the application removes two open nested layers together, Angular focuses the still-open
parent Popup using its focus recovery policy. Base UI focuses the parent's outside Trigger.
The exception covers that single focus checkpoint. Both clear descendant styling and dismiss the
remaining Dialog on Escape.

The mixed cases open a Dialog or AlertDialog inside two Drawers. Only the nested Drawer contributes
to the Drawer styling count. Each Drawer focuses its Popup on open. The leaf uses the Dialog focus
default. An outside click closes the Dialog leaf and preserves the AlertDialog leaf. Escape closes
one layer at a time and returns focus to each trigger.

Three independent modal Roots each return focus to the launcher when closed. The overlapping cases
check Tab wrapping, one close per Escape or Backdrop click, and continuous background isolation and
scroll lock. Angular exposes the active retained Popup. Base UI can leave it aria-hidden while
focusing its controls, so the report includes the actual isolation attributes.

The detached fixtures keep Trigger elements outside Root and call the public handle actions. They
inspect live rendered payloads, each handle's open state, active Trigger relationships, native
focus and callback details. Removal preserves the open dialog's payload. A replacement Trigger with
the same ID supplies its current value. The swap waits until the second handle reports attachment
before calling the first handle again.

The focus cases use `initialFocus` and `finalFocus` on the public Popup. They retain native focus
destinations and callback interaction types, including the `true`, `null`, `false`, and `undefined`
policies. The retained Popup compares focus during a real CSS animation, after completion, and on
reopen with the same draft value. An additional case removes the active Trigger before closing to
the explicit final target.

Touch fixtures use Playwright touch contexts for taps and Chromium CDP for panning, cancellation
and two-contact input. They retain trusted events, native click pointer types and active/released
contact counts. The browser checks cover initial focus, backdrop dismissal and click-through,
scrolling inside and outside the Popup, canceled contact and partial release of a two-finger
gesture. Seven cases run in Chromium and WebKit. Five gesture cases run in Chromium. Firefox touch
and WebKit gestures are explicit capability skips.

Both fixtures request changes through the public Dialog APIs. The CSS case finishes the running browser
animation and waits for the public completion signal. See the
[Dialog matrix](../../../../packages/primitives/dialog/PARITY.md) for other evidence and pending cases.
