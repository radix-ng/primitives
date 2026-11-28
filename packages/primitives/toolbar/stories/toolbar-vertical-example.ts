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
    selector: 'rdx-toolbar-vertical-example',
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
            class="demo-toolbar-root flex w-fit flex-col items-center items-stretch gap-1 p-1"
            rdxToolbarRoot
            orientation="vertical"
            aria-label="Formatting options"
        >
            <div class="flex flex-col gap-1" [value]="alignment" rdxToggleGroup aria-label="Text alignment">
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
            <div class="bg-border mx-1 my-1 h-px" rdxToolbarSeparator orientation="horizontal"></div>
            <button
                class="demo-toolbar-button focus-visible:ring-ring inline-flex h-8 items-center justify-center px-2.5 focus-visible:ring-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                rdxToolbarButton
            >
                Share
            </button>
        </div>
    `
})
export class ToolbarVerticalStory {
    protected readonly alignment = ['left'];
}
