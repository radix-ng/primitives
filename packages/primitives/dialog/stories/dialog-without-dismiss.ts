import { cn, demoButton, demoDialog } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-dialog-without-dismiss',
    imports: [...dialogImports, LucideX],
    template: `
        <div rdxDialogRoot [disablePointerDismissal]="true">
            <button rdxDialogTrigger [class]="cn(b.base, b.primary, b.size.md)">Open dialog</button>

            <ng-template rdxDialogPortal>
                <div rdxDialogBackdrop [class]="cn(d.backdrop, d.backdropAnimated)"></div>

                <div rdxDialogPopup [class]="cn(d.popup, d.popupAnimated)">
                    <h2 rdxDialogTitle [class]="d.title">Confirm your choice</h2>
                    <p rdxDialogDescription [class]="d.description">
                        Clicking the backdrop will not close this dialog. Use a button or press Escape instead.
                    </p>

                    <div [class]="d.footer">
                        <button rdxDialogClose [class]="cn(b.base, b.outline, b.size.sm)">Cancel</button>
                        <button rdxDialogClose [class]="cn(b.base, b.destructive, b.size.sm)">Delete</button>
                    </div>

                    <button aria-label="Close" rdxDialogClose [class]="d.close">
                        <svg aria-hidden="true" lucideX size="16" />
                    </button>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDialogWithoutDismissComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
}
