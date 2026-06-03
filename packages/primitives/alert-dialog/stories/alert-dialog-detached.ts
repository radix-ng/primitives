import { cn, demoButton, demoDialog } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { alertDialogImports, createRdxAlertDialogHandle } from '@radix-ng/primitives/alert-dialog';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-alert-dialog-detached',
    imports: [...alertDialogImports],
    template: `
        <div class="flex flex-col items-center gap-3">
            <!-- Triggers live outside the root and are linked through a shared handle. -->
            <button id="delete" rdxAlertDialogTrigger [class]="cn(b.base, b.destructive, b.size.md)" [handle]="handle">
                Delete file
            </button>

            <button [class]="cn(b.base, b.secondary, b.size.sm)" (click)="handle.open('delete')">
                Open imperatively
            </button>

            <div rdxAlertDialogRoot [handle]="handle">
                <ng-template rdxAlertDialogPortal>
                    <div rdxAlertDialogBackdrop [class]="cn(d.backdrop, d.backdropAnimated)"></div>
                    <div rdxAlertDialogPopup [class]="cn(d.popup, d.popupAnimated)">
                        <h2 rdxAlertDialogTitle [class]="d.title">Delete this file?</h2>
                        <p rdxAlertDialogDescription [class]="d.description">
                            The trigger and this alert dialog are connected with
                            <code>createRdxAlertDialogHandle()</code>
                            .
                        </p>
                        <div [class]="d.footer">
                            <button rdxAlertDialogClose [class]="cn(b.base, b.outline, b.size.sm)">Cancel</button>
                            <button rdxAlertDialogClose [class]="cn(b.base, b.destructive, b.size.sm)">Delete</button>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class RdxAlertDialogDetachedComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
    protected readonly handle = createRdxAlertDialogHandle();
}
