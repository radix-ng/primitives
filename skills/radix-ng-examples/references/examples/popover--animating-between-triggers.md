# Popover — Animating between triggers

> One example from the [Popover](../components/popover.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Wrap one direct content element with `rdxPopoverViewport` to animate content changes when a popup
moves between triggers. The viewport exposes `data-activation-direction` and retains a
`data-previous` snapshot until its CSS transition or animation completes.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxPopoverDescription,
    RdxPopoverPopup,
    RdxPopoverPortal,
    RdxPopoverPositioner,
    RdxPopoverRoot,
    RdxPopoverTitle,
    RdxPopoverTrigger,
    RdxPopoverViewport
} from '@radix-ng/primitives/popover';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-popover-viewport',
    imports: [
        RdxPopoverRoot,
        RdxPopoverTrigger,
        RdxPopoverPortal,
        RdxPopoverPositioner,
        RdxPopoverPopup,
        RdxPopoverTitle,
        RdxPopoverDescription,
        RdxPopoverViewport
    ],
    template: `
        <ng-container #root="rdxPopoverRoot" rdxPopoverRoot>
            <div class="flex flex-wrap justify-center gap-2">
                @for (item of items; track item.id) {
                    <button
                        class="demo-button demo-button-outline h-8 px-3 text-xs"
                        [payload]="item"
                        [id]="item.id"
                        rdxPopoverTrigger
                    >
                        {{ item.label }}
                    </button>
                }
            </div>

            <div
                class="transition-[left,right,top,bottom] duration-200"
                *rdxPopoverPortal
                sideOffset="8"
                rdxPopoverPositioner
            >
                <div
                    class="demo-surface relative w-80 overflow-hidden p-4 transition-[width,height] duration-200"
                    rdxPopoverPopup
                >
                    <div class="relative" rdxPopoverViewport>
                        <div
                            class="data-[previous]:animate-popover-viewport-out data-[current]:animate-popover-viewport-in data-[previous]:absolute data-[previous]:inset-0"
                        >
                            <h2 class="demo-popover-title" rdxPopoverTitle>{{ payloadItem(root.payload())?.label }}</h2>
                            <p class="text-muted-foreground mt-1 text-sm" rdxPopoverDescription>
                                {{ payloadItem(root.payload())?.description }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </ng-container>
    `
})
export class RdxPopoverViewportComponent {
    protected readonly items = [
        { id: 'notifications', label: 'Notifications', description: 'You are all caught up.' },
        { id: 'activity', label: 'Activity', description: 'Nothing interesting happened recently.' },
        { id: 'profile', label: 'Profile', description: 'Manage your profile settings and account preferences.' }
    ];
    protected payloadItem(payload: unknown) {
        return this.items.find((item) => item === payload);
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
