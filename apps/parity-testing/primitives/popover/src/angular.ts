import '@angular/compiler';
import { Component, provideZonelessChangeDetection, signal, viewChild } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { popoverImports, RdxPopoverOpenChange, RdxPopoverRoot } from '@radix-ng/primitives/popover';
import '../../../../radix-storybook/.storybook/tailwind.css';
import { exitClass, heldExitClass } from '../../../shared/lifecycle';
import { classes, config, installProbe } from './contract';

const settings = config();
@Component({
    selector: 'parity-popover',
    imports: [popoverImports],
    host: { '(document:keydown)': 'command($event)' },
    template: `
        <div [class]="settings.scrolling ? s.shell : 'contents'" data-testid="scroller">
            <div
                [class]="
                    (settings.scrolling ? 'm-16 ' : 'fixed start-24 top-24 ') +
                    s.form +
                    (wide() ? ' w-80!' : '') +
                    (moved() ? ' translate-x-8 translate-y-4' : '')
                "
                data-testid="layout"
            >
                <button
                    [class]="s.trigger"
                    (click)="trace.probe.activations = trace.probe.activations + 1"
                    data-testid="outside"
                    type="button"
                >
                    Outside
                </button>
                <ng-container
                    [modal]="settings.modal"
                    (onOpenChange)="change($event)"
                    (onOpenChangeComplete)="trace.complete($event)"
                    rdxPopoverRoot
                >
                    <button
                        id="primary-trigger"
                        [class]="s.trigger"
                        [disabled]="settings.disabled"
                        data-testid="primary"
                        rdxPopoverTrigger
                    >
                        Open details
                    </button>
                    @if (settings.name === 'switch-trigger') {
                        <button id="secondary-trigger" [class]="s.trigger" data-testid="secondary" rdxPopoverTrigger>
                            Other details
                        </button>
                    }
                    <ng-template [keepMounted]="settings.lifecycle?.keepMounted ?? false" rdxPopoverPortal>
                        @if (settings.modal === true) {
                            <div class="fixed inset-0 z-40" rdxPopoverBackdrop></div>
                        }
                        <div
                            class="z-50"
                            [disableAnchorTracking]="settings.frozen"
                            [collisionPadding]="5"
                            sideOffset="5"
                            align="start"
                            data-testid="positioner"
                            rdxPopoverPositioner
                        >
                            <div
                                [class]="s.popup + (settings.lifecycle?.animated ? exitClass : '')"
                                [initialFocus]="settings.initialFocus ? note : undefined"
                                data-testid="popup"
                                rdxPopoverPopup
                            >
                                <h2 rdxPopoverTitle>Details</h2>
                                <p rdxPopoverDescription>Edit the note, then close.</p>
                                <label for="note">Note</label>
                                <input id="note" #note [class]="s.input" data-testid="field" value="draft" />
                                <button [class]="s.trigger" data-testid="close" rdxPopoverClose>Close</button>
                            </div>
                        </div>
                    </ng-template>
                </ng-container>
                <button [class]="s.trigger" data-testid="after" type="button">After</button>
            </div>
            @if (settings.scrolling) {
                <div class="h-[700px]" aria-hidden="true"></div>
            }
        </div>
    `
})
class AngularPopover {
    readonly settings = settings;
    readonly s = classes;
    readonly trace = installProbe('angular');
    readonly root = viewChild.required(RdxPopoverRoot);
    readonly exitClass = settings.lifecycle?.late ? heldExitClass : exitClass;
    private closes = 0;
    private lateHold?: () => void;
    readonly wide = signal(false);
    readonly moved = signal(false);
    command(event: KeyboardEvent) {
        if (['F8', 'F9', 'F10'].includes(event.key)) {
            event.preventDefault();
            if (event.key === 'F8') this.root().close();
            if (event.key === 'F9') this.root().unmount();
            if (event.key === 'F10') this.lateHold?.();
        }
        if (event.key === 'F2') {
            event.preventDefault();
            this.wide.update((v) => !v);
        }
        if (event.key === 'F6') {
            event.preventDefault();
            this.moved.update((v) => !v);
        }
    }
    change(change: RdxPopoverOpenChange) {
        if (!change.open && ++this.closes === 1) {
            const lifecycle = settings.lifecycle;
            this.lateHold = change.eventDetails.preventUnmountOnClose;
            if (lifecycle?.deferred || lifecycle?.canceled) change.eventDetails.preventUnmountOnClose();
            if (lifecycle?.canceled) change.eventDetails.cancel();
        }
        if ((change.open && settings.name === 'cancel-open') || (!change.open && settings.name === 'cancel-close'))
            change.eventDetails.cancel();
        this.trace.change(change.open, change.reason, change.eventDetails.isCanceled(), change.event, change.trigger);
    }
}
void bootstrapApplication(AngularPopover, { providers: [provideZonelessChangeDetection()] });
