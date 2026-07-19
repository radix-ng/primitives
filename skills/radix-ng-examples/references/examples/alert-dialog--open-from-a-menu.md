# Alert Dialog — Open from a menu

> One example from the [Alert Dialog](../components/alert-dialog.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

Control the alert dialog's `open` state from a menu item to launch a destructive confirmation from a `Menu`.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { alertDialogImports } from '@radix-ng/primitives/alert-dialog';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoDialog, demoMenu } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-alert-dialog-from-menu',
    imports: [...alertDialogImports, RdxMenuModule],
    template: `
        <ng-container #menu="rdxMenuRoot" rdxMenuRoot>
            <button [class]="cn(b.base, b.outline, b.size.md)" rdxMenuTrigger>Project</button>

            @if (menu.open()) {
                <div [class]="m.positioner" sideOffset="4" rdxMenuPositioner>
                    <div [class]="m.popup" rdxMenuPopup>
                        <button [class]="m.item" rdxMenuItem>Rename</button>
                        <button [class]="m.item" rdxMenuItem>Duplicate</button>
                        <div [class]="m.separator" rdxMenuSeparator></div>
                        <button [class]="m.item" (click)="deleteOpen.set(true)" rdxMenuItem>Delete…</button>
                    </div>
                </div>
            }
        </ng-container>

        <!-- Controlled alert dialog opened from the menu item. -->
        <div [(open)]="deleteOpen" rdxAlertDialogRoot>
            <ng-template rdxAlertDialogPortal>
                <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxAlertDialogBackdrop></div>
                <div [class]="cn(d.popup, d.popupAnimated)" rdxAlertDialogPopup>
                    <h2 [class]="d.title" rdxAlertDialogTitle>Delete project?</h2>
                    <p [class]="d.description" rdxAlertDialogDescription>
                        This permanently deletes the project. Opened by controlling the alert dialog from a menu item.
                    </p>
                    <div [class]="d.footer">
                        <button [class]="cn(b.base, b.outline, b.size.sm)" rdxAlertDialogClose>Cancel</button>
                        <button [class]="cn(b.base, b.destructive, b.size.sm)" rdxAlertDialogClose>Delete</button>
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
```
