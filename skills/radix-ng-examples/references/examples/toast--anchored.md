# Toast — Anchored

> One example from the [Toast](../components/toast.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Pin a toast to an element with `rdxToastPositioner` (powered by popper) instead of joining the stack.

```typescript
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
    provideRdxToastManager,
    RdxToastClose,
    RdxToastContent,
    RdxToastDescription,
    RdxToastManager,
    RdxToastPortal,
    RdxToastPositioner,
    RdxToastRoot,
    RdxToastTitle,
    RdxToastViewport
} from '@radix-ng/primitives/toast';

/**
 * An anchored toast is positioned against an element with `rdxToastPositioner` (powered by popper)
 * instead of joining the stack, with a `rdxToastArrow` pointing back at the anchor. Pass the anchor
 * through the toast's `positionerProps`.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'toast-anchored-example',
    imports: [
        RdxToastPortal,
        RdxToastViewport,
        RdxToastPositioner,
        RdxToastRoot,
        RdxToastContent,
        RdxToastTitle,
        RdxToastDescription,
        RdxToastClose
    ],
    providers: [provideRdxToastManager()],
    template: `
        <button class="demo-button demo-button-primary h-9 px-4" (click)="show($event)">Anchored toast</button>

        <div rdxToastPortal>
            <div
                class="fixed right-4 bottom-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] outline-none [--toast-gap:0.75rem]"
                rdxToastViewport
            >
                @for (toast of manager.toasts(); track toast.id) {
                    @if (toast.positionerProps; as positioner) {
                        <div [anchor]="positioner.anchor" [side]="positioner.side ?? 'top'" rdxToastPositioner>
                            <div
                                class="data-[state=open]:animate-popover-popup-in data-[state=closed]:animate-popover-popup-out w-72 origin-[var(--toast-transform-origin)]"
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
                        </div>
                    }
                }
            </div>
        </div>
    `
})
export class ToastAnchoredExample {
    protected readonly manager = inject(RdxToastManager);

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

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
