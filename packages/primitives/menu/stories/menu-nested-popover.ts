import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { injectId } from '@radix-ng/primitives/core';
import { menuImports } from '@radix-ng/primitives/menu';
import { popoverImports } from '@radix-ng/primitives/popover';
import { cn, demoButton, demoInput, demoMenu, demoPopover } from '../../storybook/styles';

@Component({
    selector: 'rdx-menu-nested-popover',
    imports: [...menuImports, ...popoverImports],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <section class="grid gap-4">
            <label class="flex items-center gap-2 text-sm">
                <input [checked]="keep()" (change)="keep.set($any($event.target).checked)" type="checkbox" />
                Keep mounted
            </label>
            <label class="flex items-center gap-2 text-sm">
                <input [checked]="trap()" (change)="trap.set($any($event.target).checked)" type="checkbox" />
                Trap focus in editor
            </label>
            <ng-container (openChange)="closeEditorOnMenuClose($event)" rdxMenuRoot>
                <button [class]="cn(b.base, b.outline, b.size.md, 'w-fit')" rdxMenuTrigger>Quick actions</button>
                <ng-template [keepMounted]="keep()" rdxMenuPortal>
                    <div [class]="m.positioner" align="start" sideOffset="4" rdxMenuPositioner>
                        <div [class]="cn(m.popup, 'w-56')" rdxMenuPopup>
                            <ng-container [(open)]="editorOpen" [modal]="trap() ? 'trap-focus' : false" rdxPopoverRoot>
                                <button [class]="m.item" [closeOnClick]="false" rdxMenuItem rdxPopoverTrigger>
                                    Quick rename…
                                </button>
                                <ng-template rdxPopoverPortal>
                                    <div
                                        [class]="p.positioner"
                                        side="right"
                                        align="start"
                                        sideOffset="8"
                                        rdxPopoverPositioner
                                    >
                                        <div [class]="cn(p.popup, 'grid gap-4')" rdxPopoverPopup>
                                            <span [class]="p.arrow" rdxPopoverArrow></span>
                                            <h2 [class]="p.title" rdxPopoverTitle>Quick rename</h2>
                                            <p [class]="p.description" rdxPopoverDescription>
                                                Use Escape in the editor to return to the menu.
                                            </p>
                                            <div class="grid gap-2">
                                                <label class="text-sm font-medium" [for]="nameId">Document name</label>
                                                <input [id]="nameId" [class]="input" value="Project notes" />
                                            </div>
                                            <div class="flex justify-end gap-2">
                                                <button [class]="cn(b.base, b.outline, b.size.sm)" rdxPopoverClose>
                                                    Cancel
                                                </button>
                                                <button [class]="cn(b.base, b.primary, b.size.sm)" rdxPopoverClose>
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </ng-template>
                            </ng-container>
                            <button [class]="m.item" rdxMenuItem>Duplicate</button>
                            <button [class]="m.item" rdxMenuItem>Archive</button>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
        </section>
    `
})
export class RdxMenuNestedPopoverComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly m = demoMenu;
    protected readonly p = demoPopover;
    protected readonly input = demoInput;
    protected readonly nameId = injectId('rdx-menu-nested-name-');
    protected readonly keep = signal(false);
    protected readonly trap = signal(false);
    protected readonly editorOpen = signal(false);

    protected closeEditorOnMenuClose(open: boolean): void {
        if (!open) this.editorOpen.set(false);
    }
}
