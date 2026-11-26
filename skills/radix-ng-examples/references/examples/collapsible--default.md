# Collapsible — Default

> One example from the [Collapsible](../components/collapsible.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideChevronRight } from '@lucide/angular';
import {
    RdxCollapsiblePanelDirective,
    RdxCollapsibleRootDirective,
    RdxCollapsibleTriggerDirective
} from '@radix-ng/primitives/collapsible';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'collapsible-default-example',
    imports: [
        RdxCollapsibleRootDirective,
        RdxCollapsibleTriggerDirective,
        RdxCollapsiblePanelDirective,
        LucideChevronRight
    ],
    template: `
        <div class="text-foreground flex min-h-36 w-48 flex-col justify-center" rdxCollapsibleRoot>
            <button
                class="demo-button demo-button-outline group h-8 justify-between ps-3 pe-2 leading-none"
                type="button"
                rdxCollapsibleTrigger
            >
                Recovery keys
                <svg
                    class="group-data-panel-open:rotate-90 motion-safe:transition-transform motion-safe:duration-100 rtl:rotate-180"
                    lucideChevronRight
                    size="16"
                    aria-hidden="true"
                ></svg>
            </button>
            <div
                class="h-(--collapsible-panel-height) overflow-hidden text-sm data-ending-style:h-0 data-starting-style:h-0 motion-safe:transition-[height] motion-safe:duration-150"
                rdxCollapsiblePanel
            >
                <ul class="flex flex-col gap-2 px-3.5 py-2">
                    <li>alien-bean-pasta</li>
                    <li>wild-irish-burrito</li>
                    <li>horse-battery-staple</li>
                </ul>
            </div>
        </div>
    `
})
export class CollapsibleDefaultExample {}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` for the icons.
