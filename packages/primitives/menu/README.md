# @radix-ng/primitives/menu

Current differential scope: 181 scenarios, 495 executable comparisons and 48 touch capability skips.
See [PARITY.md](PARITY.md) for the current contract and pending nested focus-out/finalFocus audits.

The notes below record individual implementation increments.

Touch input reuses the shared native pointer tracker. Menu classifies compatibility mousedown from
its owning trigger without replacing the event. Touch submenus open on mousedown and consume the
following click once; repeat taps close them. Disabled items prevent pointer focus while remaining
keyboard-focusable. Trigger data-pressed now follows the menu's open session; style native :active
if physical press feedback is needed.

Twenty-five trusted-touch scenarios add 44 executable comparisons. Menu now defines 122 scenarios /
366 planned comparisons, with 335 executed and 31 unsupported touch capability skips. Native events,
focus, values, scrolling and lifecycle remain compared. See [ADR 0049](../../../docs/adr/0049-menu-trusted-touch.md)
and [the matrix](PARITY.md) for exact macOS WebKit focus limits and remaining device/AT work.

Mixed input now follows the same accepted session across mouse, touch and keyboard. Enter/Space
closes a touch-opened child; a first tap promotes an arrow-opened child before a later tap closes it.
Forward-arrow entry and canceled touch promotion preserve the opening ARIA policy. Hover promotion
keeps the original scroll policy; a fresh touch opening chooses the small/wide policy again.

Seventeen new hybrid scenarios add 34 executable comparisons. The matrix now defines 139 cases /
417 planned comparisons: 369 executable and 48 touch capability skips. Exact source-event pairs
preserve Angular's original keydown/Pointer Events instead of manufacturing React-style callbacks.
See [ADR 0050](../../../docs/adr/0050-menu-hybrid-input.md) and [the matrix](PARITY.md).

Native host activation now shares the actual click path across Item, LinkItem, CheckboxItem,
RadioItem and SubTrigger. Enter on button/link stays with the browser; Space and custom-host Enter
use the existing modifier-preserving click helper. Keyup prevents duplicate activation. Public
keyboard change details therefore carry the activation click, replacing the previous keydown.
Space continues typeahead, and closing resets that query for retained reopening.

The Native Elements example uses normal Angular click handlers. Twenty-three host cases add 69
comparisons; the matrix now defines 162 cases / 486 planned comparisons, with 438 executable and
48 touch capability skips. The ten prior keyboard source-event pairs now match and were removed.
Initial keyboard focus on a disabled first item remains a separate pending audit. See
[ADR 0051](../../../docs/adr/0051-menu-native-host-activation.md).

Initial keyboard entry now selects the first/last enabled item, or Popup when every item is disabled.
Arrow/Home/End navigation still includes disabled items without activating them. The common initial
selector is shared by Popup and trigger recovery; SubTrigger stays in the parent's Tab order while
open. Shared bridge disposal preserves current Angular tabindex bindings when a popup is retained.

Initial Focus demonstrates disabled-first/all-disabled and keepMounted behavior. Thirteen new cases /
39 comparisons bring the matrix to 175 cases, 477 executable comparisons and 48 touch capability
skips. Nested Tab departure was subsequently covered by ADR 0053 below. See
[ADR 0052](../../../docs/adr/0052-menu-initial-focus-boundaries.md).

Nested Tab departure now follows the structural portal's logical declaration order through the
shared Floating Focus Manager. Forward Tab closes the chain or lands on a native control inside
the parent; Shift+Tab closes only the child and returns to SubTrigger. Initial Focus exposes this
path with Nested menu and Keep mounted toggles. Six new cases bring the current suite to 181 cases /
495 executable comparisons and 48 capability skips. One exact pin-only dropped child completion
extends the existing lifecycle exception. See [ADR 0053](../../../docs/adr/0053-menu-portal-tab-handoff.md)
and [the matrix](PARITY.md).
