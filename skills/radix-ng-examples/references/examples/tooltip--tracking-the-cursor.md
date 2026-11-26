# Tooltip — Tracking the cursor

> One example from the [Tooltip](../components/tooltip.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

Set `trackCursorAxis` on the root to `'x'`, `'y'`, or `'both'` to make the popup follow the pointer
along that axis.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxTooltip,
    RdxTooltipPopup,
    RdxTooltipPortal,
    RdxTooltipPositioner,
    RdxTooltipTrigger
} from '@radix-ng/primitives/tooltip';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-tooltip-track-cursor',
    imports: [RdxTooltip, RdxTooltipPopup, RdxTooltipPortal, RdxTooltipPositioner, RdxTooltipTrigger],
    template: `
        <ng-container rdxTooltip trackCursorAxis="both">
            <button
                class="border-border bg-background text-foreground hover:bg-muted flex h-24 w-64 items-center justify-center rounded-md border text-sm shadow-sm outline-none"
                type="button"
                rdxTooltipTrigger
            >
                Move the cursor over me
            </button>

            <div class="z-50" *rdxTooltipPortal sideOffset="12" rdxTooltipPositioner>
                <div class="demo-tooltip-popup relative max-w-72 px-3 py-1.5" rdxTooltipPopup>Following the cursor</div>
            </div>
        </ng-container>
    `
})
export class RdxTooltipTrackCursorComponent {}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
