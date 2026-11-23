# Toast — Types

> One example from the [Toast](../components/toast.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Branch on a free-form `type` to render an icon, and raise `priority` to `high` for assertive errors.

```typescript
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LucideCircleCheck, LucideCircleX, LucideInfo } from '@lucide/angular';
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
 * `type` is a free-form category surfaced back on the toast object — branch on it in the template
 * (here via an icon) and style with `[data-type]` on the root. `priority: 'high'` switches the
 * announcement role to `alert` (assertive) for errors.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'toast-types-example',
    imports: [
        RdxToastPortal,
        RdxToastViewport,
        RdxToastRoot,
        RdxToastContent,
        RdxToastTitle,
        RdxToastDescription,
        RdxToastClose,
        LucideCircleCheck,
        LucideCircleX,
        LucideInfo
    ],
    providers: [provideRdxToastManager()],
    template: `
        <div class="flex gap-2">
            <button class="demo-button demo-button-outline h-9 px-4" (click)="success()">Success</button>
            <button class="demo-button demo-button-outline h-9 px-4" (click)="error()">Error</button>
            <button class="demo-button demo-button-outline h-9 px-4" (click)="info()">Info</button>
        </div>

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
                            class="demo-surface relative flex [transform:translate3d(var(--toast-swipe-movement-x,0px),var(--toast-swipe-movement-y,0px),0)] items-start gap-3 p-4 pr-9 shadow-lg [transition:var(--transition-demo-toast-swipe)] group-data-[swiping]:[transition:none]"
                            rdxToastContent
                        >
                            @switch (toast.type) {
                                @case ('success') {
                                    <svg class="text-foreground mt-0.5 size-5 shrink-0" lucideCircleCheck></svg>
                                }
                                @case ('error') {
                                    <svg class="text-destructive mt-0.5 size-5 shrink-0" lucideCircleX></svg>
                                }
                                @default {
                                    <svg class="text-muted-foreground mt-0.5 size-5 shrink-0" lucideInfo></svg>
                                }
                            }
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
export class ToastTypesExample {
    protected readonly manager = inject(RdxToastManager);

    success(): void {
        this.manager.add({ type: 'success', title: 'Saved', description: 'Your changes are live.' });
    }

    error(): void {
        this.manager.add({
            type: 'error',
            title: 'Something went wrong',
            description: 'Please try again.',
            priority: 'high'
        });
    }

    info(): void {
        this.manager.add({ type: 'info', title: 'Heads up', description: 'A new version is available.' });
    }
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
