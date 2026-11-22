# Dialog — Deferred requests

> One example from the [Dialog](../components/dialog.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Bind `[open]` and listen to `(openChange)` when the application decides when to accept requests.
Focus and modal behavior follow the bound value. `defaultOpen` applies only to uncontrolled state
and is read once when the Root initializes.

```typescript
import { Component, signal } from '@angular/core';
import {
    RdxDialogBackdrop,
    RdxDialogClose,
    RdxDialogPopup,
    RdxDialogPortal,
    RdxDialogRoot,
    RdxDialogTitle,
    RdxDialogTrigger
} from '@radix-ng/primitives/dialog';

@Component({
    selector: 'rdx-dialog-deferred-open',
    imports: [
        RdxDialogRoot,
        RdxDialogTrigger,
        RdxDialogPortal,
        RdxDialogBackdrop,
        RdxDialogPopup,
        RdxDialogTitle,
        RdxDialogClose
    ],
    template: `
        <div class="flex items-center gap-3">
            <button
                class="demo-button demo-button-outline h-8 px-3 text-xs"
                [disabled]="requestedOpen() !== true"
                (click)="applyRequest()"
            >
                Apply open request
            </button>

            <div [open]="open()" (openChange)="requestedOpen.set($event)" rdxDialogRoot defaultOpen>
                <button class="demo-button demo-button-primary h-9 px-4" rdxDialogTrigger>Open dialog</button>
                <ng-template rdxDialogPortal>
                    <div class="bg-foreground/50 fixed inset-0 z-50" rdxDialogBackdrop></div>
                    <div
                        class="demo-surface fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 p-6 transition-[transform,scale] focus:outline-none data-[nested-dialog-open]:scale-[0.96]"
                        rdxDialogPopup
                    >
                        <h2 class="demo-dialog-title" rdxDialogTitle>Review the request</h2>
                        <div class="mt-6 flex justify-end gap-2">
                            <button class="demo-button demo-button-primary h-8 px-3 text-xs" rdxDialogClose>
                                Request close
                            </button>
                            <button
                                class="demo-button demo-button-outline h-8 px-3 text-xs"
                                [disabled]="requestedOpen() !== false"
                                (click)="applyRequest()"
                            >
                                Apply close request
                            </button>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class RdxDialogDeferredOpenComponent {
    protected readonly open = signal(false);
    protected readonly requestedOpen = signal<boolean | null>(null);

    protected applyRequest(): void {
        const requested = this.requestedOpen();
        if (requested !== null) {
            this.open.set(requested);
            this.requestedOpen.set(null);
        }
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
