import { cn, demoButton, demoPopover } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { popoverImports } from '@radix-ng/primitives/popover';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-popover-viewport',
    imports: [...popoverImports],
    template: `
        <ng-container #root="rdxPopoverRoot" rdxPopoverRoot>
            <div class="flex flex-wrap justify-center gap-2">
                @for (item of items; track item.id) {
                    <button
                        rdxPopoverTrigger
                        [class]="cn(b.base, b.outline, b.size.sm)"
                        [payload]="item"
                        [id]="item.id"
                    >
                        {{ item.label }}
                    </button>
                }
            </div>

            <div
                *rdxPopoverPortal
                class="transition-[left,right,top,bottom] duration-200"
                sideOffset="8"
                rdxPopoverPositioner
            >
                <div rdxPopoverPopup [class]="cn(p.popup, 'overflow-hidden transition-[width,height] duration-200')">
                    <div class="relative" rdxPopoverViewport>
                        <div
                            class="data-[previous]:animate-popover-viewport-out data-[current]:animate-popover-viewport-in data-[previous]:absolute data-[previous]:inset-0"
                        >
                            <h2 rdxPopoverTitle [class]="p.title">{{ root.payload()?.label }}</h2>
                            <p rdxPopoverDescription [class]="p.description">{{ root.payload()?.description }}</p>
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
