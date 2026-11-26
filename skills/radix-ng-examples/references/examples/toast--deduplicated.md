# Toast — Deduplicated

> One example from the [Toast](../components/toast.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

Pass a fixed `id` to upsert a single toast in place instead of stacking duplicates.

```typescript
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
 * Passing a fixed `id` upserts instead of stacking — repeated calls update the same toast in place
 * rather than piling up duplicates. Bumping `updateKey` replays the enter animation, so a rapid
 * second click visibly pulses the existing toast; its auto-dismiss timer restarts each time.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'toast-deduplicated-example',
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
        <button class="demo-button demo-button-primary h-9 px-4" (click)="copy()">Copy link</button>

        <div rdxToastPortal>
            <div
                class="fixed right-4 bottom-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] outline-none [--toast-gap:0.75rem]"
                rdxToastViewport
            >
                @for (toast of manager.toasts(); track toast.id) {
                    <div
                        class="group data-[state=open]:animate-toast-in data-[state=closed]:animate-toast-out absolute right-0 bottom-0 [z-index:calc(50-var(--toast-index))] w-full origin-bottom [transform:translateY(calc(var(--toast-index)*-0.75rem))_scale(calc(1-var(--toast-index)*0.05))] [opacity:calc(1-var(--toast-index)*0.3)] [transition:var(--transition-demo-toast-stack)] data-[expanded]:[transform:translateY(calc((var(--toast-offset-y)+var(--toast-index)*var(--toast-gap))*-1))] data-[expanded]:opacity-100 data-[front]:opacity-100"
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
export class ToastDeduplicatedExample {
    protected readonly manager = inject(RdxToastManager);

    private times = 0;

    copy(): void {
        this.times++;
        this.manager.add({
            id: 'clipboard',
            title: 'Link copied',
            description: this.times === 1 ? 'Copied to clipboard.' : `Copied ${this.times} times.`,
            updateKey: this.times
        });
    }
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
