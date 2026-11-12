# @radix-ng/primitives/menu

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
