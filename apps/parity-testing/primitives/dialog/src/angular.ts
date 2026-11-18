import { Component, provideZonelessChangeDetection, signal, viewChild } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { dialogImports, RdxDialogOpenChange, RdxDialogRoot } from '@radix-ng/primitives/dialog';
import { classes, config, installProbe } from './contract';
import './fixture.css';

@Component({
    selector: 'parity-dialog',
    imports: [dialogImports],
    host: { '(document:keydown)': 'command($event)' },
    template: `
        <main class="flex gap-2">
            <button
                [class]="styles.trigger"
                (click)="trace.probe.activations = trace.probe.activations + 1"
                data-testid="outside"
            >
                Outside
            </button>
            <div
                [open]="open()"
                [defaultOpen]="defaultOpen()"
                [triggerId]="triggerId()"
                [defaultTriggerId]="settings.defaultTriggerId ?? null"
                (onOpenChange)="change($event)"
                (openChange)="accept($event)"
                (onOpenChangeComplete)="trace.probe.completions.push($event)"
                rdxDialogRoot
            >
                <button id="primary" [class]="styles.trigger" rdxDialogTrigger data-testid="primary">Primary</button>
                @if (secondary()) {
                    <button id="secondary" [class]="styles.trigger" rdxDialogTrigger data-testid="secondary">
                        Secondary
                    </button>
                }
                <ng-template [keepMounted]="settings.keepMounted ?? false" rdxDialogPortal>
                    <div [class]="styles.backdrop" rdxDialogBackdrop data-testid="backdrop"></div>
                    <div
                        [class]="styles.popup"
                        [attr.data-motion]="settings.animate ? '' : null"
                        rdxDialogPopup
                        data-testid="popup"
                    >
                        <h2 rdxDialogTitle>Example dialog</h2>
                        <p rdxDialogDescription>Test a draft edit.</p>
                        <input [class]="styles.input" value="draft" data-testid="field" aria-label="Draft" />
                        <button [class]="styles.trigger" rdxDialogClose data-testid="close">Close</button>
                    </div>
                </ng-template>
            </div>
        </main>
    `
})
class AngularDialog {
    protected readonly styles = classes;
    protected readonly settings = config();
    protected readonly trace = installProbe();
    protected readonly open = signal(this.settings.open);
    protected readonly defaultOpen = signal(this.settings.defaultOpen ?? false);
    protected readonly triggerId = signal(this.settings.triggerId);
    protected readonly secondary = signal(!!this.settings.multiple);
    private readonly root = viewChild.required(RdxDialogRoot);
    private requested: boolean | undefined;
    private cancelNextOpen = !!this.settings.cancelOpen;
    private holdNextClose = !!this.settings.hold;

    protected change(change: RdxDialogOpenChange): void {
        const { open, eventDetails } = change;
        if (open && this.cancelNextOpen) {
            this.cancelNextOpen = false;
            eventDetails.cancel();
        }
        if (!open && this.holdNextClose) {
            this.holdNextClose = false;
            eventDetails.preventUnmountOnClose();
        }
        this.trace.change(
            open,
            eventDetails.reason,
            eventDetails.event,
            eventDetails.trigger,
            eventDetails.isCanceled()
        );
    }

    protected accept(open: boolean): void {
        this.requested = open;
        if (this.open() !== undefined && !this.settings.defer) this.open.set(open);
    }

    protected command(event: KeyboardEvent): void {
        if (!['F2', 'F3', 'F4', 'F5', 'F9', 'F10'].includes(event.key)) return;
        event.preventDefault();
        if (event.key === 'F2' && this.requested !== undefined) this.open.set(this.requested);
        if (event.key === 'F3') this.defaultOpen.update((open) => !open);
        if (event.key === 'F4') this.triggerId.set(null);
        if (event.key === 'F5') this.secondary.update((present) => !present);
        if (event.key === 'F10') this.root().close('imperative-action');
        if (event.key === 'F9' || event.key === 'F10') this.root().unmount();
    }
}

void bootstrapApplication(AngularDialog, { providers: [provideZonelessChangeDetection()] });
