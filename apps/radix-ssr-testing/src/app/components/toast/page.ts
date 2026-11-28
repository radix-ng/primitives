import { Component, inject, signal } from '@angular/core';
import {
    provideRdxToastManager,
    RdxToastClose,
    RdxToastDescription,
    RdxToastManager,
    RdxToastPortal,
    RdxToastRoot,
    RdxToastTitle,
    RdxToastViewport
} from '@radix-ng/primitives/toast';

@Component({
    selector: 'app-toast',
    imports: [RdxToastClose, RdxToastDescription, RdxToastPortal, RdxToastRoot, RdxToastTitle, RdxToastViewport],
    providers: [provideRdxToastManager()],
    template: `
        <input aria-label="Notification focus origin" data-toast-node="origin" />
        <button (click)="addNotification('New notification')" type="button">Add notification</button>
        <output data-toast-events>{{ events().join(',') }}</output>
        <div rdxToastPortal data-toast-node="portal">
            <div rdxToastViewport data-toast-node="viewport">
                @for (toast of manager.toasts(); track toast.id) {
                    <div [toast]="toast" [attr.data-toast-entry]="toast.id" rdxToastRoot data-toast-node="root">
                        <h2 rdxToastTitle data-toast-node="title">{{ toast.title }}</h2>
                        <p rdxToastDescription data-toast-node="description">{{ toast.description }}</p>
                        <button rdxToastClose data-toast-node="close">Dismiss notification</button>
                    </div>
                }
            </div>
        </div>
    `
})
export default class ToastPage {
    protected readonly manager = inject(RdxToastManager);
    protected readonly events = signal<string[]>([]);

    constructor() {
        this.addNotification('Initial notification', 'initial');
    }

    protected addNotification(title: string, id?: string): void {
        this.manager.add({
            id,
            title,
            description: 'Project saved.',
            timeout: 0,
            onClose: () => this.events.update((events) => [...events, 'close']),
            onRemove: () => this.events.update((events) => [...events, 'remove'])
        });
    }
}
