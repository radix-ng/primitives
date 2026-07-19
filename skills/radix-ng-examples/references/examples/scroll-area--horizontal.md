# Scroll Area — Horizontal

> One example from the [Scroll Area](../components/scroll-area.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

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
