# ADR 0002: Align the Popper Arrow with Base UI (stop hiding the uncentered arrow)

- Status: Proposed
- Date: 2026-06-02
- Decision owners: Radix NG maintainers
- Related package: `packages/primitives/popper` (consumers: `tooltip`, `popover`, and any future Popper user)

## Context

`RdxPopperArrow` positions an arrow against the anchor using the Floating UI `arrow` middleware. The
middleware reports a `centerOffset`: the number of pixels by which the arrow had to move away from the
center of the popup (for example when the popup was shifted to avoid a collision, or when alignment is
`start` / `end`).

The current implementation hides the arrow whenever it is not perfectly centered:

```ts
// packages/primitives/popper/src/popper-content-wrapper.ts
readonly shouldHideArrow = computed(
    () => this.position.value()?.middlewareData['arrow']?.centerOffset !== 0
);
```

`RdxPopperArrow` then applies `visibility: hidden` based on `shouldHideArrow`. This is the original
**Radix UI** behavior and was inherited when the library was first ported.

During the Tooltip → Base UI migration we added `data-uncentered` to the tooltip arrow (and exposed
`arrowUncentered` on `RdxPopperContentWrapper`) to match Base UI. The data attribute is computed
correctly, but it is set on an element that the Popper has already hidden, so an uncentered arrow can
never actually be seen or styled. This is a behavioral mismatch with our primary reference.

[Base UI](https://base-ui.com/) keeps the arrow mounted and visible when it cannot be centered and
instead exposes `data-uncentered` so consumers decide how to style it. See the Tooltip / Popover
`Arrow` parts and their `data-uncentered` state.

## Decision (proposed)

Move `RdxPopperArrow` from the Radix "hide when uncentered" behavior to the Base UI "keep visible,
expose `data-uncentered`" behavior:

1. Stop forcing `visibility: hidden` on the arrow purely because `centerOffset !== 0`.
2. Keep exposing `arrowUncentered` from `RdxPopperContentWrapper` (already added).
3. Surface `data-uncentered` from `RdxPopperArrow` itself (currently only the Tooltip arrow wrapper
   sets it), so every consumer gets it consistently.
4. Preserve a genuine "hide the arrow" path only for the cases where the arrow legitimately should not
   render (e.g. the `hide` middleware / `referenceHidden`), not for normal off-center positioning.

This is intentionally **deferred**, not done now, because it changes shared Popper behavior used by
`popover` and `tooltip` and must be validated against each consumer.

## Consequences

### Positive

- The Popper arrow matches Base UI; `data-uncentered` becomes usable instead of dead state.
- Consumers can style off-center arrows (or hide them themselves) rather than getting a silent disappear.
- Removes a surprising, undocumented "arrow vanishes near screen edges" effect.

### Negative / Risks

- Behavior change for existing consumers: arrows that previously disappeared near collisions will now
  stay visible. Popover and Tooltip demos/snapshots may need review.
- Consumers relying (knowingly or not) on the current hide-on-uncenter behavior would need to opt back
  in via `data-uncentered` styling.
- Requires a visual pass on every Popper consumer before release.

## Alternatives Considered

### Keep the current Radix behavior

No work, but `data-uncentered` stays non-functional and the library diverges from Base UI on a part we
just migrated.

### Make it configurable on the Popper

Add an input such as `hideArrowWhenUncentered`. Avoids a hard behavior change but adds API surface and
keeps a non-Base-UI default. Reconsider only if a consumer genuinely needs the Radix behavior.

### Override only in Tooltip

Let the Tooltip arrow opt out of hiding while leaving the Popper default. Rejected: it splits arrow
behavior across primitives and does not fix Popover or future consumers.

## Migration Plan (when picked up)

1. Change `RdxPopperContentWrapper` / `RdxPopperArrow` so off-center no longer means hidden; keep the
   `referenceHidden` hide path.
2. Move `data-uncentered` onto `RdxPopperArrow` so all consumers inherit it.
3. Review and adjust Popover and Tooltip stories/docs and any snapshots.
4. Document `data-uncentered` in the theming/accessibility guides and per-primitive docs.

## Trigger for Revisit

Revisit / implement this ADR when:

- doing a focused pass on Popover/Tooltip arrow visual parity with Base UI;
- a consumer reports the arrow disappearing near viewport edges;
- adding a new Popper consumer that needs arrow styling for off-center placement;
- making any other breaking change to `@radix-ng/primitives/popper`.
