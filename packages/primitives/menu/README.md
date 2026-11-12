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
