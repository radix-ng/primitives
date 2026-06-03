import { cn, demoButton, demoDialog, demoInput } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-dialog-default',
    imports: [...dialogImports, LucideX],
    template: `
        <div rdxDialogRoot>
            <button rdxDialogTrigger [class]="cn(b.base, b.primary, b.size.md)">Edit profile</button>

            <ng-template rdxDialogPortal>
                <div rdxDialogBackdrop [class]="cn(d.backdrop, d.backdropAnimated)"></div>

                <div rdxDialogPopup [class]="cn(d.popup, d.popupAnimated)">
                    <h2 rdxDialogTitle [class]="d.title">Edit profile</h2>
                    <p rdxDialogDescription [class]="d.description">
                        Make changes to your profile here. Click save when you're done.
                    </p>

                    <label [class]="d.field">
                        Name
                        <input value="Pedro Duarte" [class]="input" />
                    </label>
                    <label [class]="d.field">
                        Username
                        <input value="@peduarte" [class]="input" />
                    </label>

                    <div [class]="d.footer">
                        <button rdxDialogClose [class]="cn(b.base, b.outline, b.size.sm)">Cancel</button>
                        <button rdxDialogClose [class]="cn(b.base, b.primary, b.size.sm)">Save changes</button>
                    </div>

                    <button aria-label="Close" rdxDialogClose [class]="d.close">
                        <svg aria-hidden="true" lucideX size="16" />
                    </button>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDialogDefaultComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
    protected readonly input = demoInput;
}
