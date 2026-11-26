# Scroll Area — Default

> One example from the [Scroll Area](../components/scroll-area.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxScrollAreaContent,
    RdxScrollAreaRoot,
    RdxScrollAreaScrollbar,
    RdxScrollAreaThumb,
    RdxScrollAreaViewport
} from '@radix-ng/primitives/scroll-area';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'scroll-area-default-example',
    imports: [
        RdxScrollAreaRoot,
        RdxScrollAreaViewport,
        RdxScrollAreaContent,
        RdxScrollAreaScrollbar,
        RdxScrollAreaThumb
    ],
    template: `
        <div class="bg-background h-34 w-96 max-w-[calc(100vw-4rem)]" rdxScrollAreaRoot>
            <div
                class="border-foreground focus-visible:outline-ring h-full border focus-visible:outline-2 focus-visible:-outline-offset-1"
                rdxScrollAreaViewport
                tabindex="0"
                role="region"
                aria-label="About vernacular architecture"
            >
                <div
                    class="text-foreground flex flex-col gap-4 py-2 ps-3 pe-5 text-sm leading-[1.375rem]"
                    rdxScrollAreaContent
                >
                    <p>
                        Vernacular architecture is shaped by local materials, climate and building traditions. Buildings
                        are often made by the people who use them, with skills passed from one generation to the next.
                    </p>
                    <p>
                        Across regions, dwellings take different forms in response to their surroundings. Thick earthen
                        walls can shade interiors during the day, while steep roofs help clear snow in colder climates.
                    </p>
                </div>
            </div>
            <div
                class="pointer-events-none m-px flex w-4 bg-black/12 opacity-0 data-hovering:pointer-events-auto data-hovering:opacity-100 data-scrolling:pointer-events-auto data-scrolling:opacity-100 data-scrolling:duration-0 motion-safe:transition-opacity dark:bg-white/12"
                rdxScrollAreaScrollbar
                orientation="vertical"
            >
                <div class="bg-primary w-full" rdxScrollAreaThumb></div>
            </div>
        </div>
    `
})
export class ScrollAreaDefaultExample {}
```

The scrollbar thumb reflects the visible fraction of the content. The scrollbar appears on hover or while scrolling.

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
