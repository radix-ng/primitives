import { cn, demoButton, demoDialog } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { alertDialogImports } from '@radix-ng/primitives/alert-dialog';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-alert-dialog-controlled',
    imports: [...alertDialogImports],
    template: `
        <div class="flex flex-col items-center gap-4">
            <p class="text-muted-foreground text-xs">Alert dialog is {{ open() ? 'open' : 'closed' }}</p>

            <button [class]="cn(b.base, b.outline, b.size.sm)" (click)="open.set(true)">Open from outside</button>

            <div rdxAlertDialogRoot [(open)]="open">
                <button rdxAlertDialogTrigger [class]="cn(b.base, b.destructive, b.size.md)">Discard changes</button>

                <ng-template rdxAlertDialogPortal>
                    <div rdxAlertDialogBackdrop [class]="cn(d.backdrop, d.backdropAnimated)"></div>

                    <div rdxAlertDialogPopup [class]="cn(d.popup, d.popupAnimated)">
                        <h2 rdxAlertDialogTitle [class]="d.title">Discard unsaved changes?</h2>
                        <p rdxAlertDialogDescription [class]="d.description">
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
