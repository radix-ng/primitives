import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxPopoverDescription,
    RdxPopoverPopup,
    RdxPopoverPortal,
    RdxPopoverPositioner,
    RdxPopoverRoot,
    RdxPopoverTitle,
    RdxPopoverTrigger,
    RdxPopoverViewport
} from '@radix-ng/primitives/popover';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-popover-viewport',
    imports: [
        RdxPopoverRoot,
        RdxPopoverTrigger,
        RdxPopoverPortal,
        RdxPopoverPositioner,
        RdxPopoverPopup,
        RdxPopoverTitle,
        RdxPopoverDescription,
        RdxPopoverViewport
    ],
    template: `
        <ng-container #root="rdxPopoverRoot" rdxPopoverRoot>
            <div class="flex flex-wrap justify-center gap-2">
                @for (item of items; track item.id) {
                    <button
                        class="demo-button demo-button-outline h-8 px-3 text-xs"
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
                <div
                    class="demo-surface relative w-80 overflow-hidden p-4 transition-[width,height] duration-200"
                    rdxPopoverPopup
                >
                    <div class="relative" rdxPopoverViewport>
                        <div
                            class="data-[previous]:animate-popover-viewport-out data-[current]:animate-popover-viewport-in data-[previous]:absolute data-[previous]:inset-0"
                        >
                            <h2 class="demo-popover-title" rdxPopoverTitle>{{ payloadItem(root.payload())?.label }}</h2>
                            <p class="text-muted-foreground mt-1 text-sm" rdxPopoverDescription>
                                {{ payloadItem(root.payload())?.description }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </ng-container>
    `
})
export class RdxPopoverViewportComponent {
    protected readonly items = [
        { id: 'notifications', label: 'Notifications', description: 'You are all caught up.' },
        { id: 'activity', label: 'Activity', description: 'Nothing interesting happened recently.' },
        { id: 'profile', label: 'Profile', description: 'Manage your profile settings and account preferences.' }
    ];
    protected payloadItem(payload: unknown) {
        return this.items.find((item) => item === payload);
    }
}
