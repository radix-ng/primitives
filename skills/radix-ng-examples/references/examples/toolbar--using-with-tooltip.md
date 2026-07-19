# Toolbar — Using with Tooltip

> One example from the [Toolbar](../components/toolbar.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

Wrap toolbar buttons with a tooltip by stacking `[rdxTooltipTrigger]`.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideBold, LucideItalic } from '@lucide/angular';
import { toolbarImports } from '@radix-ng/primitives/toolbar';
import { tooltipImports } from '@radix-ng/primitives/tooltip';
import { demoTooltip } from '../../storybook/styles';

const itemClass =
    'text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-8 w-8 items-center justify-center rounded-md outline-none transition-colors focus-visible:ring-2';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'toolbar-with-tooltip',
    imports: [...toolbarImports, ...tooltipImports, LucideBold, LucideItalic],
    template: `
        <div
            class="border-border bg-background flex items-center gap-1 rounded-lg border p-1 shadow-sm"
            rdxToolbarRoot
            aria-label="Toolbar with tooltips"
        >
            <ng-container rdxTooltip>
                <button class="${itemClass}" aria-label="Bold" rdxToolbarButton rdxTooltipTrigger>
                    <svg lucideBold size="16"></svg>
                </button>
                <div *rdxTooltipPortal [class]="t.positioner" sideOffset="8" rdxTooltipPositioner>
                    <div [class]="t.popup" rdxTooltipPopup>Bold</div>
                    <span [class]="t.arrow" rdxTooltipArrow></span>
                </div>
            </ng-container>

            <ng-container rdxTooltip>
                <button class="${itemClass}" aria-label="Italic" rdxToolbarButton rdxTooltipTrigger>
                    <svg lucideItalic size="16"></svg>
                </button>
                <div *rdxTooltipPortal [class]="t.positioner" sideOffset="8" rdxTooltipPositioner>
                    <div [class]="t.popup" rdxTooltipPopup>Italic</div>
                    <span [class]="t.arrow" rdxTooltipArrow></span>
                </div>
            </ng-container>
        </div>
    `
})
export class ToolbarWithTooltipExample {
    protected readonly t = demoTooltip;
}
```
