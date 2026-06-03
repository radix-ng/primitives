import { cn, demoButton, demoDialog, demoInput } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { alertDialogImports } from '@radix-ng/primitives/alert-dialog';
import { dialogImports, RdxDialogOpenChange } from '@radix-ng/primitives/dialog';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-alert-dialog-close-confirmation',
    imports: [...dialogImports, ...alertDialogImports, FormsModule],
    template: `
        <!-- The editor is a regular Dialog, controlled so a close request can be intercepted. -->
        <div rdxDialogRoot [(open)]="editorOpen" (onOpenChange)="onEditorOpenChange($event)">
            <button rdxDialogTrigger [class]="cn(b.base, b.primary, b.size.md)">Edit note</button>

            <ng-template rdxDialogPortal>
                <div rdxDialogBackdrop [class]="cn(d.backdrop, d.backdropAnimated)"></div>
                <div rdxDialogPopup [class]="cn(d.popup, d.popupAnimated)">
                    <h2 rdxDialogTitle [class]="d.title">Edit note</h2>
                    <p rdxDialogDescription [class]="d.description">
                        Closing with unsaved changes asks an alert dialog to confirm.
                    </p>

                    <label [class]="d.field">
                        Note
                        <input placeholder="Type to create changes" [class]="input" [(ngModel)]="text" />
                    </label>

                    <div [class]="d.footer">
                        <button [class]="cn(b.base, b.outline, b.size.sm)" (click)="requestClose()">Cancel</button>
                        <button [class]="cn(b.base, b.primary, b.size.sm)" (click)="save()">Save</button>
                    </div>
                </div>
            </ng-template>
        </div>

        <!-- The confirmation is an Alert Dialog (assertive, not outside-dismissable). -->
        <div rdxAlertDialogRoot [(open)]="confirmOpen">
            <ng-template rdxAlertDialogPortal>
                <div rdxAlertDialogBackdrop [class]="cn(d.backdrop, d.backdropAnimated)"></div>
                <div rdxAlertDialogPopup [class]="cn(d.popup, d.popupAnimated)">
                    <h2 rdxAlertDialogTitle [class]="d.title">Discard changes?</h2>
                    <p rdxAlertDialogDescription [class]="d.description">Your unsaved note will be lost.</p>
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
