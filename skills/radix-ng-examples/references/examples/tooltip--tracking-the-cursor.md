# Tooltip — Tracking the cursor

> One example from the [Tooltip](../components/tooltip.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

Set `trackCursorAxis` on the root to `'x'`, `'y'`, or `'both'` to make the popup follow the pointer
along that axis.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { tooltipImports } from '@radix-ng/primitives/tooltip';
import { demoTooltip } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-tooltip-track-cursor',
    imports: [...tooltipImports],
    template: `
        <ng-container rdxTooltip trackCursorAxis="both">
            <button
                class="border-border bg-background text-foreground hover:bg-muted flex h-24 w-64 items-center justify-center rounded-md border text-sm shadow-sm outline-none"
                type="button"
                rdxTooltipTrigger
            >
                Move the cursor over me
            </button>

            <div *rdxTooltipPortal [class]="t.positioner" sideOffset="12" rdxTooltipPositioner>
                <div [class]="t.popup" rdxTooltipPopup>Following the cursor</div>
            </div>
        </ng-container>
    `
})
export class RdxTooltipTrackCursorComponent {
    protected readonly t = demoTooltip;
}
```
