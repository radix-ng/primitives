# Tooltip — Default

> One example from the [Tooltip](../components/tooltip.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

A tooltip anchored to an icon button, with an arrow.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucidePlus } from '@lucide/angular';
import {
    RdxTooltip,
    RdxTooltipArrow,
    RdxTooltipPopup,
    RdxTooltipPortal,
    RdxTooltipPositioner,
    RdxTooltipTrigger
} from '@radix-ng/primitives/tooltip';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-tooltip-default',
    imports: [
        RdxTooltip,
        RdxTooltipArrow,
        RdxTooltipPopup,
        RdxTooltipPortal,
        RdxTooltipPositioner,
        RdxTooltipTrigger,
        LucidePlus
    ],
    template: `
        <ng-container rdxTooltip>
            <button
                class="demo-button demo-button-outline data-popup-open:bg-muted size-8 p-0"
                aria-label="Add to library"
                rdxTooltipTrigger
            >
                <svg aria-hidden="true" lucidePlus size="16" />
            </button>

            <div class="z-50" *rdxTooltipPortal sideOffset="11" rdxTooltipPositioner>
                <div
                    class="demo-popup relative max-w-72 origin-(--transform-origin) px-2 py-1 text-sm data-closed:scale-[0.98] data-closed:opacity-0 data-instant:transition-none motion-safe:transition-[scale,opacity] motion-safe:duration-100 motion-safe:starting:scale-[0.98] motion-safe:starting:opacity-0"
                    rdxTooltipPopup
                >
                    <span class="h-1.5 w-3" rdxTooltipArrow aria-hidden="true">
                        <span class="demo-popup-arrow block size-full"></span>
                    </span>
                    Add to library
                </div>
            </div>
        </ng-container>
    `
})
export class RdxTooltipDefaultComponent {}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
