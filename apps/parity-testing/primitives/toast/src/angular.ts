import { Component, inject, output, provideZonelessChangeDetection, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
    RdxToastClose,
    RdxToastDescription,
    RdxToastManager,
    RdxToastPortal,
    RdxToastProvider,
    RdxToastRoot,
    RdxToastTitle,
    RdxToastViewport
} from '@radix-ng/primitives/toast';
import { installFixture, notification, providerTimeout, resetTimeout, saveNotification } from './contract';
import './styles.css';

installFixture();

@Component({
    selector: 'toast-fixture',
    imports: [RdxToastClose, RdxToastDescription, RdxToastPortal, RdxToastRoot, RdxToastTitle, RdxToastViewport],
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

        <div rdxToastPortal>
            <div rdxToastViewport data-testid="viewport">
                @for (toast of manager.toasts(); track toast.id) {
                    <div [toast]="toast" [attr.data-testid]="toast.id" rdxToastRoot data-toast>
                        <h2 rdxToastTitle data-title>{{ toast.title }}</h2>
                        <p rdxToastDescription>Notification details</p>
                        <button [attr.data-testid]="'dismiss-' + toast.id" rdxToastClose type="button">Dismiss</button>
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
