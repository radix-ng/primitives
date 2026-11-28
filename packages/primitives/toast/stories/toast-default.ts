import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
    provideRdxToastManager,
    RdxToastClose,
    RdxToastContent,
    RdxToastDescription,
    RdxToastManager,
    RdxToastPortal,
    RdxToastRoot,
    RdxToastTitle,
    RdxToastViewport
} from '@radix-ng/primitives/toast';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'toast-default-example',
    imports: [
        RdxToastPortal,
        RdxToastViewport,
        RdxToastRoot,
        RdxToastContent,
        RdxToastTitle,
        RdxToastDescription,
        RdxToastClose
    ],
    providers: [provideRdxToastManager()],
    template: `
        <button class="demo-button demo-button-outline h-8 px-3" (click)="notify()">Show toast</button>

        <div rdxToastPortal>
            <div
                class="fixed right-4 bottom-4 z-50 w-[calc(100vw-2rem)] max-w-90 outline-none [--toast-gap:0.75rem] sm:right-8 sm:bottom-8"
                rdxToastViewport
            >
                @for (toast of manager.toasts(); track toast.id) {
                    <div
                        class="demo-popup group motion-safe:ease-demo-toast absolute right-0 bottom-0 z-[calc(50-var(--toast-index))] w-full origin-bottom [transform:translate(var(--toast-x),calc(var(--toast-position)+var(--toast-y)))_scale(var(--toast-scale))] [--toast-position:calc(var(--toast-index)*-0.75rem)] [--toast-scale:calc(max(0,1-var(--toast-index)*0.1))] [--toast-x:var(--toast-swipe-movement-x,0px)] [--toast-y:var(--toast-swipe-movement-y,0px)] after:absolute after:top-full after:left-0 after:h-[calc(var(--toast-gap)+1px)] after:w-full data-ending-style:opacity-0 data-ending-style:not-data-swipe-dismiss:[--toast-y:150%] data-expanded:[--toast-position:calc((var(--toast-offset-y)+var(--toast-index)*var(--toast-gap))*-1)] data-expanded:[--toast-scale:1] data-limited:hidden data-swiping:transition-none data-ending-style:data-swipe-dismiss:data-[swipe-direction=down]:[--toast-y:calc(var(--toast-swipe-movement-y,0px)+150%)] data-ending-style:data-swipe-dismiss:data-[swipe-direction=right]:[--toast-x:calc(var(--toast-swipe-movement-x,0px)+150%)] motion-safe:transition-[transform,opacity] motion-safe:duration-500 motion-safe:data-starting-style:opacity-0 motion-safe:data-starting-style:[--toast-y:150%]"
                        [toast]="toast"
                        rdxToastRoot
                    >
                        <div
                            class="motion-safe:ease-demo-toast flex items-center gap-4 overflow-hidden p-3 data-behind:not-data-expanded:opacity-0 motion-safe:transition-opacity motion-safe:duration-250"
                            rdxToastContent
                        >
                            <div class="flex min-w-0 flex-1 flex-col gap-1">
                                <p class="text-sm font-bold" rdxToastTitle>{{ toast.title }}</p>
                                @if (toast.description) {
                                    <p class="text-sm" rdxToastDescription>
                                        {{ toast.description }}
                                    </p>
                                }
                            </div>
                            <button
                                class="demo-button demo-button-outline h-8 shrink-0 px-3"
                                aria-label="Dismiss"
                                rdxToastClose
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                }
            </div>
        </div>
    `
})
export class ToastDefaultExample {
    protected readonly manager = inject(RdxToastManager);

    private count = 0;

    notify(): void {
        this.count++;
        this.manager.add({
            title: `Notification ${this.count}`,
            description: 'Your changes have been saved.'
        });
    }
}
