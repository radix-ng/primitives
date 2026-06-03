import { cn, demoButton, demoDialog } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { alertDialogImports } from '@radix-ng/primitives/alert-dialog';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-alert-dialog-controlled-multiple',
    imports: [...alertDialogImports],
    template: `
        <div class="flex flex-col items-center gap-3">
            <p class="text-muted-foreground text-xs">open: {{ open() }} · triggerId: {{ triggerId() ?? '—' }}</p>

            <div rdxAlertDialogRoot [(open)]="open" [(triggerId)]="triggerId">
                <div class="flex gap-2">
                    <button id="logout" rdxAlertDialogTrigger [class]="cn(b.base, b.outline, b.size.md)">
                        Log out
                    </button>
                    <button id="delete" rdxAlertDialogTrigger [class]="cn(b.base, b.outline, b.size.md)">
                        Delete account
                    </button>
                </div>

                <ng-template rdxAlertDialogPortal>
                    <div rdxAlertDialogBackdrop [class]="cn(d.backdrop, d.backdropAnimated)"></div>
                    <div rdxAlertDialogPopup [class]="cn(d.popup, d.popupAnimated)">
                        <h2 rdxAlertDialogTitle [class]="d.title">
                            {{ triggerId() === 'delete' ? 'Delete account?' : 'Log out?' }}
                        </h2>
                        <p rdxAlertDialogDescription [class]="d.description">
                            Both
                            <code>open</code>
                            and
                            <code>triggerId</code>
                            are bound, so the active action is driven from component state.
                        </p>
                        <div [class]="d.footer">
                            <button rdxAlertDialogClose [class]="cn(b.base, b.outline, b.size.sm)">Cancel</button>
                            <button
                                rdxAlertDialogClose
                                [class]="cn(b.base, triggerId() === 'delete' ? b.destructive : b.primary, b.size.sm)"
                            >
                                {{ triggerId() === 'delete' ? 'Delete' : 'Log out' }}
                            </button>
                        </div>
                    </div>
                </ng-template>
            </div>

            <button [class]="cn(b.base, b.secondary, b.size.sm)" (click)="confirmDelete()">Delete externally</button>
        </div>
    `
})
export class RdxAlertDialogControlledMultipleComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
    protected readonly open = signal(false);
    protected readonly triggerId = signal<string | null>(null);

    protected confirmDelete() {
        this.triggerId.set('delete');
        this.open.set(true);
    }
}
