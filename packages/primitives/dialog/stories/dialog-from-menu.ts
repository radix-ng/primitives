import { Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoDialog, demoMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-dialog-from-menu',
    imports: [...dialogImports, RdxMenuModule, LucideX],
    template: `
        <ng-container #menu="rdxMenuRoot" rdxMenuRoot>
            <button [class]="cn(b.base, b.outline, b.size.md)" rdxMenuTrigger>Actions</button>

            @if (menu.open()) {
                <div [class]="m.positioner" sideOffset="4" rdxMenuPositioner>
                    <div [class]="m.popup" rdxMenuPopup>
                        <button [class]="m.item" rdxMenuItem>Duplicate</button>
                        <button [class]="m.item" (click)="renameOpen.set(true)" rdxMenuItem>Rename…</button>
                        <div [class]="m.separator" rdxMenuSeparator></div>
                        <button [class]="m.item" rdxMenuItem>Archive</button>
                    </div>
                </div>
            }
        </ng-container>

        <!-- Controlled dialog opened from the menu item. -->
        <div [(open)]="renameOpen" rdxDialogRoot>
            <ng-template rdxDialogPortal>
                <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxDialogBackdrop></div>
                <div [class]="cn(d.popup, d.popupAnimated)" rdxDialogPopup>
                    <h2 [class]="d.title" rdxDialogTitle>Rename item</h2>
                    <p [class]="d.description" rdxDialogDescription>
                        Opened by controlling the dialog from a menu item.
                    </p>
                    <div [class]="d.footer">
                        <button [class]="cn(b.base, b.outline, b.size.sm)" rdxDialogClose>Cancel</button>
                        <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDialogClose>Rename</button>
                    </div>
                    <button [class]="d.close" aria-label="Close" rdxDialogClose>
                        <svg aria-hidden="true" lucideX size="16" />
                    </button>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDialogFromMenuComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
    protected readonly m = demoMenu;
    protected readonly renameOpen = signal(false);
}
