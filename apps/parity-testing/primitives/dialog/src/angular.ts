import { Component, ElementRef, provideZonelessChangeDetection, signal, viewChild } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { dialogImports, RdxDialogOpenChange, RdxDialogRoot } from '@radix-ng/primitives/dialog';
import type { RdxInitialFocus, RdxInteractionType, RdxReturnFocus } from '@radix-ng/primitives/floating-focus-manager';
import '../../../../radix-storybook/.storybook/tailwind.css';
import { chooseFocus, classes, config, installProbe, type NestedLayer } from './contract';
import { AngularDetachedDialog } from './detached.angular';
import './fixture.css';

@Component({
    selector: 'parity-dialog',
    imports: [dialogImports],
    host: { '(document:keydown)': 'command($event)' },
    template: `
        <main [class]="settings.touch === 'page-pan' ? 'flex min-h-[1200px] items-start gap-2' : 'flex gap-2'">
            <button
                [class]="styles.trigger"
                (click)="trace.probe.activations = trace.probe.activations + 1"
                data-testid="outside"
            >
                Outside
            </button>
            @if (settings.focus) {
                <input #focusReturn [class]="styles.input" data-testid="final-target" aria-label="Return target" />
            }
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
                @if (showPrimary()) {
                    <button id="primary" [class]="styles.trigger" rdxDialogTrigger data-testid="primary">
                        Primary
                    </button>
                }
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
                        [initialFocus]="initialFocus(close)"
                        [finalFocus]="finalFocus()"
                        [attr.data-motion]="settings.animate ? '' : null"
                        rdxDialogPopup
                        data-testid="popup"
                    >
                        <h2 rdxDialogTitle>Example dialog</h2>
                        <p rdxDialogDescription>Test a draft edit.</p>
                        <input [class]="styles.input" value="draft" data-testid="field" aria-label="Draft" />
                        @if (settings.touch === 'popup-pan') {
                            <div class="h-32 touch-pan-y overflow-y-auto" data-testid="popup-scroll">
                                <div class="h-96">Scrollable dialog content</div>
                            </div>
                        }
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
                        <button #close [class]="styles.trigger" rdxDialogClose data-testid="close">Close</button>
                    </div>
                </ng-template>
            </div>
            @if (settings.modal !== undefined) {
                <input [class]="styles.input" data-testid="outside-field" aria-label="Outside field" />
                <div
                    class="size-16"
                    [class.touch-none]="settings.touch === 'multitouch'"
                    data-testid="outside-surface"
                ></div>
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
    protected readonly showPrimary = signal(true);
    private readonly root = viewChild.required(RdxDialogRoot);
    private readonly focusClose = viewChild<ElementRef<HTMLButtonElement>>('close');
    private readonly focusReturn = viewChild<ElementRef<HTMLInputElement>>('focusReturn');
    private requested: boolean | undefined;
    private cancelNextOpen = !!this.settings.cancelOpen;
    private holdNextClose = !!this.settings.hold;

    private readonly initialPolicy = (interaction: RdxInteractionType) =>
        chooseFocus(
            this.trace.probe,
            this.settings.focus,
            'initial',
            interaction,
            this.focusClose()?.nativeElement ?? null
        );
    private readonly finalPolicy = (interaction: RdxInteractionType) =>
        chooseFocus(
            this.trace.probe,
            this.settings.focus,
            'final',
            interaction,
            this.focusReturn()?.nativeElement ?? null
        );

    protected initialFocus(close: HTMLElement): RdxInitialFocus {
        switch (this.settings.focus) {
            case 'elements':
                return close;
            case 'disabled':
                return false;
            case undefined:
                return undefined;
            default:
                return this.initialPolicy;
        }
    }

    protected finalFocus(): RdxReturnFocus {
        switch (this.settings.focus) {
            case 'elements':
                return this.focusReturn()?.nativeElement;
            case 'disabled':
                return false;
            case undefined:
                return undefined;
            default:
                return this.finalPolicy;
        }
    }

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
        if (!['F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F9', 'F10'].includes(event.key)) return;
        event.preventDefault();
        if (event.key === 'F2' && this.requested !== undefined) this.open.set(this.requested);
        if (event.key === 'F3') this.defaultOpen.update((open) => !open);
        if (event.key === 'F4') this.triggerId.set(null);
        if (event.key === 'F5') this.secondary.update((present) => !present);
        if (event.key === 'F6') this.showNested.update((present) => !present);
        if (event.key === 'F7') this.showPrimary.update((present) => !present);
        if (event.key === 'F10') this.root().close('imperative-action');
        if (event.key === 'F9' || event.key === 'F10') this.root().unmount();
    }
}

void bootstrapApplication(config().detached ? AngularDetachedDialog : AngularDialog, {
    providers: [provideZonelessChangeDetection()]
});
