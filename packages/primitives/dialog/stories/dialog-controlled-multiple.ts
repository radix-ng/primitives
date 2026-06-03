import { cn, demoButton, demoDialog } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-dialog-controlled-multiple',
    imports: [...dialogImports, LucideX],
    template: `
        <div class="flex flex-col items-center gap-3">
            <p class="text-muted-foreground text-xs">open: {{ open() }} · triggerId: {{ triggerId() ?? '—' }}</p>

            <div #root="rdxDialogRoot" rdxDialogRoot [(open)]="open" [(triggerId)]="triggerId">
                <div class="flex gap-2">
                    <button id="account" rdxDialogTrigger [class]="cn(b.base, b.outline, b.size.md)">Account</button>
                    <button id="billing" rdxDialogTrigger [class]="cn(b.base, b.outline, b.size.md)">Billing</button>
                </div>

                <ng-template rdxDialogPortal>
                    <div rdxDialogBackdrop [class]="cn(d.backdrop, d.backdropAnimated)"></div>
                    <div rdxDialogPopup [class]="cn(d.popup, d.popupAnimated)">
                        <h2 rdxDialogTitle [class]="d.title">
                            {{ triggerId() === 'billing' ? 'Billing' : 'Account' }}
                        </h2>
                        <p rdxDialogDescription [class]="d.description">
                            Both
                            <code>open</code>
                            and
                            <code>triggerId</code>
                            are bound, so the active panel is driven from component state.
                        </p>
                        <div [class]="d.footer">
                            <button rdxDialogClose [class]="cn(b.base, b.primary, b.size.sm)">Close</button>
                        </div>
                        <button aria-label="Close" rdxDialogClose [class]="d.close">
                            <svg aria-hidden="true" lucideX size="16" />
                        </button>
                    </div>
                </ng-template>
            </div>

            <button [class]="cn(b.base, b.secondary, b.size.sm)" (click)="openBilling()">
                Open billing externally
            </button>
        </div>
    `
})
export class RdxDialogControlledMultipleComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
    protected readonly open = signal(false);
    protected readonly triggerId = signal<string | null>(null);

    protected openBilling() {
        this.triggerId.set('billing');
        this.open.set(true);
    }
}
