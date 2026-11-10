import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxMenuModule, RdxMenuOpenChange } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-menu-events',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxMenuModule],
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
                <button [id]="triggerId()" [class]="cn(b.base, b.outline, b.size.md)" rdxMenuTrigger>
                    Menu events
                </button>
                <div *rdxMenuPortal [class]="m.positioner" sideOffset="4" rdxMenuPositioner>
                    <div [id]="popupId()" [class]="m.popup" rdxMenuPopup>
                        <button [class]="m.item" (onSelect)="selected.set('Run action')" rdxMenuItem>Run action</button>
                        <button [class]="m.item" [closeOnClick]="false" (onSelect)="rename()" rdxMenuItem>
                            Rename parts
                        </button>
                        <button [class]="m.item" rdxMenuItem>Close menu</button>
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
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly m = demoMenu;
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
