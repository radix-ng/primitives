import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { injectId } from '@radix-ng/primitives/core';
import { menuImports, RdxMenuRoot, type RdxMenuOpenChange } from '@radix-ng/primitives/menu';
import { popoverImports } from '@radix-ng/primitives/popover';
import { cn, demoButton, demoInput, demoMenu, demoPopover } from '../../storybook/styles';

@Component({
    selector: 'rdx-menu-open-popover',
    imports: [...menuImports, ...popoverImports],
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
                <button #anchor [class]="cn(b.base, b.outline, b.size.md, 'w-fit')" rdxMenuTrigger>
                    Document actions
                </button>
                <ng-template [keepMounted]="keep()" rdxMenuPortal>
                    <div [class]="m.positioner" align="start" sideOffset="4" rdxMenuPositioner>
                        <div [class]="cn(m.popup, m.popupAnimated, 'w-56')" rdxMenuPopup>
                            <button [class]="m.item" (onSelect)="editor.set(true)" rdxMenuItem>Rename document…</button>
                            <button [class]="m.item" rdxMenuItem>Duplicate</button>
                            <button [class]="m.item" rdxMenuItem>Archive</button>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
            <output class="text-muted-foreground text-sm">
                Menu completed: {{ completed().join(' → ') || 'none' }}
            </output>
            <ng-container [(open)]="editor" rdxPopoverRoot>
                <ng-template rdxPopoverPortal>
                    <div
                        [class]="p.positioner"
                        [anchor]="anchor"
                        side="right"
                        align="start"
                        sideOffset="8"
                        rdxPopoverPositioner
                    >
                        <div [class]="cn(p.popup, 'grid gap-4')" rdxPopoverPopup>
                            <span [class]="p.arrow" rdxPopoverArrow></span>
                            <h2 [class]="p.title" rdxPopoverTitle>Rename document</h2>
                            <p [class]="p.description" rdxPopoverDescription>
                                The editor stays beside Document actions after the menu closes.
                            </p>
                            <div class="grid gap-2">
                                <label class="text-sm font-medium" [for]="nameId">Document name</label>
                                <input [id]="nameId" [class]="input" value="Project notes" />
                            </div>
                            <div class="flex flex-wrap justify-end gap-2">
                                @if (defer()) {
                                    <button
                                        [class]="cn(b.base, b.ghost, b.size.sm)"
                                        (click)="finishMenuExit()"
                                        type="button"
                                    >
                                        Finish menu exit
                                    </button>
                                }
                                <button [class]="cn(b.base, b.outline, b.size.sm)" rdxPopoverClose>Cancel</button>
                                <button [class]="cn(b.base, b.primary, b.size.sm)" rdxPopoverClose>Save</button>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
        </section>
    `
})
export class RdxMenuOpenPopoverComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly m = demoMenu;
    protected readonly p = demoPopover;
    protected readonly input = demoInput;
    protected readonly nameId = injectId('rdx-menu-popover-name-');
    protected readonly keep = signal(false);
    protected readonly defer = signal(false);
    protected readonly editor = signal(false);
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
