# Popover — Controlled

> One example from the [Popover](../components/popover.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

Bind `[(open)]` when application state should open or close the popover programmatically. This
example also includes the optional backdrop part.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { popoverImports } from '@radix-ng/primitives/popover';
import { cn, demoButton, demoPopover } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-popover-controlled',
    imports: [...popoverImports, LucideX],
    template: `
        <div class="flex flex-col items-center gap-4">
            <div class="flex items-center gap-2">
                <button [class]="cn(b.base, b.secondary, b.size.sm)" (click)="open.set(true)">Open externally</button>
                <button [class]="cn(b.base, b.ghost, b.size.sm)" (click)="open.set(false)">Close externally</button>
            </div>

            <p class="text-muted-foreground text-xs">State: {{ open() ? 'open' : 'closed' }}</p>

            <ng-container [(open)]="open" rdxPopoverRoot>
                <button [class]="cn(b.base, b.outline, b.size.md)" rdxPopoverTrigger>Toggle popover</button>

                <ng-template rdxPopoverPortal>
                    <div [class]="p.backdrop" rdxPopoverBackdrop></div>
                    <div [class]="p.positioner" sideOffset="8" rdxPopoverPositioner>
                        <div [class]="p.popup" rdxPopoverPopup>
                            <span [class]="p.arrow" rdxPopoverArrow></span>
                            <h2 [class]="p.title" rdxPopoverTitle>Controlled state</h2>
                            <p [class]="p.description" rdxPopoverDescription>
                                The root uses Angular two-way binding with a signal.
                            </p>
                            <button [class]="p.close" aria-label="Close" rdxPopoverClose>
                                <svg aria-hidden="true" lucideX size="14" />
                            </button>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
        </div>
    `
})
export class RdxPopoverControlledComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly p = demoPopover;
    protected readonly open = signal(false);
}
```
