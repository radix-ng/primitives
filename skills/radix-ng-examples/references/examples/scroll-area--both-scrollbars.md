# Scroll Area — Both scrollbars

> One example from the [Scroll Area](../components/scroll-area.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

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
