import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { injectId } from '@radix-ng/primitives/core';
import { createRdxDialogHandle, dialogImports } from '@radix-ng/primitives/dialog';
import { menuImports, RdxMenuRoot, type RdxMenuOpenChange } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoDialog, demoInput, demoMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-menu-open-dialog',
    imports: [...menuImports, ...dialogImports],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <section class="grid gap-4">
            <div class="flex flex-wrap gap-4 text-sm">
                <label class="flex items-center gap-2">
                    <input [checked]="keep()" (change)="keep.set($any($event.target).checked)" type="checkbox" />
                    Keep mounted
                </label>
                <label class="flex items-center gap-2">
                    <input [checked]="defer()" (change)="defer.set($any($event.target).checked)" type="checkbox" />
                    Defer menu exit
                </label>
            </div>
            <ng-container (onOpenChange)="change($event)" (onOpenChangeComplete)="complete($event)" rdxMenuRoot>
                <button [class]="cn(b.base, b.outline, b.size.md, 'w-fit')" rdxMenuTrigger>Document actions</button>
                <ng-template [keepMounted]="keep()" rdxMenuPortal>
                    <div [class]="m.positioner" align="start" sideOffset="4" rdxMenuPositioner>
                        <div [class]="cn(m.popup, m.popupAnimated, 'w-56')" rdxMenuPopup>
                            <button [class]="m.item" [handle]="dialog" rdxMenuItem rdxDialogTrigger>
                                Rename document…
                            </button>
                            <button [class]="m.item" rdxMenuItem>Duplicate</button>
                            <button [class]="m.item" rdxMenuItem>Archive</button>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
            <output class="text-muted-foreground text-sm">
                Menu completed: {{ completed().join(' → ') || 'none' }}
            </output>
            <ng-container [handle]="dialog" rdxDialogRoot>
                <ng-template rdxDialogPortal>
                    <div [class]="d.backdrop" rdxDialogBackdrop></div>
                    <div [class]="d.popup" rdxDialogPopup>
                        <h2 [class]="d.title" rdxDialogTitle>Rename document</h2>
                        <p [class]="d.description" rdxDialogDescription>
                            Focus stays in this dialog while the menu finishes closing.
                        </p>
                        <label [class]="d.field" [for]="nameId">Document name</label>
                        <input [id]="nameId" [class]="input" value="Project notes" />
                        <div [class]="d.footer">
                            @if (defer()) {
                                <button [class]="cn(b.base, b.ghost, b.size.sm)" (click)="finishMenuExit()">
                                    Finish menu exit
                                </button>
                            }
                            <button [class]="cn(b.base, b.outline, b.size.sm)" rdxDialogClose>Cancel</button>
                            <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDialogClose>Save</button>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
        </section>
    `
})
export class RdxMenuOpenDialogComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
    protected readonly m = demoMenu;
    protected readonly input = demoInput;
    protected readonly nameId = injectId('rdx-menu-document-name-');
    protected readonly dialog = createRdxDialogHandle();
    protected readonly keep = signal(false);
    protected readonly defer = signal(false);
    protected readonly completed = signal<string[]>([]);
    private readonly menu = viewChild(RdxMenuRoot);
    protected change(change: RdxMenuOpenChange) {
        if (!change.open && this.defer()) change.eventDetails.preventUnmountOnClose();
    }
    protected complete(open: boolean) {
        this.completed.update((values) => [...values, open ? 'open' : 'closed']);
    }
    protected finishMenuExit() {
        this.menu()?.unmount();
    }
}
