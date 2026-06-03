import { cn, demoButton, demoDialog } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { alertDialogImports } from '@radix-ng/primitives/alert-dialog';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-alert-dialog-default',
    imports: [...alertDialogImports],
    template: `
        <div rdxAlertDialogRoot>
            <button rdxAlertDialogTrigger [class]="cn(b.base, b.destructive, b.size.md)">Delete account</button>

            <ng-template rdxAlertDialogPortal>
                <div rdxAlertDialogBackdrop [class]="cn(d.backdrop, d.backdropAnimated)"></div>

                <div rdxAlertDialogPopup [class]="cn(d.popup, d.popupAnimated)">
                    <h2 rdxAlertDialogTitle [class]="d.title">Are you absolutely sure?</h2>
                    <p rdxAlertDialogDescription [class]="d.description">
                        This action cannot be undone. This will permanently delete your account and remove your data
                        from our servers.
                    </p>

                    <div [class]="d.footer">
                        <button rdxAlertDialogClose [class]="cn(b.base, b.outline, b.size.sm)">Cancel</button>
                        <button rdxAlertDialogClose [class]="cn(b.base, b.destructive, b.size.sm)">
                            Yes, delete account
                        </button>
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
