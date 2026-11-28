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
 * Each toast's height is measured and shared as `--toast-offset-y`, so the expanded layout lines up
 * even when toasts differ in height. Add a few (the descriptions vary in length), then hover to
 * expand and watch them stack without overlap.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'toast-varying-heights-example',
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
        <div class="flex gap-2">
            <button class="demo-button demo-button-primary h-9 px-4" (click)="add()">Add toast</button>
            <button class="demo-button demo-button-outline h-9 px-4" (click)="manager.close()">Clear all</button>
        </div>

        <div rdxToastPortal>
            <div
                class="fixed right-4 bottom-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] outline-none [--toast-gap:0.75rem]"
                rdxToastViewport
            >
                @for (toast of manager.toasts(); track toast.id) {
                    <div
                        class="group motion-safe:animate-toast-in motion-safe:data-ending-style:animate-toast-out absolute right-0 bottom-0 [z-index:calc(50-var(--toast-index))] w-full origin-bottom [transform:translateY(calc(var(--toast-index)*-0.75rem))_scale(calc(1-var(--toast-index)*0.05))] [opacity:calc(1-var(--toast-index)*0.3)] [transition:var(--transition-demo-toast-stack)] data-limited:hidden data-[expanded]:[transform:translateY(calc((var(--toast-offset-y)+var(--toast-index)*var(--toast-gap))*-1))] data-[expanded]:opacity-100"
                        [toast]="toast"
                        rdxToastRoot
                    >
                        <div
                            class="demo-popup relative flex [transform:translate3d(var(--toast-swipe-movement-x,0px),var(--toast-swipe-movement-y,0px),0)] items-start gap-3 p-4 pr-9 [transition:var(--transition-demo-toast-swipe)] group-data-[swiping]:[transition:none]"
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
export class ToastVaryingHeightsExample {
    protected readonly manager = inject(RdxToastManager);

    private readonly bodies = [
        'Short and sweet.',
        'A medium-length message that wraps onto a second line to add some height.',
        'A longer notification that spans several lines so the stacking offsets clearly have to account for differing toast heights when the stack is expanded.'
    ];

    private next = 0;

    add(): void {
        const description = this.bodies[this.next % this.bodies.length];
        this.next++;
        this.manager.add({ title: `Toast ${this.next}`, description, timeout: 0 });
    }
}
