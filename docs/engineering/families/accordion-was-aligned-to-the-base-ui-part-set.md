# Accordion Base UI contract

Accordion exposes Root, Item, Header, Trigger and Panel with per-part boolean state attributes.
Root selection, defaults and request values are arrays in both single and multiple modes; arbitrary
Item values use reference/value identity, with generated identities when omitted. A defined value
input owns selection; uncontrolled defaults are initial-only. Two-way binding uses `valueChange`.

Item `onOpenChange` is the first cancelable request, followed by Root `onValueChange` with the same
event/details and then an accepted commit. External value changes and sibling closure do not emit
Item requests. Search reveal enters this same transaction through Collapsible's composition adapter.

Trigger composes shared Button behavior: native buttons default to button type, disabled native
buttons use native disabled, and non-native hosts get keyboard/ARIA/tab-order adaptation. Trigger IDs
register reactively. Panel exposes its ID. Required `*rdxAccordionPanelPresence` owns the complete view and its
tri-state keepMounted/hiddenUntilFound options, inheriting Root policy. It reuses the Item
Collapsible lifecycle; native Collapsible detachment is disabled for the matching structural owner.
The actual pinned mapper exposes Panel `data-closed`, Trigger `data-index` and inherited orientation/
hidden state; closed findable Panels also retain starting style. The earlier claim that Panel had no
closed state, that Trigger had no index, or that native disabled Triggers remained focusable was stale.

Complete view ownership follows [ADR 0087](../../adr/0087-accordion-whole-panel-presence.md).
Panels measure scroll sizes during motion and return both size variables to auto afterward.
Close captures current content before ending styles. Initial-open keyframes are suppressed in SSR
and client markup; search reveals skip one motion and restore authored duration before close.
Basic reverse-island/default and eager-retained client hydration cases now preserve server nodes,
IDs and pre-bootstrap edits. Remaining author-style/find/hydration combinations are tracked below. Current behavior,
priorities and evidence are maintained in [the Accordion matrix](../../../packages/primitives/accordion/PARITY.md)
and [its paired suite](../../../apps/parity-testing/primitives/accordion/README.md).
