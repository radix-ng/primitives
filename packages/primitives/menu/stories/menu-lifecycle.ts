import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxFloatingInsideElement } from '@radix-ng/primitives/dismissable-layer';
import { RdxMenuModule, RdxMenuOpenChange } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-menu-lifecycle',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RdxMenuModule, RdxFloatingInsideElement],
    template: `
        <section
            class="grid w-80 max-w-full gap-4"
            #root="rdxMenuRoot"
            (onOpenChange)="change($event)"
            (onOpenChangeComplete)="complete($event)"
            rdxMenuRoot
        >
            <div class="grid gap-2 text-sm" rdxFloatingInside>
                <label class="flex items-center gap-2">
                    <input [checked]="defer()" (change)="defer.set($any($event.target).checked)" type="checkbox" />
                    Defer unmount
                </label>
                <label class="flex items-center gap-2">
                    <input [checked]="keep()" (change)="keep.set($any($event.target).checked)" type="checkbox" />
                    Keep mounted
                </label>
                <label class="flex items-center gap-2">
                    <input
                        [checked]="cancelNext()"
                        (change)="cancelNext.set($any($event.target).checked)"
                        type="checkbox"
                    />
                    Cancel next close
                </label>
            </div>
            <button [class]="cn(b.base, b.outline, b.size.md)" rdxMenuTrigger>Menu lifecycle</button>
            <ng-template [keepMounted]="keep()" rdxMenuPortal>
                <div [class]="m.positioner" sideOffset="4" rdxMenuPositioner>
                    <div [class]="cn(m.popup, m.popupAnimated, 'w-64')" rdxMenuPopup>
                        <button [class]="m.item" rdxMenuItem>New tab</button>
                        <button #notifications="rdxMenuCheckboxItem" [class]="m.item" rdxMenuCheckboxItem>
                            Notifications
                            <span class="text-muted-foreground ml-auto text-xs">
                                {{ notifications.checked() ? 'On' : 'Off' }}
                            </span>
                        </button>
                        <ng-container rdxMenuRoot>
                            <button [class]="m.item" rdxMenuSubTrigger>More actions</button>
                            <div
                                *rdxMenuPortal
                                [class]="m.positioner"
                                side="right"
                                align="start"
                                sideOffset="4"
                                rdxMenuPositioner
                            >
                                <div
                                    [class]="cn(m.popup, m.popupAnimated)"
                                    data-testid="lifecycle-submenu"
                                    rdxMenuPopup
                                >
                                    <button [class]="m.item" rdxMenuItem>Archive</button>
                                </div>
                            </div>
                        </ng-container>
                        <button [class]="m.item" rdxMenuItem>Close menu</button>
                    </div>
                </div>
            </ng-template>
            <div class="flex gap-2" rdxFloatingInside>
                <button [class]="cn(b.base, b.outline, b.size.sm)" (click)="root.close()" type="button">Close</button>
                <button [class]="cn(b.base, b.outline, b.size.sm)" (click)="root.unmount()" type="button">
                    Finish exit
                </button>
            </div>
            <p class="text-muted-foreground text-sm">
                Keep mounted preserves the checkbox state. Finish exit completes a deferred close.
            </p>
            <output class="text-muted-foreground text-sm" aria-live="polite">
                Completed: {{ completions().join(' → ') || 'none' }}
            </output>
        </section>
    `
})
export class RdxMenuLifecycleComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly m = demoMenu;
    protected readonly defer = signal(false);
    protected readonly keep = signal(false);
    protected readonly cancelNext = signal(false);
    protected readonly completions = signal<string[]>([]);
    protected change(change: RdxMenuOpenChange) {
        if (change.open) return;
        if (this.cancelNext()) {
            change.eventDetails.cancel();
            this.cancelNext.set(false);
            return;
        }
        if (this.defer()) change.eventDetails.preventUnmountOnClose();
    }
    protected complete(open: boolean) {
        this.completions.update((values) => [...values, open ? 'open' : 'closed']);
    }
}
