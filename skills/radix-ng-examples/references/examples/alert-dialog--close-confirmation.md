# Alert Dialog — Close confirmation

> One example from the [Alert Dialog](../components/alert-dialog.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

A regular Dialog editor asks an Alert Dialog to confirm before discarding unsaved changes — the classic
reason to reach for an alert dialog.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { alertDialogImports } from '@radix-ng/primitives/alert-dialog';
import { dialogImports, RdxDialogOpenChange } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog, demoInput } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-alert-dialog-close-confirmation',
    imports: [...dialogImports, ...alertDialogImports, FormsModule],
    template: `
        <!-- The editor is a regular Dialog, controlled so a close request can be intercepted. -->
        <div [(open)]="editorOpen" (onOpenChange)="onEditorOpenChange($event)" rdxDialogRoot>
            <button [class]="cn(b.base, b.primary, b.size.md)" rdxDialogTrigger>Edit note</button>

            <ng-template rdxDialogPortal>
                <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxDialogBackdrop></div>
                <div [class]="cn(d.popup, d.popupAnimated)" rdxDialogPopup>
                    <h2 [class]="d.title" rdxDialogTitle>Edit note</h2>
                    <p [class]="d.description" rdxDialogDescription>
                        Closing with unsaved changes asks an alert dialog to confirm.
                    </p>

                    <label [class]="d.field">
                        Note
                        <input [(ngModel)]="text" [class]="input" placeholder="Type to create changes" />
                    </label>

                    <div [class]="d.footer">
                        <button [class]="cn(b.base, b.outline, b.size.sm)" (click)="requestClose()">Cancel</button>
                        <button [class]="cn(b.base, b.primary, b.size.sm)" (click)="save()">Save</button>
                    </div>
                </div>
            </ng-template>
        </div>

        <!-- The confirmation is an Alert Dialog (assertive, not outside-dismissable). -->
        <div [(open)]="confirmOpen" rdxAlertDialogRoot>
            <ng-template rdxAlertDialogPortal>
                <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxAlertDialogBackdrop></div>
                <div [class]="cn(d.popup, d.popupAnimated)" rdxAlertDialogPopup>
                    <h2 [class]="d.title" rdxAlertDialogTitle>Discard changes?</h2>
                    <p [class]="d.description" rdxAlertDialogDescription>Your unsaved note will be lost.</p>
                    <div [class]="d.footer">
                        <button [class]="cn(b.base, b.outline, b.size.sm)" (click)="confirmOpen.set(false)">
                            Keep editing
                        </button>
                        <button [class]="cn(b.base, b.destructive, b.size.sm)" (click)="discard()">Discard</button>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxAlertDialogCloseConfirmationComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
    protected readonly input = demoInput;

    protected readonly editorOpen = signal(false);
    protected readonly confirmOpen = signal(false);
    protected text = '';

    private get hasChanges() {
        return this.text.trim().length > 0;
    }

    protected onEditorOpenChange(change: RdxDialogOpenChange) {
        // Re-open the editor and ask for confirmation when there are unsaved changes.
        if (!change.open && this.hasChanges) {
            this.editorOpen.set(true);
            this.confirmOpen.set(true);
        }
    }

    protected requestClose() {
        if (this.hasChanges) {
            this.confirmOpen.set(true);
        } else {
            this.editorOpen.set(false);
        }
    }

    protected save() {
        this.text = '';
        this.editorOpen.set(false);
    }

    protected discard() {
        this.text = '';
        this.confirmOpen.set(false);
        this.editorOpen.set(false);
    }
}
```
