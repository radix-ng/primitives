import { Component, provideZonelessChangeDetection, signal, viewChild } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { dialogImports, RdxDialogOpenChange, RdxDialogRoot } from '@radix-ng/primitives/dialog';
import '../../../../radix-storybook/.storybook/tailwind.css';
import { classes, config, installProbe, type NestedLayer } from './contract';
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
                [modal]="settings.modal ?? true"
                [disablePointerDismissal]="settings.disablePointerDismissal ?? false"
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
                    @if (settings.backdrop ?? settings.modal === undefined) {
                        <div [class]="styles.backdrop" rdxDialogBackdrop data-testid="backdrop"></div>
                    }
                    <div
                        [class]="styles.popup"
                        [attr.data-motion]="settings.animate ? '' : null"
                        rdxDialogPopup
                        data-testid="popup"
                    >
                        <h2 rdxDialogTitle>Example dialog</h2>
                        <p rdxDialogDescription>Test a draft edit.</p>
                        <input [class]="styles.input" value="draft" data-testid="field" aria-label="Draft" />
                        @if (settings.nested; as nested) {
                            @if (showNested()) {
                                <div
                                    (onOpenChange)="nestedChange('child', $event)"
                                    (onOpenChangeComplete)="
                                        trace.probe.nestedCompletions.push({ layer: 'child', open: $event })
                                    "
                                    rdxDialogRoot
                                >
                                    <button
                                        id="child-trigger"
                                        [class]="styles.trigger"
                                        rdxDialogTrigger
                                        data-testid="child-trigger"
                                    >
                                        Open child
                                    </button>
                                    <ng-template [keepMounted]="nested.keepMounted ?? false" rdxDialogPortal>
                                        <div
                                            [class]="styles.backdrop"
                                            [forceRender]="nested.forceRender ?? false"
                                            rdxDialogBackdrop
                                            data-testid="child-backdrop"
                                        ></div>
                                        <div
                                            [class]="styles.popup"
                                            [attr.data-motion]="nested.animate ? '' : null"
                                            rdxDialogPopup
                                            data-testid="child-popup"
                                        >
                                            <h2 rdxDialogTitle>Child dialog</h2>
                                            <input
                                                [class]="styles.input"
                                                value="child draft"
                                                data-testid="child-field"
                                                aria-label="Child draft"
                                            />
                                            @if (nested.grandchild) {
                                                <div
                                                    (onOpenChange)="nestedChange('grandchild', $event)"
                                                    (onOpenChangeComplete)="
                                                        trace.probe.nestedCompletions.push({
                                                            layer: 'grandchild',
                                                            open: $event
                                                        })
                                                    "
                                                    rdxDialogRoot
                                                >
                                                    <button
                                                        id="grandchild-trigger"
                                                        [class]="styles.trigger"
                                                        rdxDialogTrigger
                                                        data-testid="grandchild-trigger"
                                                    >
                                                        Open grandchild
                                                    </button>
                                                    <ng-template rdxDialogPortal>
                                                        <div
                                                            [class]="styles.backdrop"
                                                            rdxDialogBackdrop
                                                            data-testid="grandchild-backdrop"
                                                        ></div>
                                                        <div
                                                            [class]="styles.popup"
                                                            rdxDialogPopup
                                                            data-testid="grandchild-popup"
                                                        >
                                                            <h2 rdxDialogTitle>Grandchild dialog</h2>
                                                            <input
                                                                [class]="styles.input"
                                                                data-testid="grandchild-field"
                                                                aria-label="Grandchild draft"
                                                            />
                                                            <button
                                                                [class]="styles.trigger"
                                                                rdxDialogClose
                                                                data-testid="grandchild-close"
                                                            >
                                                                Close grandchild
                                                            </button>
                                                        </div>
                                                    </ng-template>
                                                </div>
                                            }
                                            <button [class]="styles.trigger" rdxDialogClose data-testid="child-close">
                                                Close child
                                            </button>
                                        </div>
                                    </ng-template>
                                </div>
                            }
                        }
                        <button [class]="styles.trigger" rdxDialogClose data-testid="close">Close</button>
                    </div>
                </ng-template>
            </div>
            @if (settings.modal !== undefined) {
                <input [class]="styles.input" data-testid="outside-field" aria-label="Outside field" />
                <div class="size-16" data-testid="outside-surface"></div>
            }
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
    protected readonly showNested = signal(true);
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

    protected nestedChange(layer: NestedLayer, { open, eventDetails }: RdxDialogOpenChange): void {
        const { reason, event, trigger } = eventDetails;
        this.trace.change(open, reason, event, trigger, eventDetails.isCanceled(), layer);
    }

    protected command(event: KeyboardEvent): void {
        if (!['F2', 'F3', 'F4', 'F5', 'F6', 'F9', 'F10'].includes(event.key)) return;
        event.preventDefault();
        if (event.key === 'F2' && this.requested !== undefined) this.open.set(this.requested);
        if (event.key === 'F3') this.defaultOpen.update((open) => !open);
        if (event.key === 'F4') this.triggerId.set(null);
        if (event.key === 'F5') this.secondary.update((present) => !present);
        if (event.key === 'F6') this.showNested.update((present) => !present);
        if (event.key === 'F10') this.root().close('imperative-action');
        if (event.key === 'F9' || event.key === 'F10') this.root().unmount();
    }
}

void bootstrapApplication(AngularDialog, { providers: [provideZonelessChangeDetection()] });
