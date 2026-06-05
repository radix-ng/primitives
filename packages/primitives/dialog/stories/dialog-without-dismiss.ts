import { Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    selector: 'rdx-dialog-without-dismiss',
    imports: [...dialogImports, LucideX],
    template: `
        <div [disablePointerDismissal]="true" rdxDialogRoot>
            <button [class]="cn(b.base, b.primary, b.size.md)" rdxDialogTrigger>Open dialog</button>

            <ng-template rdxDialogPortalPresence>
                <div [class]="d.portalAnimated" rdxDialogPortal>
                    <div [class]="d.backdrop" rdxDialogBackdrop></div>

                    <div [class]="cn(d.popup, d.popupAnimated)" rdxDialogPopup>
                        <h2 [class]="d.title" rdxDialogTitle>Confirm your choice</h2>
                        <p [class]="d.description" rdxDialogDescription>
                            Clicking the backdrop will not close this dialog. Use a button or press Escape instead.
                        </p>

                        <div [class]="d.footer">
                            <button [class]="cn(b.base, b.outline, b.size.sm)" rdxDialogClose>Cancel</button>
                            <button [class]="cn(b.base, b.destructive, b.size.sm)" rdxDialogClose>Delete</button>
                        </div>

                        <button [class]="d.close" aria-label="Close" rdxDialogClose>
                            <svg aria-hidden="true" lucideX size="16" />
                        </button>
                    </div>
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
