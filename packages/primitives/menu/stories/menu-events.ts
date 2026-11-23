import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    RdxMenuItem,
    RdxMenuOpenChange,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuTrigger
} from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-menu-events',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxMenuRoot, RdxMenuTrigger, RdxMenuPortal, RdxMenuPositioner, RdxMenuPopup, RdxMenuItem],
    template: `
        <section class="grid w-80 gap-4">
            <label class="flex items-center gap-2 text-sm">
                <input
                    [checked]="cancelNext()"
                    (change)="cancelNext.set($any($event.target).checked)"
                    type="checkbox"
                />
                Cancel next close
            </label>
            <ng-container (onOpenChange)="change($event)" rdxMenuRoot>
                <button class="demo-button demo-button-outline h-9 px-4" [id]="triggerId()" rdxMenuTrigger>
                    Menu events
                </button>
                <div class="z-50 data-[closed]:pointer-events-none" *rdxMenuPortal sideOffset="4" rdxMenuPositioner>
                    <div
                        class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                        [id]="popupId()"
                        rdxMenuPopup
                    >
                        <button
                            class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                            (onSelect)="selected.set('Run action')"
                            rdxMenuItem
                        >
                            Run action
                        </button>
                        <button
                            class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                            [closeOnClick]="false"
                            (onSelect)="rename()"
                            rdxMenuItem
                        >
                            Rename parts
                        </button>
                        <button
                            class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                            rdxMenuItem
                        >
                            Close menu
                        </button>
                    </div>
                </div>
            </ng-container>
            <p class="text-muted-foreground text-sm">
                Cancel one close, or rename the trigger and popup while the menu stays open. Their ARIA links update
                together.
            </p>
            <output class="text-muted-foreground text-sm" aria-live="polite">Last change: {{ lastChange() }}</output>
            <p class="text-muted-foreground text-sm">Selected: {{ selected() || 'none' }}</p>
        </section>
    `
})
export class RdxMenuEventsComponent {
    protected readonly triggerId = signal('menu-events-trigger');
    protected readonly popupId = signal('menu-events-popup');
    protected readonly cancelNext = signal(false);
    protected readonly lastChange = signal('none');
    protected readonly selected = signal('');
    protected rename() {
        this.triggerId.set('menu-events-trigger-updated');
        this.popupId.set('menu-events-popup-updated');
    }
    protected change(change: RdxMenuOpenChange) {
        if (!change.open && this.cancelNext()) {
            change.eventDetails.cancel();
            this.cancelNext.set(false);
        }
        this.lastChange.set(`${change.reason}${change.eventDetails.isCanceled() ? ' (canceled)' : ''}`);
    }
}
