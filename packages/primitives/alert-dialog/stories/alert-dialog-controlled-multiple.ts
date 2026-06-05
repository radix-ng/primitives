import { Component, signal } from '@angular/core';
import { alertDialogImports } from '@radix-ng/primitives/alert-dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    selector: 'rdx-alert-dialog-controlled-multiple',
    imports: [...alertDialogImports],
    template: `
        <div class="flex flex-col items-center gap-3">
            <p class="text-muted-foreground text-xs">open: {{ open() }} · triggerId: {{ triggerId() ?? '—' }}</p>

            <div [(open)]="open" [(triggerId)]="triggerId" rdxAlertDialogRoot>
                <div class="flex gap-2">
                    <button id="logout" [class]="cn(b.base, b.outline, b.size.md)" rdxAlertDialogTrigger>
                        Log out
                    </button>
                    <button id="delete" [class]="cn(b.base, b.outline, b.size.md)" rdxAlertDialogTrigger>
                        Delete account
                    </button>
                </div>

                <ng-template rdxAlertDialogPortalPresence>
                    <div [class]="d.portalAnimated" rdxAlertDialogPortal>
                        <div [class]="d.backdrop" rdxAlertDialogBackdrop></div>
                        <div [class]="cn(d.popup, d.popupAnimated)" rdxAlertDialogPopup>
                            <h2 [class]="d.title" rdxAlertDialogTitle>
                                {{ triggerId() === 'delete' ? 'Delete account?' : 'Log out?' }}
                            </h2>
                            <p [class]="d.description" rdxAlertDialogDescription>
                                Both
                                <code>open</code>
                                and
                                <code>triggerId</code>
                                are bound, so the active action is driven from component state.
                            </p>
                            <div [class]="d.footer">
                                <button [class]="cn(b.base, b.outline, b.size.sm)" rdxAlertDialogClose>Cancel</button>
                                <button
                                    [class]="
                                        cn(b.base, triggerId() === 'delete' ? b.destructive : b.primary, b.size.sm)
                                    "
                                    rdxAlertDialogClose
                                >
                                    {{ triggerId() === 'delete' ? 'Delete' : 'Log out' }}
                                </button>
                            </div>
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
