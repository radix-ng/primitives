# Share Base UI collision boundaries through Popper

- Status: Accepted
- Date: 2026-11-15
- Decision owners: Radix NG maintainers
- Related: [ADR 0012](0012-thin-positioners.md), [ADR 0067](0067-menu-contextual-positioning.md), `packages/primitives/popper`, `packages/primitives/menu`

## Context

The Menu audit found that the shared collision boundary input accepted only ElementRef values and
resolved an unset input to an empty boundary array. The Base UI 1.9.0 pin
`cf696d6f6e08c699c5bda24d5a033430909f2285` accepts clipping-ancestors, native elements/arrays and
viewport-coordinate rectangles. Its default clips against the floating element's real ancestry.
Portaling to body and portaling into an overflow container therefore have different default bounds.

## Decision

Expose RdxCollisionBoundary from the existing Popper entry. It accepts the pinned boundary forms
plus ElementRef<Element> and mixed element/ElementRef arrays. The wrapper unwraps Angular references
and maps clipping-ancestors to Floating UI's clippingAncestors. Native elements and rectangles are
passed through to the existing flip, shift and size middleware. No new geometry engine or realm-based
HTMLElement check is added.

Default and undefined resolve to clipping-ancestors. Use the positioner's ancestry, not the reference's
(altBoundary=false), matching the pin. An explicit empty array selects viewport-only collision checks.
That option cannot remove the browser's native CSS overflow clipping.

Rectangle x/y/width/height are viewport-relative CSS pixels. Replacing an input value causes a new
position calculation; mutating a previously supplied object/array without a reactive update is not
a notification mechanism. Available-space CSS variables use the same boundary as flip and shift.

## Migration and scope

Positioners in clipping containers can now flip/shift where they previously used viewport bounds.
Pass collisionBoundary=[] to retain the earlier viewport-only collision policy. Existing ElementRef
bindings remain supported. Strategy defaults, sticky and forced Context Menu overrides were addressed
subsequently in [ADR 0069](0069-popper-position-method-and-sticky.md). Context Menu pinch-zoom policy
was separate A2 work, subsequently addressed in [ADR 0070](0070-layout-viewport-shift.md); this decision
does not close the whole Menu audit.

## Validation

Nine focused wrapper regressions cover defaults/reset, native elements, references, mixed arrays,
empty arrays, rectangles, cross-realm element forwarding and replacement of a native DOMRect.
Seven assertions failed on the old implementation before the fix; the empty-array case already passed.

Fourteen pinned scenarios cover local/body portals, element/array/rectangle bounds, scaled containers,
available height and application-owned boundary replacement while open. The non-transformed local
container case authors absolute positioning in both fixtures to isolate this contract from the pending
strategy-default difference. All other local cases have a containing block. F3 changes only application
boundary data; native pointer selection verifies that the resulting menu remains usable.

Rectangle fixtures snapshot measured DOMRect coordinates into ordinary Rect records in both apps.
An exploratory DOMRect replacement left the pin at its old boundary: @floating-ui/react-dom's deep
comparison sees no enumerable coordinate keys on DOMRect. Angular follows the replacement through its
signal; a unit regression preserves that behavior. The pinned cases certify ordinary Rect updates,
not equivalence for that native DOMRect edge case. No reference output or exception is rewritten.
The cross-realm unit establishes value forwarding only, not cross-document layout/portal parity.

## Alternatives considered

- Menu-specific boundary handling: duplicates shared positioning policy across other consumers.
- Keep viewport-only defaults: leaves the documented clipping-ancestors behavior unimplemented.
- Copy React's object-comparison behavior: introduces a framework workaround and loses native signal updates.
