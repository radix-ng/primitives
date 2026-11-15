# Tabs follow the Base UI part set

`tabs` was realigned to `Root`/`List`/`Tab`/`Panel`/`Indicator` (newer no-suffix class names). Activation moved to the `List` (`activateOnFocus`, default **manual**) instead of the root; `data-active`/`data-hidden`/`data-activation-direction`/`data-starting-style`/`data-ending-style` replace `data-state`. `Panel` stays mounted and toggles `hidden` by default; `*rdxTabsPanelPresence` opts into real unmount with exit animations (Tabs keeps this two-directive presence pattern; Collapsible/Accordion dropped theirs — see the Collapsible note above). `Indicator` exposes the active tab geometry as `--active-tab-*` CSS variables.

The [Tabs parity matrix](../../../packages/primitives/tabs/PARITY.md) records the pinned Base UI
source/API audit, Angular regression evidence, documented adaptations and remaining comparison gaps.

Inactive panels are immediately inert, including during exit. `data-ending-style` starts exit motion;
`data-hidden` follows actual hidden state after motion finishes. `TabsPanelPresence` adapts the shared
`PresenceMachine` to observe the panel host and its descendants because its embedded view lives inside
that host. The panel tracks registered content lifetimes so an ending view stays visible and inert
until removal, and the persistent empty host becomes hidden afterward. The public keyframe example
uses `group-data-[ending-style]`; using `data-hidden` as an exit trigger is too late.

Activation direction is linked to the Root's model, so external changes reach every part without
emitting a user request. Geometry is read after rendering; a new destination keeps the committed
origin until registration/layout can resolve the value fallback. Null transitions and automatic
fallbacks use `none`; equal positions do not fall back to item indexes. Angular uses its native model
ownership: reject a user request with `eventDetails.cancel()` before commit rather than relying on a
parent to ignore a React-style controlled callback.
