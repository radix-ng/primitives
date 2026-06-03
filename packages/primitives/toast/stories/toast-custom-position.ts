import { cn, demoButton, demoToast } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { provideRdxToastManager, RdxToastManager, toastImports } from '@radix-ng/primitives/toast';

/**
 * Placement is entirely the consumer's CSS — the primitive only positions nothing. Here the viewport
 * is anchored top-center and the stack grows downward (the stacking variables are styled with
 * flipped signs and `origin-top`). Swipe up to dismiss.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'toast-custom-position-example',
    imports: [...toastImports],
    providers: [provideRdxToastManager()],
    template: `
        <button [class]="cn(b.base, b.primary, b.size.md)" (click)="add()">Show toast (top)</button>

        <div rdxToastPortal>
            <div rdxToastViewport [class]="t.viewportTop">
                @for (toast of manager.toasts(); track toast.id) {
                    <div rdxToastRoot [class]="t.rootTop" [toast]="toast" [swipeDirection]="['up']">
                        <div rdxToastContent [class]="t.content">
                            <div class="min-w-0 flex-1">
                                <p rdxToastTitle [class]="t.title">{{ toast.title }}</p>
                                <p rdxToastDescription [class]="t.description">{{ toast.description }}</p>
                            </div>
                            <button aria-label="Dismiss" rdxToastClose [class]="t.close">✕</button>
                        </div>
                    </div>
                }
            </div>
        </div>
    `
})
export class ToastCustomPositionExample {
    protected readonly manager = inject(RdxToastManager);
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly t = demoToast;

    private count = 0;

    add(): void {
        this.count++;
        this.manager.add({ title: `Top toast ${this.count}`, description: 'Anchored at the top center.' });
    }
}
