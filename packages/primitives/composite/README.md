# @radix-ng/primitives/composite

Base UI-style composite list and navigation primitives for ordered item metadata and roving focus.

Items register after view rendering in `earlyRead`. Roving focus follows the highlighted native
element across collection changes; an eligible replacement at the same index can retain its tab stop.
When Angular moves a focused existing view, observed removal/reinsertion preserves that native focus.
Removed views, deliberate blur and outside focus do not regain focus. All observers/listeners are
owned by the directive lifetime. See [ADR 0079](../../../docs/adr/0079-tabs-collection-consistency.md).
