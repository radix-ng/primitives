# Alert Dialog — Detached triggers

> One example from the [Alert Dialog](../components/alert-dialog.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

Connect a trigger rendered outside the root with `createRdxAlertDialogHandle()`; the handle also exposes
imperative `open(id)` / `close()`.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxAlertDialogBackdrop,
    RdxAlertDialogClose,
    RdxAlertDialogDescription,
    RdxAlertDialogPopup,
    RdxAlertDialogPortal,
    RdxAlertDialogRoot,
    RdxAlertDialogTitle,
    RdxAlertDialogTrigger,
    createRdxAlertDialogHandle
} from '@radix-ng/primitives/alert-dialog';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-alert-dialog-detached',
    imports: [
        RdxAlertDialogRoot,
        RdxAlertDialogTrigger,
        RdxAlertDialogPortal,
        RdxAlertDialogBackdrop,
        RdxAlertDialogPopup,
        RdxAlertDialogTitle,
        RdxAlertDialogDescription,
        RdxAlertDialogClose
    ],
    template: `
        <div class="flex flex-col items-center gap-3">
            <!-- Triggers live outside the root and are linked through a shared handle. -->
            <button
                class="demo-button demo-button-destructive h-9 px-4"
                id="delete"
                [handle]="handle"
                rdxAlertDialogTrigger
            >
                Delete file
            </button>

            <button class="demo-button demo-button-secondary h-8 px-3 text-xs" (click)="handle.open('delete')">
                Open imperatively
            </button>

            <div [handle]="handle" rdxAlertDialogRoot>
                <ng-template rdxAlertDialogPortal>
                    <div
                        class="bg-foreground/50 data-[open]:animate-dialog-overlay-in data-[closed]:animate-dialog-overlay-out fixed inset-0 z-50"
                        rdxAlertDialogBackdrop
                    ></div>
                    <div
                        class="demo-surface data-[open]:animate-dialog-popup-in data-[closed]:animate-dialog-popup-out fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 p-6 transition-[transform,scale] focus:outline-none data-[nested-dialog-open]:scale-[0.96]"
                        rdxAlertDialogPopup
                    >
                        <h2 class="demo-dialog-title" rdxAlertDialogTitle>Delete this file?</h2>
                        <p class="text-muted-foreground mt-1.5 text-sm" rdxAlertDialogDescription>
                            The trigger and this alert dialog are connected with
                            <code>createRdxAlertDialogHandle()</code>
                            .
                        </p>
                        <div class="mt-6 flex justify-end gap-2">
                            <button class="demo-button demo-button-outline h-8 px-3 text-xs" rdxAlertDialogClose>
                                Cancel
                            </button>
                            <button class="demo-button demo-button-destructive h-8 px-3 text-xs" rdxAlertDialogClose>
                                Delete
                            </button>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class RdxAlertDialogDetachedComponent {
    protected readonly handle = createRdxAlertDialogHandle();
}
```

## Setup and shared files

These examples use Angular standalone components and Tailwind CSS v4. Install
`@radix-ng/primitives`. Copy the component from **Show code** and any shared files below,
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
