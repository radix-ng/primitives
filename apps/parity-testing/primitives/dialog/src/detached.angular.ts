import { Component, computed, signal } from '@angular/core';
import { createRdxDialogHandle, dialogImports, type RdxDialogOpenChange } from '@radix-ng/primitives/dialog';
import { classes, config, installProbe } from './contract';

@Component({
    selector: 'parity-dialog',
    imports: [dialogImports],
    host: { '(document:keydown)': 'command($event)' },
    template: `
        <main class="flex gap-2">
            <button [class]="styles.trigger" data-testid="outside" type="button">Outside</button>
            <button
                id="primary"
                [class]="styles.trigger"
                [handle]="firstHandle"
                [payload]="'account' + revision()"
                rdxDialogTrigger
                data-testid="primary"
            >
                Account
            </button>
            @if (secondary()) {
                <button
                    id="secondary"
                    [class]="styles.trigger"
                    [handle]="settings.swap ? secondHandle : firstHandle"
                    [payload]="'billing' + revision()"
                    rdxDialogTrigger
                    data-testid="secondary"
                >
                    Billing
                </button>
            }
            @if (rootMounted()) {
                <div
                    #dialog="rdxDialogRoot"
                    [handle]="handle()"
                    [open]="open()"
                    (openChange)="accept($event)"
                    (onOpenChange)="change($event)"
                    (onOpenChangeComplete)="trace.probe.completions.push($event)"
                    rdxDialogRoot
                >
                    <ng-template rdxDialogPortal>
                        <div [class]="styles.backdrop" rdxDialogBackdrop data-testid="backdrop"></div>
                        <div [class]="styles.popup" rdxDialogPopup data-testid="popup">
                            <h2 rdxDialogTitle>Example dialog</h2>
                            <p rdxDialogDescription>Test a draft edit.</p>
                            <p data-testid="payload">{{ dialog.payload() }}</p>
                            <input [class]="styles.input" value="draft" data-testid="field" aria-label="Draft" />
                            <button [class]="styles.trigger" rdxDialogClose data-testid="close">Close</button>
                        </div>
                    </ng-template>
                </div>
            }
        </main>
    `
})
export class AngularDetachedDialog {
    protected readonly styles = classes;
    protected readonly settings = config().detached!;
    protected readonly trace = installProbe();
    protected readonly firstHandle = createRdxDialogHandle<string>();
    protected readonly secondHandle = createRdxDialogHandle<string>();
    protected readonly open = signal<boolean | undefined>(this.settings.controlled ? false : undefined);
    protected readonly rootMounted = signal(!this.settings.initiallyDetached);
    protected readonly secondary = signal(!!this.settings.secondary);
    protected readonly revision = signal('');
    private readonly swapped = signal(false);
    protected readonly handle = computed(() => (this.swapped() ? this.secondHandle : this.firstHandle));

    constructor() {
        this.trace.probe.readHandles = () => [this.firstHandle.isOpen(), this.secondHandle.isOpen()];
    }

    protected change({ open, eventDetails }: RdxDialogOpenChange): void {
        const { reason, event, trigger } = eventDetails;
        this.trace.change(open, reason, event, trigger, eventDetails.isCanceled());
    }

    protected accept(open: boolean): void {
        if (open && this.settings.controlled) this.open.set(true);
    }

    protected command(event: KeyboardEvent): void {
        if (!['F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10'].includes(event.key)) return;
        event.preventDefault();
        if (event.key === 'F2') this.handle().open(null);
        if (event.key === 'F3') this.revision.set(' updated');
        if (event.key === 'F4') this.firstHandle.close();
        if (event.key === 'F5') this.secondary.update((visible) => !visible);
        if (event.key === 'F6') this.rootMounted.update((mounted) => !mounted);
        if (event.key === 'F7') this.swapped.update((swapped) => !swapped);
        if (event.key === 'F8') this.handle().open(this.settings.openId ?? 'primary');
        if (event.key === 'F9') this.handle().close();
        if (event.key === 'F10') this.handle().openWithPayload('programmatic data');
    }
}
