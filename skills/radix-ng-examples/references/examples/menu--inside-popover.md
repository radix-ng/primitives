# Menu — Inside Popover

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

Declare Menu inside Popover's popup so portaled commands keep their floating ancestry. Escape
closes the submenu, Menu, then Popover. Selecting an item preserves Popover; clicking outside both
surfaces closes both in the default trap-focus mode. Modal popover blocks outside interaction and
page scrolling, and outside presses dismiss one layer at a time. Keep menu mounted and Defer menu exit demonstrate Menu's
exit controls.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideChevronRight } from '@lucide/angular';
import { injectId } from '@radix-ng/primitives/core';
import { menuImports, type RdxMenuOpenChange } from '@radix-ng/primitives/menu';
import { popoverImports } from '@radix-ng/primitives/popover';
import { cn, demoButton, demoInput, demoMenu, demoPopover } from '../../storybook/styles';

@Component({
    selector: 'rdx-menu-in-popover',
    imports: [...menuImports, ...popoverImports, LucideChevronRight],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <section class="grid gap-4">
            <div class="flex flex-wrap gap-4 text-sm">
                <label class="flex items-center gap-2">
                    <input [checked]="modal()" (change)="modal.set($any($event.target).checked)" type="checkbox" />
                    Modal popover
                </label>
                <label class="flex items-center gap-2">
                    <input [checked]="keep()" (change)="keep.set($any($event.target).checked)" type="checkbox" />
                    Keep menu mounted
                </label>
                <label class="flex items-center gap-2">
                    <input [checked]="defer()" (change)="defer.set($any($event.target).checked)" type="checkbox" />
                    Defer menu exit
                </label>
            </div>
            <ng-container [modal]="modal() ? true : 'trap-focus'" rdxPopoverRoot>
                <button [class]="cn(b.base, b.outline, b.size.md, 'w-fit')" rdxPopoverTrigger>Workspace tools</button>
                <ng-template rdxPopoverPortal>
                    <div [class]="p.positioner" align="start" sideOffset="8" rdxPopoverPositioner>
                        <div [class]="p.popup" rdxPopoverPopup>
                            <span [class]="p.arrow" rdxPopoverArrow></span>
                            <h2 [class]="p.title" rdxPopoverTitle>Workspace commands</h2>
                            <p [class]="p.description" rdxPopoverDescription>
                                Escape closes the deepest layer. Modal popover also dismisses one layer per outside
                                press.
                            </p>
                            <div class="my-4 grid gap-3">
                                <label class="text-sm font-medium" [for]="nameId">Workspace name</label>
                                <input [id]="nameId" [class]="input" value="Design system" />
                                <ng-container
                                    #menu="rdxMenuRoot"
                                    (onOpenChange)="change($event)"
                                    (onOpenChangeComplete)="complete($event)"
                                    rdxMenuRoot
                                >
                                    <button [class]="cn(b.base, b.outline, b.size.sm, 'w-fit')" rdxMenuTrigger>
                                        Actions
                                    </button>
                                    <ng-template [keepMounted]="keep()" rdxMenuPortal>
                                        <div [class]="m.positioner" align="start" sideOffset="4" rdxMenuPositioner>
                                            <div [class]="cn(m.popup, m.popupAnimated, 'w-56')" rdxMenuPopup>
                                                <button
                                                    [class]="m.item"
                                                    (onSelect)="selected.set('Rename')"
                                                    rdxMenuItem
                                                >
                                                    Rename
                                                </button>
                                                <ng-container rdxMenuRoot>
                                                    <button [class]="m.item" rdxMenuSubTrigger>
                                                        Share
                                                        <svg
                                                            class="ms-auto"
                                                            aria-hidden="true"
                                                            lucideChevronRight
                                                            size="16"
                                                        />
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
                                                            </div>
                                                        </div>
                                                    </ng-template>
                                                </ng-container>
                                                <button
                                                    [class]="m.item"
                                                    (onSelect)="selected.set('Archive')"
                                                    rdxMenuItem
                                                >
                                                    Archive
                                                </button>
                                            </div>
                                        </div>
                                    </ng-template>
                                    @if (defer()) {
                                        <button
                                            [class]="cn(b.base, b.ghost, b.size.sm, 'w-fit')"
                                            (click)="menu.unmount()"
                                            type="button"
                                        >
                                            Finish menu exit
                                        </button>
                                    }
                                </ng-container>
                                <output class="text-muted-foreground text-sm">Selected: {{ selected() }}</output>
                                <output class="text-muted-foreground text-sm">
                                    Menu completed: {{ completed().join(' → ') || 'none' }}
                                </output>
                            </div>
                            <button [class]="cn(b.base, b.outline, b.size.sm)" rdxPopoverClose>Close workspace</button>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
        </section>
    `
})
export class RdxMenuInPopoverComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly p = demoPopover;
    protected readonly m = demoMenu;
    protected readonly input = demoInput;
    protected readonly nameId = injectId('rdx-menu-workspace-name-');
    protected readonly modal = signal(false);
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
```
