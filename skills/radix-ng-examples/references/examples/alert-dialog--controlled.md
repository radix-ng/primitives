# Alert Dialog — Controlled

> One example from the [Alert Dialog](../components/alert-dialog.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

Bind `[(open)]` to open or close the alert dialog from component state.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { alertDialogImports } from '@radix-ng/primitives/alert-dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-alert-dialog-controlled',
    imports: [...alertDialogImports],
    template: `
        <div class="flex flex-col items-center gap-4">
            <p class="text-muted-foreground text-xs">Alert dialog is {{ open() ? 'open' : 'closed' }}</p>

            <button [class]="cn(b.base, b.outline, b.size.sm)" (click)="open.set(true)">Open from outside</button>

            <div [(open)]="open" rdxAlertDialogRoot>
                <button [class]="cn(b.base, b.destructive, b.size.md)" rdxAlertDialogTrigger>Discard changes</button>

                <ng-template rdxAlertDialogPortal>
                    <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxAlertDialogBackdrop></div>

                    <div [class]="cn(d.popup, d.popupAnimated)" rdxAlertDialogPopup>
                        <h2 [class]="d.title" rdxAlertDialogTitle>Discard unsaved changes?</h2>
                        <p [class]="d.description" rdxAlertDialogDescription>
                            The open state is owned by the component and bound with
                            <code>[(open)]</code>
                            .
                        </p>

                        <div [class]="d.footer">
                            <button [class]="cn(b.base, b.outline, b.size.sm)" (click)="open.set(false)">
                                Keep editing
                            </button>
                            <button [class]="cn(b.base, b.destructive, b.size.sm)" (click)="open.set(false)">
                                Discard
                            </button>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class RdxAlertDialogControlledComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
    protected readonly open = signal(false);
}
```
