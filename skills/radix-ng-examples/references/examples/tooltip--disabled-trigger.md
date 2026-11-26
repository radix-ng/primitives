# Tooltip — Disabled trigger

> One example from the [Tooltip](../components/tooltip.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

Set `disabled` on `rdxTooltipTrigger` (or `disabled` on `rdxTooltip` for all triggers). A disabled
trigger never opens the tooltip and reflects `data-trigger-disabled`.

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
    selector: 'rdx-tooltip-disabled',
    imports: [RdxTooltip, RdxTooltipPopup, RdxTooltipPortal, RdxTooltipPositioner, RdxTooltipTrigger],
    template: `
        <div class="flex items-center gap-3">
            @for (item of triggers; track item.label) {
                <ng-container rdxTooltip>
                    <button
                        class="demo-button demo-button-outline h-9 px-4"
                        [disabled]="item.disabled"
                        rdxTooltipTrigger
                    >
                        {{ item.label }}
                    </button>

                    <div class="z-50" *rdxTooltipPortal rdxTooltipPositioner>
                        <div class="demo-tooltip-popup relative max-w-72 px-3 py-1.5" rdxTooltipPopup>
                            {{ item.label }} tooltip
                        </div>
                    </div>
                </ng-container>
            }
        </div>
    `
})
export class RdxTooltipDisabledComponent {
    protected readonly triggers = [
        { label: 'Enabled', disabled: false },
        { label: 'Disabled', disabled: true }
    ];
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
