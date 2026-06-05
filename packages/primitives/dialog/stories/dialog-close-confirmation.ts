import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideX } from '@lucide/angular';
import { dialogImports, RdxDialogOpenChange } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog, demoInput } from '../../storybook/styles';

@Component({
    selector: 'rdx-dialog-close-confirmation',
    imports: [...dialogImports, FormsModule, LucideX],
    template: `
        <!-- The editor dialog is controlled so a close request can be intercepted. -->
        <div [(open)]="editorOpen" (onOpenChange)="onEditorOpenChange($event)" rdxDialogRoot>
            <button [class]="cn(b.base, b.primary, b.size.md)" rdxDialogTrigger>Edit description</button>

            <ng-template rdxDialogPortalPresence>
                <div [class]="d.portalAnimated" rdxDialogPortal>
                    <div [class]="d.backdrop" rdxDialogBackdrop></div>

                    <div [class]="cn(d.popup, d.popupAnimated)" rdxDialogPopup>
                        <h2 [class]="d.title" rdxDialogTitle>Edit description</h2>
                        <p [class]="d.description" rdxDialogDescription>
                            Closing with unsaved changes asks for confirmation.
                        </p>

                        <label [class]="d.field">
                            Description
                            <input [(ngModel)]="text" [class]="input" placeholder="Type to create changes" />
                        </label>

                        <div [class]="d.footer">
                            <button [class]="cn(b.base, b.outline, b.size.sm)" (click)="requestClose()">Cancel</button>
                            <button [class]="cn(b.base, b.primary, b.size.sm)" (click)="save()">Save</button>
                        </div>

                        <button [class]="d.close" (click)="requestClose()" aria-label="Close">
                            <svg aria-hidden="true" lucideX size="16" />
                        </button>
                    </div>
                </div>
            </ng-template>
        </div>

        <!-- Confirmation dialog, controlled separately. -->
        <div [(open)]="confirmOpen" rdxDialogRoot>
            <ng-template rdxDialogPortalPresence>
                <div [class]="d.portalAnimated" rdxDialogPortal>
                    <div [class]="d.backdrop" rdxDialogBackdrop></div>
                    <div [class]="cn(d.popup, d.popupAnimated)" rdxDialogPopup>
                        <h2 [class]="d.title" rdxDialogTitle>Discard changes?</h2>
                        <p [class]="d.description" rdxDialogDescription>Your edits will be lost.</p>
                        <div [class]="d.footer">
                            <button [class]="cn(b.base, b.outline, b.size.sm)" (click)="confirmOpen.set(false)">
                                Keep editing
                            </button>
                            <button [class]="cn(b.base, b.destructive, b.size.sm)" (click)="discard()">Discard</button>
                        </div>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDialogCloseConfirmationComponent {
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
