import { cn, demoButton, demoToast } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { provideRdxToastManager, RdxToastManager, toastImports } from '@radix-ng/primitives/toast';

/**
 * Toasts can be dismissed by swiping. `swipeDirection` lists the allowed directions; the gesture
 * follows whichever the pointer drags toward most and dismisses past a threshold (or on a flick).
 * The live offset is exposed as `--toast-swipe-movement-x/y` and applied to the content.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'toast-swipe-example',
    imports: [...toastImports],
    providers: [provideRdxToastManager()],
    template: `
        <button [class]="cn(b.base, b.primary, b.size.md)" (click)="add()">Show swipeable toast</button>

        <div rdxToastPortal>
            <div rdxToastViewport [class]="t.viewport">
                @for (toast of manager.toasts(); track toast.id) {
                    <div rdxToastRoot [class]="t.root" [toast]="toast" [swipeDirection]="['right', 'down']">
                        <div rdxToastContent [class]="t.content">
                            <div class="min-w-0 flex-1">
                                <p rdxToastTitle [class]="t.title">Swipe me away</p>
                                <p rdxToastDescription [class]="t.description">
                                    Drag right or down to dismiss. Release early to snap back.
                                </p>
                            </div>
                            <button aria-label="Dismiss" rdxToastClose [class]="t.close">✕</button>
                        </div>
                    </div>
                }
            </div>
        </div>
    `
})
export class ToastSwipeExample {
    protected readonly manager = inject(RdxToastManager);
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly t = demoToast;

    add(): void {
        this.manager.add({ title: 'Swipe me away', timeout: 0 });
    }
}
