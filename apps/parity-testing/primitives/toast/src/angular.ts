import { Component, inject, output, provideZonelessChangeDetection, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
    RdxToastAction,
    RdxToastClose,
    RdxToastDescription,
    RdxToastManager,
    RdxToastPortal,
    RdxToastProvider,
    RdxToastRoot,
    RdxToastTitle,
    RdxToastViewport
} from '@radix-ng/primitives/toast';
import {
    controlNotification,
    controlsId,
    createRequests,
    installFixture,
    notification,
    providerTimeout,
    recordControl,
    requestOwners,
    resetTimeout,
    saveNotification
} from './contract';
import './styles.css';

installFixture();

@Component({
    selector: 'fixture-toast-close',
    hostDirectives: [{ directive: RdxToastClose, inputs: ['disabled'] }],
    template: `
        <span>Dismiss</span>
    `
})
class FixtureToastClose {}

@Component({
    selector: 'toast-fixture',
    imports: [
        FixtureToastClose,
        RdxToastAction,
        RdxToastClose,
        RdxToastDescription,
        RdxToastPortal,
        RdxToastRoot,
        RdxToastTitle,
        RdxToastViewport
    ],
    template: `
        <input data-testid="origin" aria-label="Focus origin" />
        <button (click)="addNotice()" type="button">Add notification</button>
        <button (click)="limitChange.emit(1)" type="button">Limit to one</button>
        <button (click)="limitChange.emit(3)" type="button">Limit to three</button>
        <button (click)="manager.add(timedToast)" type="button">Add timed notification</button>
        <button (click)="manager.update('timed', { title: 'Updated' })" type="button">Update copy</button>
        <button (click)="manager.update('timed', { timeout: newTimeout })" type="button">Reset timer</button>
        <button (click)="startSave(false)" type="button">Start save</button>
        <button (click)="startSave(true)" type="button">Start persistent save</button>
        <button (click)="finishSave()" type="button">Finish save</button>
        @for (owner of owners; track owner) {
            <button (click)="requests.start(owner)" type="button">Start {{ owner }} request</button>
            <button (click)="requests.resolve(owner)" type="button">Resolve {{ owner }} request</button>
            <button (click)="requests.reject(owner)" type="button">Reject {{ owner }} request</button>
        }
        @if (controls) {
            <button (click)="manager.add(controlToast)" type="button">Show controls</button>
            <button (click)="controlsDisabled.update(invert)" type="button">Toggle controls disabled</button>
            <button (click)="cancelClose.update(invert)" type="button">Toggle close cancellation</button>
        }

        <div rdxToastPortal>
            <div [attr.data-swipe-fixture]="swipe ? '' : undefined" rdxToastViewport data-testid="viewport">
                @for (toast of manager.toasts(); track toast.id) {
                    <div [toast]="toast" [attr.data-testid]="toast.id" rdxToastRoot data-toast>
                        <h2 rdxToastTitle data-title>{{ toast.title }}</h2>
                        <p rdxToastDescription>Notification details</p>
                        @if (swipe) {
                            <div data-base-ui-swipe-ignore><span data-testid="ignore">Ignore swipe</span></div>
                            <div data-swipe-ignore><span data-testid="legacy-ignore">Legacy ignore</span></div>
                            <button (click)="activate()" type="button">
                                <span data-testid="swipe-action">Action</span>
                            </button>
                        }
                        @if (toast.id === controlsId) {
                            <form (submit)="onSubmit($event)">
                                @if (controls === 'custom') {
                                    <!-- rdxToastAction supplies the keyboard activation being tested. -->
                                    <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events -->
                                    <div
                                        [disabled]="controlsDisabled()"
                                        (click)="recordControl('action')"
                                        rdxToastAction
                                        data-testid="action"
                                    >
                                        <span>Action</span>
                                    </div>
                                    <fixture-toast-close
                                        [disabled]="controlsDisabled()"
                                        (click)="onClose($event)"
                                        data-testid="close"
                                    />
                                } @else {
                                    <button
                                        [disabled]="controlsDisabled()"
                                        (click)="recordControl('action')"
                                        rdxToastAction
                                        data-testid="action"
                                    >
                                        <span>Action</span>
                                    </button>
                                    <button
                                        [disabled]="controlsDisabled()"
                                        (click)="onClose($event)"
                                        rdxToastClose
                                        data-testid="close"
                                    >
                                        <span>Dismiss</span>
                                    </button>
                                }
                                <button
                                    (click)="recordControl('action')"
                                    rdxToastAction
                                    type="submit"
                                    data-testid="submit-action"
                                >
                                    Submit action
                                </button>
                            </form>
                        } @else {
                            <button [attr.data-testid]="'dismiss-' + toast.id" rdxToastClose type="button">
                                Dismiss
                            </button>
                        }
                    </div>
                }
            </div>
        </div>
    `
})
class ToastFixture {
    readonly limitChange = output<number>();
    protected readonly manager = inject(RdxToastManager);
    protected readonly timedToast = notification('timed', 'Timed');
    protected readonly newTimeout = resetTimeout;
    protected readonly owners = new URLSearchParams(location.search).has('requests') ? requestOwners : [];
    protected readonly swipe = new URLSearchParams(location.search).has('swipe');
    protected readonly controls = new URLSearchParams(location.search).get('controls');
    protected readonly controlsId = controlsId;
    protected readonly controlToast = controlNotification();
    protected readonly recordControl = recordControl;
    protected readonly controlsDisabled = signal(false);
    protected readonly cancelClose = signal(false);
    protected readonly invert = (value: boolean) => !value;
    protected readonly requests = createRequests((request, options) => this.manager.promise(request, options));

    private count = 0;
    private resolveSave?: () => void;

    protected addNotice(): void {
        const count = ++this.count;
        this.manager.add(notification(`notice-${count}`, `Notification ${count}`, 0));
    }

    protected startSave(persistent: boolean): void {
        const save = new Promise<void>((resolve) => (this.resolveSave = resolve));
        void this.manager.promise(save, saveNotification(persistent));
    }

    protected finishSave(): void {
        this.resolveSave?.();
        this.resolveSave = undefined;
    }

    protected activate(): void {
        window.toastParity.activations++;
    }

    protected onClose(event: MouseEvent): void {
        recordControl('close');
        if (this.cancelClose()) event.preventDefault();
    }

    protected onSubmit(event: SubmitEvent): void {
        event.preventDefault();
        recordControl('submit');
    }
}

@Component({
    selector: 'parity-toast',
    imports: [RdxToastProvider, ToastFixture],
    template: `
        <div [limit]="limit()" [timeout]="timeout" rdxToastProvider data-testid="fixture">
            <toast-fixture (limitChange)="limit.set($event)" />
        </div>
    `
})
class App {
    protected readonly limit = signal(3);
    protected readonly timeout = providerTimeout;
}

void bootstrapApplication(App, { providers: [provideZonelessChangeDetection()] });
