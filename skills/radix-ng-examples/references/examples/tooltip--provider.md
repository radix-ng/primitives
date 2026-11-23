# Tooltip — Provider

> One example from the [Tooltip](../components/tooltip.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Wrap a group of tooltips with `rdxTooltipProvider` to share the open `delay`, `closeDelay`, and the
instant-open `timeout` window — once one tooltip opens, adjacent ones open instantly until `timeout`
ms after the last one closes.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import {
    RdxTooltip,
    RdxTooltipPopup,
    RdxTooltipPortal,
    RdxTooltipPositioner,
    RdxTooltipProvider,
    RdxTooltipTrigger
} from '@radix-ng/primitives/tooltip';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-tooltip-provider',
    imports: [
        RdxTooltip,
        RdxTooltipPopup,
        RdxTooltipPortal,
        RdxTooltipPositioner,
        RdxTooltipProvider,
        RdxTooltipTrigger,
        LucideDynamicIcon
    ],
    template: `
        <div class="flex items-center gap-2" [delay]="600" [timeout]="400" rdxTooltipProvider>
            @for (action of actions; track action.name) {
                <ng-container rdxTooltip>
                    <button
                        class="demo-button demo-button-outline size-9 p-0"
                        [attr.aria-label]="action.name"
                        rdxTooltipTrigger
                    >
                        <svg [lucideIcon]="action.icon" aria-hidden="true" size="16" />
                    </button>

                    <div class="z-50" *rdxTooltipPortal sideOffset="8" rdxTooltipPositioner>
                        <div class="demo-tooltip-popup relative max-w-72 px-3 py-1.5" rdxTooltipPopup>
                            {{ action.name }}
                        </div>
                    </div>
                </ng-container>
            }
        </div>
    `
})
export class RdxTooltipProviderComponent {
    protected readonly actions = [
        { name: 'Bold', icon: 'bold' },
        { name: 'Italic', icon: 'italic' },
        { name: 'Add', icon: 'plus' }
    ];
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
