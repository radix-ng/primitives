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
register reactively. Panel exposes its ID and tri-state keepMounted/hiddenUntilFound overrides.
The actual pinned mapper exposes Panel `data-closed`, Trigger `data-index` and inherited orientation/
hidden state; closed findable Panels also retain starting style. The earlier claim that Panel had no
closed state, that Trigger had no index, or that native disabled Triggers remained focusable was stale.

Complete Panel view ownership and motion/measurement/hydration remain open. Current behavior,
priorities and evidence are maintained in [the Accordion matrix](../../../packages/primitives/accordion/PARITY.md)
and [its paired suite](../../../apps/parity-testing/primitives/accordion/README.md).
