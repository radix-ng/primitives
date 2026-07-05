# Popper

#### Positions floating content relative to an anchor.

Popper is a low-level, headless positioning primitive built on Floating UI. It is useful when building tooltips,
popovers, selects, dropdowns, and other floating interfaces. It does not control visibility or render a portal:
compose it with `Presence` and `Portal` when those behaviors are needed.

## Features

- Supports `top`, `right`, `bottom`, and `left` placement with `start`, `center`, or `end` alignment.
- Flips and shifts content to avoid collisions with viewport or custom boundaries.
- Exposes placement state through `data-side` and `data-align`.
- Provides CSS custom properties for transform origin, available space, and anchor dimensions.
- Supports default and custom arrow content.
- Uses optimized position updates by default, with frame-by-frame updates available for moving anchors.

## Anatomy

```html
<div rdxPopperRoot>
    <button rdxPopperAnchor>Anchor</button>

    <div side="top" sideOffset="8" rdxPopperContentWrapper>
        <div rdxPopperContent>Floating content</div>
        <span rdxPopperArrow></span>
    </div>
</div>
```

`rdxPopperContentWrapper` owns positioning and should wrap the visible content. Apply animation classes and read
`data-side` or `data-align` from the inner `rdxPopperContent` element.

## Placement

Use `side`, `align`, `sideOffset`, and `alignOffset` to control the preferred position. When `avoidCollisions` is
enabled, the final placement may differ from the preferred placement.

The Default story exposes these values as controls.

```html
<div
    class="border-border bg-muted flex h-48 w-80 items-center justify-center rounded-xl border border-dashed"
    rdxPopperRoot
>
    <button
        class="border-primary bg-primary text-primary-foreground focus-visible:ring-ring focus-visible:ring-offset-background inline-flex h-10 min-w-28 items-center justify-center rounded-lg border px-4 text-sm font-semibold shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        type="button"
        rdxPopperAnchor
    >
        Anchor
    </button>
    <div ${argsToTemplate(args)} rdxPopperContentWrapper>
        <div
            class="border-border bg-popover text-popover-foreground max-w-56 [transform-origin:var(--radix-popper-transform-origin)] rounded-lg border px-3.5 py-3 text-sm leading-5 shadow-md"
            rdxPopperContent
        >
            Positioned relative to the anchor
        </div>
        <span class="text-popover my-px drop-shadow-[0_1px_0_var(--color-border)]" rdxPopperArrow></span>
    </div>
</div>
```

## Arrow

Add `rdxPopperArrow` inside the wrapper to render an arrow. The default arrow is an SVG, but projected content can
replace its visual shape.

```html
<div
    class="border-border bg-muted flex h-48 w-80 items-center justify-center rounded-xl border border-dashed"
    rdxPopperRoot
>
    <button
        class="border-primary bg-primary text-primary-foreground focus-visible:ring-ring focus-visible:ring-offset-background inline-flex h-10 min-w-28 items-center justify-center rounded-lg border px-4 text-sm font-semibold shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        type="button"
        rdxPopperAnchor
    >
        Anchor
    </button>
    <div side="top" sideOffset="8" rdxPopperContentWrapper>
        <div
            class="border-border bg-popover text-popover-foreground max-w-56 [transform-origin:var(--radix-popper-transform-origin)] rounded-lg border px-3.5 py-3 text-sm leading-5 shadow-md"
            rdxPopperContent
        >
            The arrow can project custom content
        </div>
        <span class="fill-popover" rdxPopperArrow>
            <div class="bg-popover h-2.5 w-5 rounded-b-full"></div>
        </span>
    </div>
</div>
```

```html
<span rdxPopperArrow>
    <div class="custom-arrow"></div>
</span>
```

## Moving Anchors

The default `updatePositionStrategy` is `optimized`. It updates on events such as scroll, resize, and layout shifts
without running position calculations on every animation frame.

Use `updatePositionStrategy="always"` when the anchor moves continuously through CSS transforms, animation, pointer
tracking, or slider dragging. This enables animation-frame updates while the popper is mounted.

```html
<popper-upd-position />
```

The next example moves the anchor with the pointer and uses the same `always` strategy.

```html
<popper-follow-pointer />
```

```html
<div updatePositionStrategy="always" rdxPopperContentWrapper>
    <div rdxPopperContent>Content that follows a moving anchor</div>
</div>
```

## CSS Variables

`rdxPopperContentWrapper` exposes the following CSS custom properties:

| Variable                            | Description                                      |
| ----------------------------------- | ------------------------------------------------ |
| `--radix-popper-transform-origin`   | Origin for scale or reveal animations.           |
| `--radix-popper-available-width`    | Available width inside the collision boundary.   |
| `--radix-popper-available-height`   | Available height inside the collision boundary.  |
| `--radix-popper-anchor-width`       | Current width of the anchor.                     |
| `--radix-popper-anchor-height`      | Current height of the anchor.                    |

## API Reference

### RdxPopper

`[rdxPopperRoot]` establishes the positioning context: it collects the nested `RdxPopperAnchor` and lets
a primitive override the reference with a virtual element. It has no inputs.

### RdxPopperAnchor

`[rdxPopperAnchor]` marks the element the content is positioned against. It has no inputs.

### RdxPopperContentWrapper

### RdxPopperContent

`[rdxPopperContent]` reflects the resolved `data-side` / `data-align` from the wrapper and suppresses
animations until the content has been placed. It has no inputs.

### RdxPopperArrow
