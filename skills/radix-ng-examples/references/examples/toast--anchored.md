# Toast — Anchored

> One example from the [Toast](../components/toast.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

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

## Setup and shared files

These examples use Angular standalone components and Tailwind CSS v4. Install
`@radix-ng/primitives` and `@lucide/angular`. Copy the component from **Show code** and any shared files below,
preserving their relative import paths. Import the example component in its parent and use its selector.

Install `tailwindcss`, `@tailwindcss/postcss` and `postcss`. Configure the PostCSS plugin:

```json
{ "plugins": { "@tailwindcss/postcss": {} } }
```

Save the CSS below as `demo-styles.css` next to your global stylesheet. Import Tailwind first,
then the demo styles. Both Storybook and Playground use this same CSS through `main.css`.

```css
@import 'tailwindcss';
@import './demo-styles.css';
```

The shared file supplies theme values, light/dark tokens, common classes and animation keyframes.
Set `data-theme="dark"` on `<html>` for the dark theme; the default is light. The font stacks have
system fallbacks; Inter and JetBrains Mono can be self-hosted for the Storybook typography.

<details>
<summary>demo-styles.css</summary>

[Download demo-styles.css](../demo-styles.css)

</details>
