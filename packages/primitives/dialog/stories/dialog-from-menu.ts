import { cn, demoButton, demoDialog, demoMenu } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { RdxMenuModule } from '@radix-ng/primitives/menu';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-dialog-from-menu',
    imports: [...dialogImports, RdxMenuModule, LucideX],
    template: `
        <ng-container #menu="rdxMenuRoot" rdxMenuRoot>
            <button rdxMenuTrigger [class]="cn(b.base, b.outline, b.size.md)">Actions</button>

            @if (menu.open()) {
                <div sideOffset="4" rdxMenuPositioner [class]="m.positioner">
                    <div rdxMenuPopup [class]="m.popup">
                        <button rdxMenuItem [class]="m.item">Duplicate</button>
                        <button rdxMenuItem [class]="m.item" (click)="renameOpen.set(true)">Rename…</button>
                        <div rdxMenuSeparator [class]="m.separator"></div>
                        <button rdxMenuItem [class]="m.item">Archive</button>
                    </div>
                </div>
            }
        </ng-container>

        <!-- Controlled dialog opened from the menu item. -->
        <div rdxDialogRoot [(open)]="renameOpen">
            <ng-template rdxDialogPortal>
                <div rdxDialogBackdrop [class]="cn(d.backdrop, d.backdropAnimated)"></div>
                <div rdxDialogPopup [class]="cn(d.popup, d.popupAnimated)">
                    <h2 rdxDialogTitle [class]="d.title">Rename item</h2>
                    <p rdxDialogDescription [class]="d.description">
                        Opened by controlling the dialog from a menu item.
                    </p>
                    <div [class]="d.footer">
                        <button rdxDialogClose [class]="cn(b.base, b.outline, b.size.sm)">Cancel</button>
                        <button rdxDialogClose [class]="cn(b.base, b.primary, b.size.sm)">Rename</button>
                    </div>
                    <button aria-label="Close" rdxDialogClose [class]="d.close">
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
