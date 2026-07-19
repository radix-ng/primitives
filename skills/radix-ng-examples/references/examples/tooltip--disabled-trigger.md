# Tooltip — Disabled trigger

> One example from the [Tooltip](../components/tooltip.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

Set `disabled` on `rdxTooltipTrigger` (or `disabled` on `rdxTooltip` for all triggers). A disabled
trigger never opens the tooltip and reflects `data-trigger-disabled`.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { tooltipImports } from '@radix-ng/primitives/tooltip';
import { cn, demoButton, demoTooltip } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-tooltip-disabled',
    imports: [...tooltipImports],
    template: `
        <div class="flex items-center gap-3">
            @for (item of triggers; track item.label) {
                <ng-container rdxTooltip>
                    <button [class]="cn(b.base, b.outline, b.size.md)" [disabled]="item.disabled" rdxTooltipTrigger>
                        {{ item.label }}
                    </button>

                    <div *rdxTooltipPortal [class]="t.positioner" rdxTooltipPositioner>
                        <div [class]="t.popup" rdxTooltipPopup>{{ item.label }} tooltip</div>
                    </div>
                </ng-container>
            }
        </div>
    `
})
export class RdxTooltipDisabledComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly t = demoTooltip;

    protected readonly triggers = [
        { label: 'Enabled', disabled: false },
        { label: 'Disabled', disabled: true }
    ];
}
```
