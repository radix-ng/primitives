import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { injectId } from '@radix-ng/primitives/core';
import { RdxFloatingInsideElement } from '@radix-ng/primitives/dismissable-layer';
import { createRdxMenuHandle, RdxMenuModule, RdxMenuOpenChange } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoMenu } from '../../storybook/styles';

interface MailMenu {
    label: string;
    items: { id: string; label: string }[];
}

@Component({
    selector: 'rdx-menu-exit-switch',
    imports: [RdxMenuModule, RdxFloatingInsideElement],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <section class="grid w-96 max-w-full gap-4">
            <p class="text-muted-foreground text-sm">
                Close with Escape, then open another menu before finishing its exit.
            </p>
            <ng-container
                #root="rdxMenuRoot"
                [(open)]="open"
                [(triggerId)]="triggerId"
                [handle]="handle"
                [modal]="false"
                (onOpenChange)="change($event)"
                (onOpenChangeComplete)="complete($event)"
                rdxMenuRoot
            >
                <div class="flex flex-wrap gap-4 text-sm" rdxFloatingInside>
                    <label class="flex items-center gap-2">
                        <input [checked]="defer()" (change)="defer.set($any($event.target).checked)" type="checkbox" />
                        Defer close
                    </label>
                    <label class="flex items-center gap-2">
                        <input [checked]="keep()" (change)="keep.set($any($event.target).checked)" type="checkbox" />
                        Keep mounted
                    </label>
                </div>
                <div class="flex flex-wrap gap-2" rdxFloatingInside>
                    <button [class]="cn(b.base, b.outline, b.size.sm)" (click)="handle.open(inboxId)">
                        Open Inbox
                    </button>
                    <button [class]="cn(b.base, b.outline, b.size.sm)" (click)="openArchive()">Open Archive</button>
                    <button [class]="cn(b.base, b.outline, b.size.sm)" (click)="root.close()">Close</button>
                    <button [class]="cn(b.base, b.outline, b.size.sm)" (click)="root.unmount()">Finish exit</button>
                </div>
                <ng-template [keepMounted]="keep()" rdxMenuPortal>
                    <div [class]="m.positioner" sideOffset="8" align="start" rdxMenuPositioner>
                        <div [class]="cn(m.popup, m.popupAnimated, 'w-56')" rdxMenuPopup>
                            <div rdxMenuViewport>
                                <div>
                                    <div [class]="m.groupLabel">{{ root.payload()?.label }}</div>
                                    @for (item of root.payload()?.items; track item.id) {
                                        <button [class]="m.item" rdxMenuItem>{{ item.label }}</button>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
            <output class="text-muted-foreground text-sm" aria-live="polite">
                Completed: {{ completed().join(' → ') || 'none' }}
            </output>
            <div class="flex gap-2">
                <button
                    [class]="cn(b.base, b.outline, b.size.md, 'data-[popup-open]:bg-muted')"
                    [id]="inboxId"
                    [handle]="handle"
                    [payload]="inbox"
                    rdxMenuTrigger
                >
                    Inbox
                </button>
                <button
                    [class]="cn(b.base, b.outline, b.size.md, 'data-[popup-open]:bg-muted')"
                    [id]="archiveId"
                    [handle]="handle"
                    [payload]="archive"
                    rdxMenuTrigger
                >
                    Archive
                </button>
            </div>
        </section>
    `
})
export class RdxMenuExitSwitchComponent {
    protected readonly handle = createRdxMenuHandle<MailMenu>();
    protected readonly inboxId = injectId('menu-inbox-');
    protected readonly archiveId = injectId('menu-archive-');
    protected readonly inbox: MailMenu = {
        label: 'Inbox',
        items: [
            { id: 'new-message', label: 'New message' },
            { id: 'mark-read', label: 'Mark all read' }
        ]
    };
    protected readonly archive: MailMenu = {
        label: 'Archive',
        items: [
            { id: 'restore-message', label: 'Restore message' },
            { id: 'empty-archive', label: 'Empty archive' }
        ]
    };
    protected readonly open = signal(false);
    protected readonly triggerId = signal<string | null>(null);
    protected readonly defer = signal(true);
    protected readonly keep = signal(false);
    protected readonly completed = signal<string[]>([]);
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly m = demoMenu;
    protected change(change: RdxMenuOpenChange): void {
        if (!change.open && this.defer()) change.eventDetails.preventUnmountOnClose();
    }
    protected complete(open: boolean): void {
        this.completed.update((values) => [...values, open ? 'open' : 'closed']);
    }
    protected openArchive(): void {
        this.triggerId.set(this.archiveId);
        this.open.set(true);
    }
}
