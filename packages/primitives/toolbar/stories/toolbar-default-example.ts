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
import { RdxToggleGroup } from '@radix-ng/primitives/toggle-group';
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
        RdxToggleGroup,
        RdxToolbarButton,
        RdxToolbarLink,
        RdxToolbarRoot,
        RdxToolbarSeparator
    ],
    template: `
        <div
            class="border-foreground bg-background flex w-150 max-w-full flex-wrap items-center gap-px border p-px"
            rdxToolbarRoot
            aria-label="Formatting options"
        >
            <div class="flex gap-px" rdxToggleGroup multiple aria-label="Text formatting">
                <button class="demo-button demo-toolbar-pressable size-8" rdxToggle value="bold" aria-label="Bold">
                    <svg lucideBold size="16"></svg>
                </button>
                <button class="demo-button demo-toolbar-pressable size-8" rdxToggle value="italic" aria-label="Italic">
                    <svg lucideItalic size="16"></svg>
                </button>
                <button
                    class="demo-button demo-toolbar-pressable size-8"
                    rdxToggle
                    value="underline"
                    aria-label="Underline"
                >
                    <svg lucideUnderline size="16"></svg>
                </button>
            </div>

            <div class="bg-foreground m-1 h-4 w-px" rdxToolbarSeparator orientation="vertical"></div>

            <div class="flex gap-px" [value]="alignment" rdxToggleGroup aria-label="Text alignment">
                <button
                    class="demo-button demo-toolbar-pressable size-8"
                    rdxToggle
                    value="left"
                    aria-label="Align left"
                >
                    <svg lucideTextAlignStart size="16"></svg>
                </button>
                <button
                    class="demo-button demo-toolbar-pressable size-8"
                    rdxToggle
                    value="center"
                    aria-label="Align center"
                >
                    <svg lucideTextAlignCenter size="16"></svg>
                </button>
                <button
                    class="demo-button demo-toolbar-pressable size-8"
                    rdxToggle
                    value="right"
                    aria-label="Align right"
                >
                    <svg lucideTextAlignEnd size="16"></svg>
                </button>
            </div>

            <div class="bg-foreground m-1 h-4 w-px" rdxToolbarSeparator orientation="vertical"></div>

            <a
                class="text-muted-foreground focus-visible:outline-ring ms-auto px-2 text-sm hover:text-blue-700 focus-visible:outline-2 dark:hover:text-blue-500"
                href="#"
                rdxToolbarLink
            >
                Edited 2h ago
            </a>
            <button class="demo-button demo-button-ghost h-8 px-3" rdxToolbarButton>Share</button>
        </div>
    `
})
export class ToolbarDefaultStory {
    protected readonly alignment = ['left'];
}
