import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideChevronRight } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { RdxMenuModule, type RdxMenuOpenChange } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoDialog, demoMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-menu-in-dialog',
    imports: [...dialogImports, RdxMenuModule, LucideChevronRight],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container rdxDialogRoot>
            <button [class]="cn(b.base, b.outline, b.size.md)" rdxDialogTrigger>Open workspace</button>
            <ng-template rdxDialogPortal>
                <div [class]="d.backdrop" rdxDialogBackdrop></div>
                <div [class]="d.popup" rdxDialogPopup>
                    <h2 [class]="d.title" rdxDialogTitle>Workspace commands</h2>
                    <p [class]="d.description" rdxDialogDescription>
                        Escape closes the submenu, menu, then dialog. Each step returns focus to its trigger.
                    </p>
                    <div class="my-5 grid gap-4">
                        <div class="flex flex-wrap gap-4 text-sm">
                            <label class="flex items-center gap-2">
                                <input
                                    [checked]="keep()"
                                    (change)="keep.set($any($event.target).checked)"
                                    type="checkbox"
                                />
                                Keep mounted
                            </label>
                            <label class="flex items-center gap-2">
                                <input
                                    [checked]="defer()"
                                    (change)="defer.set($any($event.target).checked)"
                                    type="checkbox"
                                />
                                Defer menu exit
                            </label>
                        </div>
                        <ng-container
                            #menu="rdxMenuRoot"
                            (onOpenChange)="change($event)"
                            (onOpenChangeComplete)="complete($event)"
                            rdxMenuRoot
                        >
                            <div class="flex flex-wrap gap-2">
                                <button [class]="cn(b.base, b.outline, b.size.sm)" rdxMenuTrigger>Actions</button>
                                <button [class]="cn(b.base, b.ghost, b.size.sm)" (click)="menu.unmount()">
                                    Finish menu exit
                                </button>
                            </div>
                            <ng-template [keepMounted]="keep()" rdxMenuPortal>
                                <div [class]="m.positioner" align="start" sideOffset="4" rdxMenuPositioner>
                                    <div [class]="cn(m.popup, m.popupAnimated, 'w-56')" rdxMenuPopup>
                                        <button [class]="m.item" (onSelect)="selected.set('Rename')" rdxMenuItem>
                                            Rename
                                        </button>
                                        <ng-container rdxMenuRoot>
                                            <button [class]="m.item" rdxMenuSubTrigger>
                                                Share
                                                <svg class="ms-auto" aria-hidden="true" lucideChevronRight size="16" />
                                            </button>
                                            <ng-template [keepMounted]="keep()" rdxMenuPortal>
                                                <div
                                                    [class]="m.positioner"
                                                    side="right"
                                                    align="start"
                                                    sideOffset="4"
                                                    rdxMenuPositioner
                                                >
                                                    <div [class]="m.popup + ' w-48'" rdxMenuPopup>
                                                        <button
                                                            [class]="m.item"
                                                            (onSelect)="selected.set('Copy link')"
                                                            rdxMenuItem
                                                        >
                                                            Copy link
                                                        </button>
                                                        <button
                                                            [class]="m.item"
                                                            (onSelect)="selected.set('Invite member')"
                                                            rdxMenuItem
                                                        >
                                                            Invite member
                                                        </button>
                                                    </div>
                                                </div>
                                            </ng-template>
                                        </ng-container>
                                        <button [class]="m.item" (onSelect)="selected.set('Archive')" rdxMenuItem>
                                            Archive
                                        </button>
                                    </div>
                                </div>
                            </ng-template>
                        </ng-container>
                        <output class="text-muted-foreground text-sm">Selected: {{ selected() }}</output>
                        <output class="text-muted-foreground text-sm">
                            Completed: {{ completed().join(' → ') || 'none' }}
                        </output>
                    </div>
                    <div [class]="d.footer">
                        <button [class]="cn(b.base, b.outline, b.size.sm)" rdxDialogClose>Close workspace</button>
                    </div>
                </div>
            </ng-template>
        </ng-container>
    `
})
export class RdxMenuInDialogComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
    protected readonly m = demoMenu;
    protected readonly keep = signal(false);
    protected readonly defer = signal(false);
    protected readonly selected = signal('none');
    protected readonly completed = signal<string[]>([]);
    protected change(change: RdxMenuOpenChange) {
        if (!change.open && this.defer()) change.eventDetails.preventUnmountOnClose();
    }
    protected complete(open: boolean) {
        this.completed.update((values) => [...values, open ? 'open' : 'closed']);
    }
}
