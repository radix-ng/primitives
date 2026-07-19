# Popover — Animating between triggers

> One example from the [Popover](../components/popover.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

Wrap one direct content element with `rdxPopoverViewport` to animate content changes when a popup
moves between triggers. The viewport exposes `data-activation-direction` and retains a
`data-previous` snapshot until its CSS transition or animation completes.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { popoverImports } from '@radix-ng/primitives/popover';
import { cn, demoButton, demoPopover } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-popover-viewport',
    imports: [...popoverImports],
    template: `
        <ng-container #root="rdxPopoverRoot" rdxPopoverRoot>
            <div class="flex flex-wrap justify-center gap-2">
                @for (item of items; track item.id) {
                    <button
                        [class]="cn(b.base, b.outline, b.size.sm)"
                        [payload]="item"
                        [id]="item.id"
                        rdxPopoverTrigger
                    >
                        {{ item.label }}
                    </button>
                }
            </div>

            <div
                class="transition-[left,right,top,bottom] duration-200"
                *rdxPopoverPortal
                sideOffset="8"
                rdxPopoverPositioner
            >
                <div [class]="cn(p.popup, 'overflow-hidden transition-[width,height] duration-200')" rdxPopoverPopup>
                    <div class="relative" rdxPopoverViewport>
                        <div
                            class="data-[previous]:animate-popover-viewport-out data-[current]:animate-popover-viewport-in data-[previous]:absolute data-[previous]:inset-0"
                        >
                            <h2 [class]="p.title" rdxPopoverTitle>{{ root.payload()?.label }}</h2>
                            <p [class]="p.description" rdxPopoverDescription>{{ root.payload()?.description }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </ng-container>
    `
})
export class RdxPopoverViewportComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly p = demoPopover;
    protected readonly items = [
        { id: 'notifications', label: 'Notifications', description: 'You are all caught up.' },
        { id: 'activity', label: 'Activity', description: 'Nothing interesting happened recently.' },
        { id: 'profile', label: 'Profile', description: 'Manage your profile settings and account preferences.' }
    ];
}
```
