# Alert Dialog — Default

> One example from the [Alert Dialog](../components/alert-dialog.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

A destructive confirmation with Cancel and an action button. Clicking the backdrop keeps it open.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { alertDialogImports } from '@radix-ng/primitives/alert-dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-alert-dialog-default',
    imports: [...alertDialogImports],
    template: `
        <div rdxAlertDialogRoot>
            <button [class]="cn(b.base, b.destructive, b.size.md)" rdxAlertDialogTrigger>Delete account</button>

            <ng-template rdxAlertDialogPortal>
                <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxAlertDialogBackdrop></div>

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
            </ng-template>
        </div>
    `
})
export class RdxAlertDialogDefaultComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
}
```
