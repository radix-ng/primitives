# Scroll Area

A native scroll container with a custom, cross-browser scrollbar.

> Index — full source of each example is one click away in `../examples/scroll-area--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Native scrolling preserved — keyboard, touch, momentum, and `scroll` semantics all work.
- ✅ Custom scrollbar and thumb with cross-browser consistency (native scrollbar hidden).
- ✅ Draggable thumb, click-to-page on the track, and wheel support on the scrollbar.
- ✅ Independent vertical and horizontal scrollbars, plus a `Corner` where they meet.
- ✅ Rich styling state: `data-scrolling`, `data-hovering`, `data-has-overflow-x/y`, and per-edge `data-overflow-*-start/end`.
- ✅ Edge-distance CSS variables (`--scroll-area-overflow-*`) for masks and fade effects.
- ✅ CSP nonce support through Angular's `CSP_NONCE` injection token.
- ✅ RTL aware and SSR safe.

## Import

```typescript
import {
    RdxScrollAreaRoot,
    RdxScrollAreaViewport,
    RdxScrollAreaContent,
    RdxScrollAreaScrollbar,
    RdxScrollAreaThumb,
    RdxScrollAreaCorner
} from '@radix-ng/primitives/scroll-area';
```

Or import the module:

```typescript
import { RdxScrollAreaModule } from '@radix-ng/primitives/scroll-area';
```

## Anatomy

Assemble the scroll area from its parts. The `Viewport` is the actual scrollable element and must wrap
the `Content`; each `Scrollbar` hosts a `Thumb`, and the optional `Corner` fills the intersection when
both scrollbars are present.

```html
<div rdxScrollAreaRoot>
    <div rdxScrollAreaViewport>
        <div rdxScrollAreaContent>
            <!-- scrollable content -->
        </div>
    </div>

    <div rdxScrollAreaScrollbar orientation="vertical">
        <div rdxScrollAreaThumb></div>
    </div>

    <div rdxScrollAreaScrollbar orientation="horizontal">
        <div rdxScrollAreaThumb></div>
    </div>

    <div rdxScrollAreaCorner></div>
</div>
```

## Examples

- [Horizontal](../examples/scroll-area--horizontal.md)
- [Both scrollbars](../examples/scroll-area--both-scrollbars.md)
- [Gradient scroll fade](../examples/scroll-area--gradient-scroll-fade.md)
- [Combining with Tabs](../examples/scroll-area--combining-with-tabs.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/scroll-area.json`
- Styling (parts + `data-*`): `references/styling-contract/scroll-area.json`
