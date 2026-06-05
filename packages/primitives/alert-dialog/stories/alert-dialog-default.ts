import { Component } from '@angular/core';
import { alertDialogImports } from '@radix-ng/primitives/alert-dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    selector: 'rdx-alert-dialog-default',
    imports: [...alertDialogImports],
    template: `
        <div rdxAlertDialogRoot>
            <button [class]="cn(b.base, b.destructive, b.size.md)" rdxAlertDialogTrigger>Delete account</button>

            <ng-template rdxAlertDialogPortalPresence>
                <div [class]="d.portalAnimated" rdxAlertDialogPortal>
                    <div [class]="d.backdrop" rdxAlertDialogBackdrop></div>

                    <div [class]="cn(d.popup, d.popupAnimated)" rdxAlertDialogPopup>
                        <h2 [class]="d.title" rdxAlertDialogTitle>Are you absolutely sure?</h2>
                        <p [class]="d.description" rdxAlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account and remove your data
                            from our servers.
                        </p>

                        <div [class]="d.footer">
                            <button [class]="cn(b.base, b.outline, b.size.sm)" rdxAlertDialogClose>Cancel</button>
                            <button [class]="cn(b.base, b.destructive, b.size.sm)" rdxAlertDialogClose>
                                Yes, delete account
                            </button>
                        </div>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxAlertDialogDefaultComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
}
