# Tabs follow the Base UI part set

`tabs` was realigned to `Root`/`List`/`Tab`/`Panel`/`Indicator` (newer no-suffix class names). Activation moved to the `List` (`activateOnFocus`, default **manual**) instead of the root; `data-active`/`data-hidden`/`data-activation-direction`/`data-starting-style`/`data-ending-style` replace `data-state`. `Panel` stays mounted and toggles `hidden` by default; `*rdxTabsPanelPresence="value"` on that same host owns and destroys the complete Panel view after exit. Use `keepMounted: true` on the structural directive to retain its whole view. `Indicator` exposes the active tab geometry as `--active-tab-*` CSS variables.

The [Tabs parity matrix](../../../packages/primitives/tabs/PARITY.md) records the pinned Base UI
source/API audit, Angular regression evidence, documented adaptations and remaining comparison gaps.

Inactive panels are immediately inert, including during exit. `data-ending-style` starts exit motion;
`data-hidden` follows actual hidden state for retained hosts. Structural presence owns the entire
Panel template: it supplies value and mounting policy, waits through the shared `PresenceMachine`,
and destroys the native host and Angular children after exit. Its generated ID belongs to the
structural instance and survives view recreation. A selection-driven exit hold keeps the outgoing
Panel visible until disposal; dropping `keepMounted` on an already-closed view starts no new exit.
The context is scoped to its own Root. See [ADR 0077](../../adr/0077-tabs-whole-panel-presence.md).
The public keyframe example uses `group-data-[ending-style]`; `data-hidden` is too late for an exit.

Activation direction is linked to the Root's model, so external changes reach every part without
emitting a user request. Geometry is read after rendering; a new destination keeps the committed
origin until registration/layout can resolve the value fallback. Null transitions and automatic
fallbacks use `none`; equal positions do not fall back to item indexes. Angular uses its native model
ownership: reject a user request with `eventDetails.cancel()` before commit rather than relying on a
parent to ignore a React-style controlled callback.

Tab and Panel IDs belong to native part instances, independently of selection values. Root registers
actual Panel IDs with ownership-safe cleanup; labels follow registered Tab IDs, including during SSR.
Both parts accept an `id` input. Structural view removal unregisters its native Panel target; remount restores its stable owner ID. [ADR 0074](../../adr/0074-tabs-native-identities.md) records the registration
policy and the authored-Panel-ID difference from the pin; ADR 0077 removes the former persistent-host difference. Indicator uses the
registered Tab element. Its render hooks measure selection and observe the current List and all tabs;
observers disconnect on collection/List changes and disposal. A missing or zero-size selection hides
the presentation host, including a persistent host at null. [ADR 0076](../../adr/0076-tabs-indicator-observation.md)
records the compared visibility/resize scope. [ADR 0078](../../adr/0078-tabs-indicator-coordinates.md)
adds List-local border/scroll/transform geometry through the pin's layout/rect agreement policy.
Continuous motion, real realms and hydration remain in the parity matrix.

Tab activation uses click requests: native Enter remains with the button/link, while custom Enter
and composite Space use the owned click dispatcher with modifiers. Space's button keyup default is
suppressed so it cannot retry a canceled request. Disabled tabs suppress defaults without native
disabling; automatic activation uses actual focusin. Paired pointer listeners use the owner document
and DestroyRef cleanup. [ADR 0075](../../adr/0075-tabs-native-activation.md) records the compared scope
and Angular's retained optional native trigger metadata.
