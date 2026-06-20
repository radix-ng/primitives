import { ChangeDetectionStrategy, Component } from '@angular/core';
import { alertDialogImports, createRdxAlertDialogHandle } from '@radix-ng/primitives/alert-dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-alert-dialog-detached',
    imports: [...alertDialogImports],
    template: `
        <div class="flex flex-col items-center gap-3">
            <!-- Triggers live outside the root and are linked through a shared handle. -->
            <button id="delete" [class]="cn(b.base, b.destructive, b.size.md)" [handle]="handle" rdxAlertDialogTrigger>
                Delete file
            </button>

            <button [class]="cn(b.base, b.secondary, b.size.sm)" (click)="handle.open('delete')">
                Open imperatively
            </button>

            <div [handle]="handle" rdxAlertDialogRoot>
                <ng-template rdxAlertDialogPortal>
                    <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxAlertDialogBackdrop></div>
                    <div [class]="cn(d.popup, d.popupAnimated)" rdxAlertDialogPopup>
                        <h2 [class]="d.title" rdxAlertDialogTitle>Delete this file?</h2>
                        <p [class]="d.description" rdxAlertDialogDescription>
                            The trigger and this alert dialog are connected with
                            <code>createRdxAlertDialogHandle()</code>
                            .
                        </p>
                        <div [class]="d.footer">
                            <button [class]="cn(b.base, b.outline, b.size.sm)" rdxAlertDialogClose>Cancel</button>
                            <button [class]="cn(b.base, b.destructive, b.size.sm)" rdxAlertDialogClose>Delete</button>
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
