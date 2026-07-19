# Popover — Default

> One example from the [Popover](../components/popover.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

A form-like popup with an arrow, accessible title and description, and a close button.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucidePlus, LucideX } from '@lucide/angular';
import { popoverImports } from '@radix-ng/primitives/popover';
import { cn, demoButton, demoInput, demoPopover } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-popover-default',
    imports: [...popoverImports, LucidePlus, LucideX],
    template: `
        <ng-container rdxPopoverRoot>
            <button [class]="cn(b.base, b.outline, b.size.md)" rdxPopoverTrigger>
                <svg aria-hidden="true" lucidePlus size="16" />
                Add details
            </button>

            <div *rdxPopoverPortal [class]="p.positioner" sideOffset="8" rdxPopoverPositioner>
                <div [class]="p.popup" rdxPopoverPopup>
                    <span [class]="p.arrow" rdxPopoverArrow></span>
                    <h2 [class]="p.title" rdxPopoverTitle>Dimensions</h2>
                    <p [class]="p.description" rdxPopoverDescription>Set the width and height for the element.</p>

                    <div class="mt-4 grid gap-3">
                        <label class="grid gap-1 text-xs font-medium">
                            Width
                            <input [class]="input" value="100%" />
                        </label>
                        <label class="grid gap-1 text-xs font-medium">
                            Max width
                            <input [class]="input" value="300px" />
                        </label>
                    </div>

                    <button [class]="p.close" aria-label="Close" rdxPopoverClose>
                        <svg aria-hidden="true" lucideX size="14" />
                    </button>
                </div>
            </div>
        </ng-container>
    `
})
export class RdxPopoverDefaultComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly input = demoInput;
    protected readonly p = demoPopover;
}
```
