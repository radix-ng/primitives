# Dialog — Manual close and retained content

> One example from the [Dialog](../components/dialog.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

Call `eventDetails.preventUnmountOnClose()` in `onOpenChange` to hold the closing view while an
external animation runs. Call `root.unmount()` from the exported Root when that animation ends.
`onOpenChangeComplete(false)` fires once. Bind `[keepMounted]` on Portal to keep the child views
and their state. The Popup, Backdrop and Viewport are hidden once closing completes.

```typescript
import { Component, signal } from '@angular/core';
import {
    RdxDialogBackdrop,
    RdxDialogClose,
    RdxDialogOpenChange,
    RdxDialogPopup,
    RdxDialogPortal,
    RdxDialogRoot,
    RdxDialogTitle,
    RdxDialogTrigger
} from '@radix-ng/primitives/dialog';

@Component({
    selector: 'rdx-dialog-manual-close',
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
        <div
            class="flex flex-col items-start gap-3"
            #root="rdxDialogRoot"
            (onOpenChange)="prepareClose($event)"
            (onOpenChangeComplete)="!$event && closing.set(false)"
            rdxDialogRoot
        >
            <label class="text-foreground flex items-center gap-2 text-sm">
                <input #retain [checked]="keepMounted()" (change)="keepMounted.set(retain.checked)" type="checkbox" />
                Keep draft mounted
            </label>
            <button class="demo-button demo-button-primary h-9 px-4" rdxDialogTrigger>Open editor</button>
            <ng-template [keepMounted]="keepMounted()" rdxDialogPortal>
                <div class="bg-foreground/50 fixed inset-0 z-50" rdxDialogBackdrop></div>
                <div
                    class="demo-surface fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 p-6 transition-[transform,scale] focus:outline-none data-[nested-dialog-open]:scale-[0.96]"
                    rdxDialogPopup
                >
                    <h2 class="demo-dialog-title" rdxDialogTitle>Edit draft</h2>
                    <label class="text-foreground flex flex-col gap-1 text-sm">
                        Draft
                        <input class="border-border rounded-md border px-3 py-2" />
                    </label>
                    <div class="mt-6 flex justify-end gap-2">
                        @if (closing()) {
                            <button class="demo-button demo-button-outline h-9 px-4" (click)="root.unmount()">
                                Finish close
                            </button>
                        } @else {
                            <button class="demo-button demo-button-outline h-9 px-4" rdxDialogClose>
                                Close editor
                            </button>
                        }
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDialogManualCloseComponent {
    protected readonly keepMounted = signal(false);
    protected readonly closing = signal(false);

    protected prepareClose(change: RdxDialogOpenChange): void {
        this.closing.set(!change.open);
        if (!change.open) change.eventDetails.preventUnmountOnClose();
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
