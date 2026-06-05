import { Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    selector: 'rdx-dialog-controlled-multiple',
    imports: [...dialogImports, LucideX],
    template: `
        <div class="flex flex-col items-center gap-3">
            <p class="text-muted-foreground text-xs">open: {{ open() }} · triggerId: {{ triggerId() ?? '—' }}</p>

            <div #root="rdxDialogRoot" [(open)]="open" [(triggerId)]="triggerId" rdxDialogRoot>
                <div class="flex gap-2">
                    <button id="account" [class]="cn(b.base, b.outline, b.size.md)" rdxDialogTrigger>Account</button>
                    <button id="billing" [class]="cn(b.base, b.outline, b.size.md)" rdxDialogTrigger>Billing</button>
                </div>

                <ng-template rdxDialogPortalPresence>
                    <div [class]="d.portalAnimated" rdxDialogPortal>
                        <div [class]="d.backdrop" rdxDialogBackdrop></div>
                        <div [class]="cn(d.popup, d.popupAnimated)" rdxDialogPopup>
                            <h2 [class]="d.title" rdxDialogTitle>
                                {{ triggerId() === 'billing' ? 'Billing' : 'Account' }}
                            </h2>
                            <p [class]="d.description" rdxDialogDescription>
                                Both
                                <code>open</code>
                                and
                                <code>triggerId</code>
                                are bound, so the active panel is driven from component state.
                            </p>
                            <div [class]="d.footer">
                                <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDialogClose>Close</button>
                            </div>
                            <button [class]="d.close" aria-label="Close" rdxDialogClose>
                                <svg aria-hidden="true" lucideX size="16" />
                            </button>
                        </div>
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
