import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    RdxMenuItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuTrigger
} from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-menu-pointer',
    imports: [RdxMenuRoot, RdxMenuTrigger, RdxMenuPortal, RdxMenuPositioner, RdxMenuPopup, RdxMenuItem],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="flex max-w-sm flex-col gap-4">
            <p class="text-muted-foreground text-sm">
                Hover to open. Click to keep it open, or hold the mouse button, drag onto a command and release.
            </p>
            <ng-container rdxMenuRoot>
                <button
                    class="demo-button demo-button-outline h-9 px-4"
                    [openOnHover]="true"
                    [delay]="180"
                    [closeDelay]="80"
                    rdxMenuTrigger
                >
                    Commands
                </button>
                <div class="z-50 data-[closed]:pointer-events-none" *rdxMenuPortal sideOffset="8" rdxMenuPositioner>
                    <div
                        class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                        rdxMenuPopup
                    >
                        <button
                            class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                            (click)="selected.set('New tab')"
                            rdxMenuItem
                        >
                            New tab
                        </button>
                        <button
                            class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                            [disabled]="true"
                            rdxMenuItem
                        >
                            Unavailable
                        </button>
                        <button
                            class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                            (click)="selected.set('Save page')"
                            rdxMenuItem
                        >
                            Save page
                        </button>
                    </div>
                </div>
            </ng-container>
            <output class="text-muted-foreground text-sm" aria-live="polite">
                {{ selected() || 'No command selected' }}
            </output>
        </div>
    `
})
export class RdxMenuPointerComponent {
    protected readonly selected = signal('');
}
