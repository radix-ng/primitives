# Collapsible — Keep mounted

> One example from the [Collapsible](../components/collapsible.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

With `keepMounted`, the closed panel stays in the DOM and receives `hidden` after the close
transition. During enter and exit, `data-starting-style` / `data-ending-style` can drive CSS motion.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideUnfoldVertical, LucideX } from '@lucide/angular';
import {
    RdxCollapsiblePanelDirective,
    RdxCollapsibleRootDirective,
    RdxCollapsibleTriggerDirective
} from '@radix-ng/primitives/collapsible';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'collapsible-keep-mounted-example',
    imports: [
        RdxCollapsibleRootDirective,
        RdxCollapsibleTriggerDirective,
        RdxCollapsiblePanelDirective,
        LucideX,
        LucideUnfoldVertical
    ],
    template: `
        <div class="w-full max-w-sm" #collapsibleRoot="rdxCollapsibleRoot" rdxCollapsibleRoot>
            <div class="flex items-center justify-between gap-3">
                <span class="text-foreground text-sm font-medium">&#64;peduarte starred 3 repositories</span>
                <button
                    class="demo-button demo-button-outline size-8"
                    type="button"
                    aria-label="More starred repositories"
                    rdxCollapsibleTrigger
                >
                    @if (collapsibleRoot.open()) {
                        <svg class="flex" size="16" lucideX></svg>
                    } @else {
                        <svg class="flex" size="16" lucideUnfoldVertical></svg>
                    }
                </button>
            </div>

            <div class="bg-background text-foreground border-foreground my-2 border px-3 py-2">
                <span class="text-sm">&#64;radix-ui/primitives</span>
            </div>

            <div
                class="grid transition-[grid-template-rows] duration-300 ease-out data-[closed]:grid-rows-[0fr] data-[open]:grid-rows-[1fr]"
                [keepMounted]="true"
                rdxCollapsiblePanel
            >
                <div class="overflow-hidden">
                    <div class="bg-background text-foreground border-foreground my-2 border px-3 py-2">
                        <span class="text-sm">&#64;radix-ui/colors</span>
                    </div>
                    <div class="bg-background text-foreground border-foreground my-2 border px-3 py-2">
                        <span class="text-sm">&#64;stitches/react</span>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class CollapsibleKeepMountedExample {}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` for the icons.
