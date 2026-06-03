import { cn, demoButton, demoDialog, demoMenu } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { alertDialogImports } from '@radix-ng/primitives/alert-dialog';
import { RdxMenuModule } from '@radix-ng/primitives/menu';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-alert-dialog-from-menu',
    imports: [...alertDialogImports, RdxMenuModule],
    template: `
        <ng-container #menu="rdxMenuRoot" rdxMenuRoot>
            <button rdxMenuTrigger [class]="cn(b.base, b.outline, b.size.md)">Project</button>

            @if (menu.open()) {
                <div sideOffset="4" rdxMenuPositioner [class]="m.positioner">
                    <div rdxMenuPopup [class]="m.popup">
                        <button rdxMenuItem [class]="m.item">Rename</button>
                        <button rdxMenuItem [class]="m.item">Duplicate</button>
                        <div rdxMenuSeparator [class]="m.separator"></div>
                        <button rdxMenuItem [class]="m.item" (click)="deleteOpen.set(true)">Delete…</button>
                    </div>
                </div>
            }
        </ng-container>

        <!-- Controlled alert dialog opened from the menu item. -->
        <div rdxAlertDialogRoot [(open)]="deleteOpen">
            <ng-template rdxAlertDialogPortal>
                <div rdxAlertDialogBackdrop [class]="cn(d.backdrop, d.backdropAnimated)"></div>
                <div rdxAlertDialogPopup [class]="cn(d.popup, d.popupAnimated)">
                    <h2 rdxAlertDialogTitle [class]="d.title">Delete project?</h2>
                    <p rdxAlertDialogDescription [class]="d.description">
                        This permanently deletes the project. Opened by controlling the alert dialog from a menu item.
                    </p>
                    <div [class]="d.footer">
                        <button rdxAlertDialogClose [class]="cn(b.base, b.outline, b.size.sm)">Cancel</button>
                        <button rdxAlertDialogClose [class]="cn(b.base, b.destructive, b.size.sm)">Delete</button>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxAlertDialogFromMenuComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
    protected readonly m = demoMenu;
    protected readonly deleteOpen = signal(false);
}
