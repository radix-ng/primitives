# Scroll Area

#### A native scroll container with a custom, cross-browser scrollbar.

Headless scroll area modeled on [Base UI](https://base-ui.com/react/components/scroll-area). It keeps
the browser's native scrolling — momentum, keyboard, and accessibility — while hiding the platform
scrollbar and letting you style your own. It carries no styles; the scrollbars in the examples are
plain Tailwind utilities driven by `data-*` attributes and CSS variables.

```html
<div class="border-border bg-background h-64 w-56 overflow-hidden rounded-md border" rdxScrollAreaRoot>
    <div class="h-full w-full rounded-[inherit]" rdxScrollAreaViewport>
        <div class="p-4" rdxScrollAreaContent>
            <div class="text-foreground mb-2 text-sm font-medium">Tags</div>
            @for (tag of tags; track tag) {
            <div class="border-border text-foreground border-t py-1.5 text-sm">{{ tag }}</div>
            }
        </div>
    </div>

    <div class="flex w-2.5 touch-none p-0.5 select-none" rdxScrollAreaScrollbar orientation="vertical">
        <div
            class="bg-foreground/30 hover:bg-foreground/50 w-full rounded-full transition-colors"
            rdxScrollAreaThumb
        ></div>
    </div>
</div>
```

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

The hero above shows the default vertical setup: a single scrollbar over a tall list, where the thumb
is sized from the viewport-to-content ratio and the track stays hidden until the content is measured.

### Horizontal

A horizontal scrollbar for a row of items that overflows on the x-axis.

```html
<div class="border-border bg-background w-80 overflow-hidden rounded-md border" rdxScrollAreaRoot>
    <div class="w-full rounded-[inherit]" rdxScrollAreaViewport>
        <div class="flex gap-3 p-3" rdxScrollAreaContent>
            @for (item of items; track item) {
            <figure class="shrink-0">
                <div
                    class="bg-muted text-foreground flex h-28 w-28 items-center justify-center rounded-md text-2xl font-semibold"
                >
                    {{ item }}
                </div>
            </figure>
            }
        </div>
    </div>

    <div class="flex h-2.5 touch-none p-0.5 select-none" rdxScrollAreaScrollbar orientation="horizontal">
        <div
            class="bg-foreground/30 hover:bg-foreground/50 h-full rounded-full transition-colors"
            rdxScrollAreaThumb
        ></div>
    </div>
</div>
```

### Both scrollbars

When content overflows on both axes, render two `Scrollbar` parts and a `Corner` to fill the gap where
they meet.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxScrollAreaContent,
    RdxScrollAreaCorner,
    RdxScrollAreaRoot,
    RdxScrollAreaScrollbar,
    RdxScrollAreaThumb,
    RdxScrollAreaViewport
} from '@radix-ng/primitives/scroll-area';

const html = String.raw;

/**
 * A scroll area that overflows on both axes. The `Corner` part fills the gap where
 * the vertical and horizontal scrollbars meet.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'scroll-area-both-example',
    imports: [
        RdxScrollAreaRoot,
        RdxScrollAreaViewport,
        RdxScrollAreaContent,
        RdxScrollAreaScrollbar,
        RdxScrollAreaThumb,
        RdxScrollAreaCorner
    ],
    template: html`
        <div class="border-border bg-background h-64 w-72 overflow-hidden rounded-md border" rdxScrollAreaRoot>
            <div class="h-full w-full rounded-[inherit]" rdxScrollAreaViewport>
                <div class="flex w-max gap-2 p-3" rdxScrollAreaContent>
                    @for (col of columns; track col) {
                    <div class="flex flex-col gap-2">
                        @for (row of rows; track row) {
                        <div
                            class="bg-muted text-foreground flex h-10 w-14 items-center justify-center rounded-md text-xs font-medium"
                        >
                            {{ col * rows.length + row + 1 }}
                        </div>
                        }
                    </div>
                    }
                </div>
            </div>

            <div
                class="data-[scrolling]:bg-muted/40 flex w-2.5 touch-none p-0.5 transition-opacity select-none"
                rdxScrollAreaScrollbar
                orientation="vertical"
            >
                <div
                    class="bg-foreground/30 hover:bg-foreground/50 w-full rounded-full transition-colors"
                    rdxScrollAreaThumb
                ></div>
            </div>

            <div
                class="data-[scrolling]:bg-muted/40 flex h-2.5 touch-none p-0.5 transition-opacity select-none"
                rdxScrollAreaScrollbar
                orientation="horizontal"
            >
                <div
                    class="bg-foreground/30 hover:bg-foreground/50 h-full rounded-full transition-colors"
                    rdxScrollAreaThumb
                ></div>
            </div>

            <div class="bg-muted/40" rdxScrollAreaCorner></div>
        </div>
    `
})
export class ScrollAreaBothExample {
    readonly columns = Array.from({ length: 10 }, (_, i) => i);
    readonly rows = Array.from({ length: 20 }, (_, i) => i);
}
```

### Gradient scroll fade

Feed the viewport's `--scroll-area-overflow-y-start` / `--scroll-area-overflow-y-end` variables (the
pixel distance to each edge) into a `mask-image` gradient. Each fade disappears as you reach the
matching edge.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxScrollAreaContent,
    RdxScrollAreaRoot,
    RdxScrollAreaScrollbar,
    RdxScrollAreaThumb,
    RdxScrollAreaViewport
} from '@radix-ng/primitives/scroll-area';

const html = String.raw;

/**
 * Fades the content near the scroll edges by feeding the viewport's
 * `--scroll-area-overflow-y-start` / `--scroll-area-overflow-y-end` CSS variables
 * (the distance in px to each edge) into a `mask-image` gradient. The fade
 * disappears once you reach an edge because the matching variable becomes `0px`.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'scroll-area-gradient-example',
    imports: [
        RdxScrollAreaRoot,
        RdxScrollAreaViewport,
        RdxScrollAreaContent,
        RdxScrollAreaScrollbar,
        RdxScrollAreaThumb
    ],
    template: html`
        <div class="border-border bg-background h-56 w-72 overflow-hidden rounded-md border" rdxScrollAreaRoot>
            <div
                class="h-full w-full rounded-[inherit] [mask-image:linear-gradient(to_bottom,transparent,#000_var(--scroll-area-overflow-y-start,0px),#000_calc(100%-var(--scroll-area-overflow-y-end,0px)),transparent)]"
                rdxScrollAreaViewport
            >
                <div class="text-foreground space-y-3 p-4 text-sm leading-relaxed" rdxScrollAreaContent>
                    @for (paragraph of paragraphs; track $index) {
                    <p>{{ paragraph }}</p>
                    }
                </div>
            </div>

            <div class="flex w-2.5 touch-none p-0.5 select-none" rdxScrollAreaScrollbar orientation="vertical">
                <div
                    class="bg-foreground/30 hover:bg-foreground/50 w-full rounded-full transition-colors"
                    rdxScrollAreaThumb
                ></div>
            </div>
        </div>
    `
})
export class ScrollAreaGradientExample {
    readonly paragraphs = [
        'Scroll areas keep the native scroll behavior — momentum, keyboard, and accessibility — while letting you style a custom scrollbar.',
        'The viewport exposes the distance to each edge as a CSS variable, so effects like this gradient fade react to the exact scroll position.',
        'Because the variables report pixels-from-edge, the top fade vanishes when you reach the top and the bottom fade vanishes at the very end.',
        'The scrollbar and thumb are headless: every visual decision here is a Tailwind utility, driven only by the data attributes and CSS variables.',
        'Try scrolling to the middle — both gradients are visible. Scroll to either end and watch the corresponding fade disappear.',
        'Everything you see is composed from Root, Viewport, Content, Scrollbar, and Thumb. No styles ship inside the primitive itself.'
    ];
}
```

### Combining with Tabs

Stack `rdxTabsList` and `rdxScrollAreaViewport` on the same element so the tab list _is_ the scrollable
viewport (the Angular equivalent of Base UI's `render` prop). Keeping the scroll state on that element
lets a horizontal `mask-image` fade the tabs at whichever edge still has more to reveal.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxScrollAreaRoot, RdxScrollAreaViewport } from '@radix-ng/primitives/scroll-area';
import { RdxTabsIndicator, RdxTabsList, RdxTabsPanel, RdxTabsRoot, RdxTabsTab } from '@radix-ng/primitives/tabs';

const html = String.raw;

/**
 * Combining Scroll Area with Tabs. The Angular equivalent of Base UI's `render` prop is stacking
 * both directives on a single element: `rdxTabsList` + `rdxScrollAreaViewport` make the tab list
 * itself the scrollable viewport. Because the scroll state (and the `--scroll-area-overflow-x-*`
 * variables) live on that same element, a horizontal `mask-image` gradient fades the tabs at
 * whichever edge still has more tabs to reveal.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'scroll-area-tabs-example',
    imports: [
        RdxScrollAreaRoot,
        RdxScrollAreaViewport,
        RdxTabsRoot,
        RdxTabsList,
        RdxTabsTab,
        RdxTabsPanel,
        RdxTabsIndicator
    ],
    template: html`
        <div
            class="border-border bg-background text-foreground w-80 overflow-hidden rounded-md border"
            rdxTabsRoot
            defaultValue="overview"
        >
            <div class="border-border border-b" rdxScrollAreaRoot>
                <div
                    class="relative flex w-full [mask-image:linear-gradient(to_right,transparent,#000_var(--scroll-area-overflow-x-start,0px),#000_calc(100%-var(--scroll-area-overflow-x-end,0px)),transparent)]"
                    rdxTabsList
                    rdxScrollAreaViewport
                >
                    @for (tab of tabs; track tab.value) {
                    <button
                        class="text-muted-foreground hover:text-foreground focus-visible:ring-ring data-[active]:text-foreground shrink-0 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2"
                        rdxTabsTab
                        [value]="tab.value"
                    >
                        {{ tab.label }}
                    </button>
                    }

                    <!-- Lives inside the scrolling list, so it tracks the active tab even while scrolled. -->
                    <span
                        class="bg-primary pointer-events-none absolute bottom-0 left-[var(--active-tab-left)] h-0.5 w-[var(--active-tab-width)] transition-all duration-300 ease-out"
                        rdxTabsIndicator
                    ></span>
                </div>
            </div>

            @for (tab of tabs; track tab.value) {
            <div class="p-4 text-sm leading-6 outline-none" rdxTabsPanel [value]="tab.value">{{ tab.content }}</div>
            }
        </div>
    `
})
export class ScrollAreaTabsExample {
    readonly tabs = [
        { value: 'overview', label: 'Overview', content: 'A high-level summary of your workspace.' },
        { value: 'activity', label: 'Activity', content: 'Everything that happened recently.' },
        { value: 'settings', label: 'Settings', content: 'Preferences for this workspace.' },
        { value: 'members', label: 'Members', content: 'People with access to the workspace.' },
        { value: 'integrations', label: 'Integrations', content: 'Connect third-party services.' },
        { value: 'billing', label: 'Billing', content: 'Plan, invoices, and payment methods.' },
        { value: 'security', label: 'Security', content: 'Authentication and audit logs.' },
        { value: 'notifications', label: 'Notifications', content: 'Choose what you get notified about.' }
    ];
}
```

## API Reference

The overflow attributes below are shared by Root, Viewport, Content, and Scrollbar; the per-part
tables list the extras each one adds.

| Attribute                                                       | Present when                                      |
| -------------------------------------------------------------- | ------------------------------------------------- |
| `data-has-overflow-x` / `data-has-overflow-y`                  | Content overflows on that axis.                   |
| `data-overflow-x-start` / `-x-end` / `-y-start` / `-y-end`     | There is hidden content past that edge.           |
| `data-scrolling`                                               | A scroll is currently in progress.                |

### Root

Groups all parts of the scroll area and owns the shared scroll/overflow state.

**Data attributes:** the shared overflow set above, plus `data-orientation`.

**CSS variables**

| Variable                       | Description                          |
| ------------------------------ | ------------------------------------ |
| `--scroll-area-corner-width`   | Width of the corner between scrollbars.  |
| `--scroll-area-corner-height`  | Height of the corner between scrollbars. |

### Viewport

The actual scrollable container (`overflow: scroll` with the native scrollbar hidden). Wrap your
`Content` in it. Reads everything from context — no inputs.

The viewport injects a small stylesheet to hide native scrollbars in browsers that cannot express
that rule inline. If your app provides Angular's `CSP_NONCE` token, that nonce is applied to the
style element. Set `disableStyleElements` on `Root` when you want to ship the scrollbar-hiding CSS
yourself.

**Data attributes:** the shared overflow set, plus `tabindex` (`0` while it overflows, `-1` otherwise)
and `data-id`.

**CSS variables**

| Variable                                                       | Description                                  |
| -------------------------------------------------------------- | -------------------------------------------- |
| `--scroll-area-overflow-x-start` / `-x-end` / `-y-start` / `-y-end` | Distance of hidden content past each edge. |

### Content

A wrapper around the scrollable content that observes size changes to keep the thumb in sync. Reads
everything from context — no inputs. Exposes the shared overflow attributes.

### Scrollbar

A vertical or horizontal scrollbar track. Hosts the `Thumb`.

**Data attributes:** the shared overflow set, plus `data-orientation`, `data-hovering`, and `data-id`.

**CSS variables**

| Variable                       | Description           |
| ------------------------------ | --------------------- |
| `--scroll-area-thumb-width`    | Computed thumb width.  |
| `--scroll-area-thumb-height`   | Computed thumb height. |

### Thumb

The draggable indicator inside a `Scrollbar`. Reads everything from context — no inputs.

**Data attributes**

| Attribute          | Value                                                  |
| ------------------ | ------------------------------------------------------ |
| `data-orientation` | `"horizontal"` \| `"vertical"`.                        |
| `data-scrolling`   | Present while a scroll is in progress on its axis.     |

### Corner

A small box at the intersection of the two scrollbars; sized automatically and hidden when either
scrollbar is hidden. Reads everything from context — no inputs.
