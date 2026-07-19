# Toast — Anchored

> One example from the [Toast](../components/toast.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

Pin a toast to an element with `rdxToastPositioner` (powered by popper) instead of joining the stack.

```typescript
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { provideRdxToastManager, RdxToastManager, toastImports } from '@radix-ng/primitives/toast';
import { cn, demoButton, demoToast } from '../../storybook/styles';

/**
 * An anchored toast is positioned against an element with `rdxToastPositioner` (powered by popper)
 * instead of joining the stack, with a `rdxToastArrow` pointing back at the anchor. Pass the anchor
 * through the toast's `positionerProps`.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'toast-anchored-example',
    imports: [...toastImports],
    providers: [provideRdxToastManager()],
    template: `
        <button [class]="cn(b.base, b.primary, b.size.md)" (click)="show($event)">Anchored toast</button>

        <div rdxToastPortal>
            <div [class]="t.viewport" rdxToastViewport>
                @for (toast of manager.toasts(); track toast.id) {
                    @if (toast.positionerProps; as positioner) {
                        <div [anchor]="positioner.anchor" [side]="positioner.side ?? 'top'" rdxToastPositioner>
                            <div [class]="t.anchored" [toast]="toast" rdxToastRoot>
                                <div [class]="t.content" rdxToastContent>
                                    <div class="min-w-0 flex-1">
                                        <p [class]="t.title" rdxToastTitle>{{ toast.title }}</p>
                                        <p [class]="t.description" rdxToastDescription>{{ toast.description }}</p>
                                    </div>
                                    <button [class]="t.close" aria-label="Dismiss" rdxToastClose>✕</button>
                                </div>
                            </div>
                        </div>
                    }
                }
            </div>
        </div>
    `
})
export class ToastAnchoredExample {
    protected readonly manager = inject(RdxToastManager);
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly t = demoToast;

    show(event: MouseEvent): void {
        this.manager.add({
            id: 'anchored',
            title: 'Anchored toast',
            description: 'Pinned to the button, with an arrow.',
            timeout: 0,
            positionerProps: { anchor: event.currentTarget as HTMLElement, side: 'top' }
        });
    }
}
```
