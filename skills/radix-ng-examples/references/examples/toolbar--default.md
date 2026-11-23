# Toolbar — Default

> One example from the [Toolbar](../components/toolbar.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

The preview above uses this standalone component. Copy the setup and shared files below as well.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    LucideBold,
    LucideItalic,
    LucideTextAlignCenter,
    LucideTextAlignEnd,
    LucideTextAlignStart,
    LucideUnderline
} from '@lucide/angular';
import { RdxToggle } from '@radix-ng/primitives/toggle';
import { RdxToggleGroupWithoutFocus } from '@radix-ng/primitives/toggle-group';
import { RdxToolbarButton, RdxToolbarLink, RdxToolbarRoot, RdxToolbarSeparator } from '@radix-ng/primitives/toolbar';

@Component({
    host: { class: 'contents' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'rdx-toolbar-default-example',
    imports: [
        LucideBold,
        LucideItalic,
        LucideTextAlignCenter,
        LucideTextAlignEnd,
        LucideTextAlignStart,
        LucideUnderline,
        RdxToggle,
        RdxToggleGroupWithoutFocus,
        RdxToolbarButton,
        RdxToolbarLink,
        RdxToolbarRoot,
        RdxToolbarSeparator
    ],
    template: `
        <div class="demo-toolbar-root flex w-fit items-center gap-1 p-1" rdxToolbarRoot aria-label="Formatting options">
            <div class="flex gap-1" rdxToggleGroupWithoutFocus multiple aria-label="Text formatting">
                <button
                    class="demo-toolbar-toggle data-[pressed]:bg-primary data-[pressed]:text-primary-foreground focus-visible:ring-ring inline-flex h-8 w-8 items-center justify-center focus-visible:ring-2"
                    rdxToggle
                    value="bold"
                    aria-label="Bold"
                >
                    <svg lucideBold size="16"></svg>
                </button>
                <button
                    class="demo-toolbar-toggle data-[pressed]:bg-primary data-[pressed]:text-primary-foreground focus-visible:ring-ring inline-flex h-8 w-8 items-center justify-center focus-visible:ring-2"
                    rdxToggle
                    value="italic"
                    aria-label="Italic"
                >
                    <svg lucideItalic size="16"></svg>
                </button>
                <button
                    class="demo-toolbar-toggle data-[pressed]:bg-primary data-[pressed]:text-primary-foreground focus-visible:ring-ring inline-flex h-8 w-8 items-center justify-center focus-visible:ring-2"
                    rdxToggle
                    value="underline"
                    aria-label="Underline"
                >
                    <svg lucideUnderline size="16"></svg>
                </button>
            </div>

            <div class="bg-border mx-1 h-5 w-px" rdxToolbarSeparator orientation="vertical"></div>

            <div class="flex gap-1" [value]="alignment" rdxToggleGroupWithoutFocus aria-label="Text alignment">
                <button
                    class="demo-toolbar-toggle data-[pressed]:bg-primary data-[pressed]:text-primary-foreground focus-visible:ring-ring inline-flex h-8 w-8 items-center justify-center focus-visible:ring-2"
                    rdxToggle
                    value="left"
                    aria-label="Align left"
                >
                    <svg lucideTextAlignStart size="16"></svg>
                </button>
                <button
                    class="demo-toolbar-toggle data-[pressed]:bg-primary data-[pressed]:text-primary-foreground focus-visible:ring-ring inline-flex h-8 w-8 items-center justify-center focus-visible:ring-2"
                    rdxToggle
                    value="center"
                    aria-label="Align center"
                >
                    <svg lucideTextAlignCenter size="16"></svg>
                </button>
                <button
                    class="demo-toolbar-toggle data-[pressed]:bg-primary data-[pressed]:text-primary-foreground focus-visible:ring-ring inline-flex h-8 w-8 items-center justify-center focus-visible:ring-2"
                    rdxToggle
                    value="right"
                    aria-label="Align right"
                >
                    <svg lucideTextAlignEnd size="16"></svg>
                </button>
            </div>

            <div class="bg-border mx-1 h-5 w-px" rdxToolbarSeparator orientation="vertical"></div>

            <a class="demo-toolbar-link focus-visible:ring-ring px-1 focus-visible:ring-2" href="#" rdxToolbarLink>
                Edited 2h ago
            </a>
            <button
                class="demo-toolbar-button focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 ml-2 inline-flex h-8 items-center justify-center px-2.5 focus-visible:ring-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                rdxToolbarButton
            >
                Share
            </button>
        </div>
    `
})
export class ToolbarDefaultStory {
    protected readonly alignment = ['left'];
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
