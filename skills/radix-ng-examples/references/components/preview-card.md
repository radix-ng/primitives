# Preview Card

A popup that appears when a link is hovered or focused, showing a visual preview.

> Index — full source of each example is one click away in `../examples/preview-card--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Aligns with Base UI `PreviewCard` anatomy and interaction semantics.
- ✅ Uses a virtual root via `ng-container[rdxPreviewCardRoot]`, so layout is not affected.
- ✅ Opens from hover or focus with per-trigger `delay` and `closeDelay`.
- ✅ Supports detached triggers, multiple triggers, controlled state, and controlled trigger ids.
- ✅ Supports portaled content, custom positioning, arrows, and viewport content transitions.
- ✅ Exposes state, transition, placement, and anchor measurement attributes and CSS variables for styling.
- ✅ Keeps hover-opened content interactive with a polygon grace area, including nested popup content.

## Import

<Source
  type="code"
  language="typescript"
  code={`import {
  RdxPreviewCardRoot,
  RdxPreviewCardTrigger,
  RdxPreviewCardPortal,
  RdxPreviewCardBackdrop,
  RdxPreviewCardPositioner,
  RdxPreviewCardPopup,
  RdxPreviewCardArrow,
  RdxPreviewCardViewport
} from '@radix-ng/primitives/preview-card';`}
/>

## Anatomy

Apply the parts to your own markup. The root is virtual; `rdxPreviewCardPortal` is a **structural**
directive that teleports the content into `document.body` while the card is open and keeps it mounted
until any closed-state CSS exit keyframes on its root element finish.

Use the `*` microsyntax on the positioner for the common single-root case:

```html
<ng-container rdxPreviewCardRoot>
  <a href="#" rdxPreviewCardTrigger>Preview link</a>

  <div *rdxPreviewCardPortal rdxPreviewCardPositioner>
    <div rdxPreviewCardPopup>
      <span rdxPreviewCardArrow></span>
      <div rdxPreviewCardViewport>Preview content</div>
    </div>
  </div>
</ng-container>
```

When the content has more than one root node — for example an optional `rdxPreviewCardBackdrop` next
to the positioner — use the explicit `<ng-template rdxPreviewCardPortal>` form (and the same form with
`[container]` for a custom portal target):

```html
<ng-template rdxPreviewCardPortal>
  <div rdxPreviewCardBackdrop></div>
  <div rdxPreviewCardPositioner>
    <div rdxPreviewCardPopup>…</div>
  </div>
</ng-template>
```

## Examples

- [Controlled Multiple](../examples/preview-card--controlled-multiple.md)
- [Detached](../examples/preview-card--detached.md)
- [Positioning](../examples/preview-card--positioning.md)
- [Viewport](../examples/preview-card--viewport.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/preview-card.json`
- Styling (parts + `data-*`): `references/styling-contract/preview-card.json`
