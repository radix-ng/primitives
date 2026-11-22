# Popover — Controlled mode with multiple triggers

> One example from the [Popover](../components/popover.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Bind both `[(open)]` and `[(triggerId)]` when application state should choose the active anchor.
`onOpenChange` reports the trigger element, trigger id, source event, and change reason.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import {
    RdxPopoverArrow,
    RdxPopoverClose,
    RdxPopoverDescription,
    RdxPopoverOpenChange,
    RdxPopoverPopup,
    RdxPopoverPortal,
    RdxPopoverPositioner,
    RdxPopoverRoot,
    RdxPopoverTitle,
    RdxPopoverTrigger
} from '@radix-ng/primitives/popover';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-popover-controlled-multiple',
    imports: [
        RdxPopoverRoot,
        RdxPopoverTrigger,
        RdxPopoverPortal,
        RdxPopoverPositioner,
        RdxPopoverPopup,
        RdxPopoverArrow,
        RdxPopoverTitle,
        RdxPopoverDescription,
        RdxPopoverClose,
        LucideX
    ],
    template: `
        <div class="flex flex-col items-center gap-4">
            <ng-container
                [(open)]="open"
                [(triggerId)]="triggerId"
                (onOpenChange)="handleOpenChange($event)"
                rdxPopoverRoot
            >
                <div class="flex flex-wrap justify-center gap-2">
                    @for (item of items; track item.id) {
                        <button
                            class="demo-button demo-button-outline h-8 px-3 text-xs"
                            [id]="item.id"
                            [payload]="item"
                            rdxPopoverTrigger
                        >
                            {{ item.label }}
                        </button>
                    }

                    <button class="demo-button demo-button-secondary h-8 px-3 text-xs" (click)="openProgrammatically()">
                        Open programmatically
                    </button>
                </div>

                <div class="z-50" *rdxPopoverPortal sideOffset="8" rdxPopoverPositioner>
                    <div class="demo-surface relative w-80 p-4" rdxPopoverPopup>
                        <span class="text-card demo-arrow my-px" rdxPopoverArrow></span>
                        <h2 class="demo-popover-title" rdxPopoverTitle>{{ activeItem()?.label }}</h2>
                        <p class="text-muted-foreground mt-1 text-sm" rdxPopoverDescription>
                            The externally controlled trigger id is {{ triggerId() }}.
                        </p>
                        <button
                            class="demo-button demo-button-ghost absolute top-2 right-2 size-7 p-0"
                            aria-label="Close"
                            rdxPopoverClose
                        >
                            <svg aria-hidden="true" lucideX size="14" />
                        </button>
                    </div>
                </div>
            </ng-container>

            <p class="text-muted-foreground text-center text-xs">
                State: {{ open() ? 'open' : 'closed' }} · Trigger: {{ triggerId() ?? 'none' }} · Reason:
                {{ lastReason() }}
            </p>
        </div>
    `
})
export class RdxPopoverControlledMultipleComponent {
    protected readonly open = signal(false);
    protected readonly triggerId = signal<string | null>(null);
    protected readonly lastReason = signal('none');
    protected readonly items = [
        { id: 'notifications', label: 'Notifications' },
        { id: 'activity', label: 'Activity' },
        { id: 'profile', label: 'Profile' }
    ];

    protected activeItem() {
        return this.items.find((item) => item.id === this.triggerId());
    }

    protected openProgrammatically() {
        this.triggerId.set('activity');
        this.open.set(true);
    }

    protected handleOpenChange(change: RdxPopoverOpenChange) {
        this.lastReason.set(change.reason);
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
