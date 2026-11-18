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

/**
 * Placement is entirely the consumer's CSS — the primitive only positions nothing. Here the viewport
 * is anchored top-center and the stack grows downward (the stacking variables are styled with
 * flipped signs and `origin-top`). Swipe up to dismiss.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'toast-custom-position-example',
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
        <button class="demo-button demo-button-primary h-9 px-4" (click)="add()">Show toast (top)</button>

        <div rdxToastPortal>
            <div
                class="fixed top-4 left-1/2 z-50 w-[360px] max-w-[calc(100vw-2rem)] -translate-x-1/2 outline-none [--toast-gap:0.75rem]"
                rdxToastViewport
            >
                @for (toast of manager.toasts(); track toast.id) {
                    <div
                        class="group data-[state=open]:animate-toast-in-top data-[state=closed]:animate-toast-out-top absolute top-0 left-0 [z-index:calc(50-var(--toast-index))] w-full origin-top [transform:translateY(calc(var(--toast-index)*0.75rem))_scale(calc(1-var(--toast-index)*0.05))] [opacity:calc(1-var(--toast-index)*0.3)] [transition:var(--transition-demo-toast-stack)] data-[expanded]:[transform:translateY(calc(var(--toast-offset-y)+var(--toast-index)*var(--toast-gap)))] data-[expanded]:opacity-100 data-[front]:opacity-100"
                        [toast]="toast"
                        [swipeDirection]="['up']"
                        rdxToastRoot
                    >
                        <div
                            class="demo-surface relative flex [transform:translate3d(var(--toast-swipe-movement-x,0px),var(--toast-swipe-movement-y,0px),0)] items-start gap-3 p-4 pr-9 shadow-lg [transition:var(--transition-demo-toast-swipe)] group-data-[swiping]:[transition:none]"
                            rdxToastContent
                        >
                            <div class="min-w-0 flex-1">
                                <p class="demo-toast-title" rdxToastTitle>{{ toast.title }}</p>
                                <p class="text-muted-foreground mt-1 text-sm" rdxToastDescription>
                                    {{ toast.description }}
                                </p>
                            </div>
                            <button
                                class="demo-button demo-button-ghost absolute top-2 right-2 size-6 p-0"
                                aria-label="Dismiss"
                                rdxToastClose
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                }
            </div>
        </div>
    `
})
export class ToastCustomPositionExample {
    protected readonly manager = inject(RdxToastManager);

    private count = 0;

    add(): void {
        this.count++;
        this.manager.add({ title: `Top toast ${this.count}`, description: 'Anchored at the top center.' });
    }
}
