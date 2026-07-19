# Tooltip — Per-trigger delay

> One example from the [Tooltip](../components/tooltip.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

Set `delay` (and `closeDelay`) on `rdxTooltipTrigger` to override the root, provider, and global
values for that trigger only.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { tooltipImports } from '@radix-ng/primitives/tooltip';
import { cn, demoButton, demoTooltip } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-tooltip-delay',
    imports: [...tooltipImports],
    template: `
        <div class="flex items-center gap-3">
            @for (item of triggers; track item.delay) {
                <ng-container rdxTooltip>
                    <button [class]="cn(b.base, b.outline, b.size.md)" [delay]="item.delay" rdxTooltipTrigger>
                        {{ item.label }}
                    </button>

                    <div *rdxTooltipPortal [class]="t.positioner" sideOffset="8" rdxTooltipPositioner>
                        <div [class]="t.popup" rdxTooltipPopup>Opened after {{ item.delay }} ms</div>
                    </div>
                </ng-container>
            }
        </div>
    `
})
export class RdxTooltipDelayComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly t = demoTooltip;

    protected readonly triggers = [
        { label: 'Instant', delay: 0 },
        { label: 'Default', delay: 600 },
        { label: 'Slow', delay: 1200 }
    ];
}
```
