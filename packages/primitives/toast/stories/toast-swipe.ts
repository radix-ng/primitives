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
 * Toasts can be dismissed by swiping. `swipeDirection` lists the allowed directions; the gesture
 * follows whichever the pointer drags toward most and dismisses past a threshold (or on a flick).
 * The live offset is exposed as `--toast-swipe-movement-x/y` and applied to the content.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'toast-swipe-example',
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
        <button class="demo-button demo-button-primary h-9 px-4" (click)="add()">Show swipeable toast</button>

        <div rdxToastPortal>
            <div
                class="fixed right-4 bottom-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] outline-none [--toast-gap:0.75rem]"
                rdxToastViewport
            >
                @for (toast of manager.toasts(); track toast.id) {
                    <div
                        class="group data-[state=open]:animate-toast-in data-[state=closed]:animate-toast-out absolute right-0 bottom-0 [z-index:calc(50-var(--toast-index))] w-full origin-bottom [transform:translateY(calc(var(--toast-index)*-0.75rem))_scale(calc(1-var(--toast-index)*0.05))] [opacity:calc(1-var(--toast-index)*0.3)] [transition:var(--transition-demo-toast-stack)] data-[expanded]:[transform:translateY(calc((var(--toast-offset-y)+var(--toast-index)*var(--toast-gap))*-1))] data-[expanded]:opacity-100 data-[front]:opacity-100"
                        [toast]="toast"
                        [swipeDirection]="['right', 'down']"
                        rdxToastRoot
                    >
                        <div
                            class="demo-surface relative flex [transform:translate3d(var(--toast-swipe-movement-x,0px),var(--toast-swipe-movement-y,0px),0)] items-start gap-3 p-4 pr-9 shadow-lg [transition:var(--transition-demo-toast-swipe)] group-data-[swiping]:[transition:none]"
                            rdxToastContent
                        >
                            <div class="min-w-0 flex-1">
                                <p class="demo-toast-title" rdxToastTitle>Swipe me away</p>
                                <p class="text-muted-foreground mt-1 text-sm" rdxToastDescription>
                                    Drag right or down to dismiss. Release early to snap back.
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
export class ToastSwipeExample {
    protected readonly manager = inject(RdxToastManager);

    add(): void {
        this.manager.add({ title: 'Swipe me away', timeout: 0 });
    }
}
