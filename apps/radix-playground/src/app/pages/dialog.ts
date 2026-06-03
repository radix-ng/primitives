import { DemoPage } from '../shared/demo-page';
import { cn, demoButton, demoDialog, demoInput } from '../shared/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';

@Component({
    selector: 'app-dialog',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [DemoPage, ...dialogImports, LucideX],
    template: `
        <demo-page
            title="Dialog"
            description="A modal window overlaid on the page, rendered in a portal, that traps focus until dismissed."
        >
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
                            <svg aria-hidden="true" lucideX size="16"></svg>
                        </button>
                    </div>
                </ng-template>
            </div>
        </demo-page>
    `
})
export default class DialogPage {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
    protected readonly input = demoInput;
}
