# Toolbar — Using with Tooltip

> One example from the [Toolbar](../components/toolbar.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Wrap toolbar buttons with a tooltip by stacking `[rdxTooltipTrigger]`.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideBold, LucideItalic } from '@lucide/angular';
import { RdxToolbarButton, RdxToolbarRoot } from '@radix-ng/primitives/toolbar';
import {
    RdxTooltip,
    RdxTooltipArrow,
    RdxTooltipPopup,
    RdxTooltipPortal,
    RdxTooltipPositioner,
    RdxTooltipTrigger
} from '@radix-ng/primitives/tooltip';

const itemClass =
    'text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-8 w-8 items-center justify-center rounded-md outline-none transition-colors focus-visible:ring-2';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'toolbar-with-tooltip',
    imports: [
        RdxToolbarRoot,
        RdxToolbarButton,
        RdxTooltip,
        RdxTooltipArrow,
        RdxTooltipPopup,
        RdxTooltipPortal,
        RdxTooltipPositioner,
        RdxTooltipTrigger,
        LucideBold,
        LucideItalic
    ],
    template: `
        <div class="demo-toolbar-root flex items-center gap-1 p-1" rdxToolbarRoot aria-label="Toolbar with tooltips">
            <ng-container rdxTooltip>
                <button class="${itemClass}" aria-label="Bold" rdxToolbarButton rdxTooltipTrigger>
                    <svg lucideBold size="16"></svg>
                </button>
                <div class="z-50" *rdxTooltipPortal sideOffset="8" rdxTooltipPositioner>
                    <div class="demo-tooltip-popup relative max-w-72 px-3 py-1.5" rdxTooltipPopup>Bold</div>
                    <span class="text-popover demo-arrow my-px" rdxTooltipArrow></span>
                </div>
            </ng-container>

            <ng-container rdxTooltip>
                <button class="${itemClass}" aria-label="Italic" rdxToolbarButton rdxTooltipTrigger>
                    <svg lucideItalic size="16"></svg>
                </button>
                <div class="z-50" *rdxTooltipPortal sideOffset="8" rdxTooltipPositioner>
                    <div class="demo-tooltip-popup relative max-w-72 px-3 py-1.5" rdxTooltipPopup>Italic</div>
                    <span class="text-popover demo-arrow my-px" rdxTooltipArrow></span>
                </div>
            </ng-container>
        </div>
    `
})
export class ToolbarWithTooltipExample {}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
