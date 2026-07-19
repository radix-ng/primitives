# Toast — Swipe to dismiss

> One example from the [Toast](../components/toast.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

Drag a toast toward an allowed `swipeDirection` to dismiss it; release early to snap back.

```typescript
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { provideRdxToastManager, RdxToastManager, toastImports } from '@radix-ng/primitives/toast';
import { cn, demoButton, demoToast } from '../../storybook/styles';

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
            <div [class]="t.viewport" rdxToastViewport>
                @for (toast of manager.toasts(); track toast.id) {
                    <div [class]="t.root" [toast]="toast" [swipeDirection]="['right', 'down']" rdxToastRoot>
                        <div [class]="t.content" rdxToastContent>
                            <div class="min-w-0 flex-1">
                                <p [class]="t.title" rdxToastTitle>Swipe me away</p>
                                <p [class]="t.description" rdxToastDescription>
                                    Drag right or down to dismiss. Release early to snap back.
                                </p>
                            </div>
                            <button [class]="t.close" aria-label="Dismiss" rdxToastClose>✕</button>
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
```
