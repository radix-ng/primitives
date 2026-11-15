# Resolve Menu placement defaults from its Angular owner

- Status: Accepted
- Date: 2026-11-15
- Decision owners: Radix NG maintainers
- Related: [ADR 0012](0012-thin-positioners.md), `packages/primitives/menu`, `packages/primitives/popper`

## Context

The Menu API audit found that every Menu Positioner inherited bottom/center and the dropdown
collision preset. Explicit story/fixture placement hid the difference from Base UI. A retained
Menubar popup also needs to react when the bar changes orientation, so reading its owner once in
a provider factory is insufficient. Context Menu's point anchor needs its own offsets and shift
policy; the ordinary attachment limiter otherwise erases its two-pixel alignment offset.

Reference: Base UI 1.9.0 `cf696d6f6e08c699c5bda24d5a033430909f2285`,
`menu/positioner/MenuPositioner.tsx` and `internals/useAnchorPositioning.ts`.

## Decision

Keep thin positioner inheritance. The shared Popper wrapper owns aliased raw placement inputs
and computed effective values; getPositioningDefaults() is a reactive policy hook. Consumer bindings
retain side/align/offset/arrowPadding names, and resolved reads retain side()/align()/sideOffset()/
alignOffset()/arrowPadding(). An explicit zero wins; undefined restores the contextual default.

Menu resolves policy from its existing parentType/parentOrientation signals and shares Root's
direction with the wrapper through the existing direction DI token. It does not import Menubar or
Context Menu into Menu or copy their state.

| Owner              | Side       | Align  | Side/align offsets | Collision preset | Arrow padding default |
| ------------------ | ---------- | ------ | ------------------ | ---------------- | --------------------- |
| Standalone Menu    | bottom     | center | 0 / 0              | Dropdown         | 5                     |
| Submenu            | inline-end | start  | 0 / 0              | Popup            | 5                     |
| Horizontal Menubar | bottom     | start  | 0 / 0              | Dropdown         | 5                     |
| Vertical Menubar   | inline-end | start  | 0 / 0              | Dropdown         | 5                     |
| Context Menu       | bottom     | start  | -5 / 2             | Dropdown         | 0                     |

Context Menu's special offsets apply only when side is unset and alignment is not center.
Its shift policy follows the pin: enable side-axis shift unless an explicit collision object
requests side=flip, and omit the attachment limiter for that policy. Other Popper consumers keep
their existing shift policy and defaults.

## Consequences

Unconfigured submenus, Menubar and Context Menu change placement. Explicit placements remain
authoritative. Consumers styling physical right/left sides can use logical inline-end/inline-start
for the new defaults. Compodoc/consumer metadata publishes binding aliases and effective defaults;
public Menu prose supplies the conditional table that a single default cell cannot express.

This increment addresses contextual defaults only. A2's shared positionMethod/strategy, sticky and
collisionBoundary contracts remain open, as do Context Menu's forced arrow-padding and layout-viewport
policies for authored overrides/pinch zoom. They require separate consumer coverage and migration decisions.

## Validation

Three unit regressions first failed on the old defaults. Sixteen pinned browser scenarios compare
actual geometry, logical sides, LTR/RTL, explicit overrides, submenu perpendicular fallback and
orientation changes on retained Menubar views. Fixtures use native keyboard/right-click input;
F3 changes only application-owned bar orientation. No reference normalization or exception is added.

## Alternatives considered

- Static provider defaults: cannot follow a retained coordinator's orientation changes.
- Redeclare placement inputs on each positioner: duplicates the engine's contract and reintroduces
  the metadata/default drift removed by ADR 0012.
- Force fixture placement: conceals the missing default instead of verifying it.
