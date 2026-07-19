# Popover — Opening on hover

> One example from the [Popover](../components/popover.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

Add `openOnHover` to a trigger when pointer users should be able to open its popup without clicking.
Use `delay` and `closeDelay` on the same trigger to configure the timing.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { popoverImports } from '@radix-ng/primitives/popover';
import { cn, demoButton, demoPopover } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-popover-hover',
    imports: [...popoverImports, LucideX],
    template: `
        <ng-container rdxPopoverRoot>
            <button [class]="cn(b.base, b.outline, b.size.md)" [delay]="300" openOnHover rdxPopoverTrigger>
                Hover for details
            </button>

            <div *rdxPopoverPortal [class]="p.positioner" sideOffset="8" rdxPopoverPositioner>
                <div [class]="p.popup" rdxPopoverPopup>
                    <span [class]="p.arrow" rdxPopoverArrow></span>
                    <h2 [class]="p.title" rdxPopoverTitle>Hover popover</h2>
                    <p [class]="p.description" rdxPopoverDescription>
                        Move the pointer into this popup. It remains interactive after leaving the trigger.
                    </p>
                    <button [class]="p.close" aria-label="Close" rdxPopoverClose>
                        <svg aria-hidden="true" lucideX size="14" />
                    </button>
                </div>
            </div>
        </ng-container>
    `
})
export class RdxPopoverHoverComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly p = demoPopover;
}
```
