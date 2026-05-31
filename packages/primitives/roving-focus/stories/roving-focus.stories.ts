import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxRovingFocusGroupDirective } from '../src/roving-focus-group.directive';
import { RdxRovingFocusItemDirective } from '../src/roving-focus-item.directive';
import { RovingFocusEventsComponent } from './roving-focus-events.component';

const html = String.raw;

export default {
    title: 'Utilities/Roving Focus',
    decorators: [
        moduleMetadata({
            imports: [RdxRovingFocusGroupDirective, RdxRovingFocusItemDirective, RovingFocusEventsComponent]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: html`
            <section class="w-full max-w-2xl space-y-4">
                <h2 class="text-foreground text-lg font-semibold">Horizontal Navigation with Looping</h2>
                <p class="text-muted-foreground text-sm leading-6">
                    Use the ArrowLeft and ArrowRight keys to navigate between buttons. Ensure that when reaching the end
                    of the group, the focus cycles back to the first item (and vice versa).
                </p>
                <div class="flex gap-2" rdxRovingFocusGroup [orientation]="'horizontal'" [loop]="true">
                    <button
                        class="border-border bg-background text-foreground hover:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 inline-flex cursor-pointer items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
                        rdxRovingFocusItem
                    >
                        Item 1
                    </button>
                    <button
                        class="border-border bg-background text-foreground hover:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 inline-flex cursor-pointer items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
                        rdxRovingFocusItem
                    >
                        Item 2
                    </button>
                    <button
                        class="border-border bg-background text-foreground hover:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 inline-flex cursor-pointer items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
                        rdxRovingFocusItem
                    >
                        Item 3
                    </button>
                </div>
            </section>
        `
    })
};

export const HorizontalRTL: Story = {
    render: () => ({
        template: html`
            <section class="w-full max-w-2xl space-y-4">
                <h2 class="text-foreground text-lg font-semibold">Horizontal Navigation in RTL Direction</h2>
                <p class="text-muted-foreground text-sm leading-6">
                    Use the ArrowLeft and ArrowRight keys. In RTL direction, the keys should behave inversely
                    (ArrowRight moves to the previous item, and ArrowLeft moves to the next item).
                </p>
                <div class="flex gap-2" rdxRovingFocusGroup [orientation]="'horizontal'" [dir]="'rtl'" [loop]="true">
                    <button
                        class="border-border bg-background text-foreground hover:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 inline-flex cursor-pointer items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
                        rdxRovingFocusItem
                    >
                        Left
                    </button>
                    <button
                        class="border-border bg-background text-foreground hover:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 inline-flex cursor-pointer items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
                        rdxRovingFocusItem
                    >
                        Center
                    </button>
                    <button
                        class="border-border bg-background text-foreground hover:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 inline-flex cursor-pointer items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
                        rdxRovingFocusItem
                    >
                        Right
                    </button>
                </div>
            </section>
        `
    })
};

export const WithHomeAndEnd: Story = {
    render: () => ({
        template: html`
            <section class="w-full max-w-2xl space-y-4">
                <h2 class="text-foreground text-lg font-semibold">Navigation with "Home" and "End" Keys</h2>
                <p class="text-muted-foreground text-sm leading-6">
                    Press the Home key to move focus to the first item. Press the End key to move focus to the last
                    item.
                </p>
                <div class="flex gap-2" rdxRovingFocusGroup [orientation]="'horizontal'" [loop]="false">
                    <button
                        class="border-border bg-background text-foreground hover:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 inline-flex cursor-pointer items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
                        rdxRovingFocusItem
                    >
                        Left
                    </button>
                    <button
                        class="border-border bg-background text-foreground hover:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 inline-flex cursor-pointer items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
                        rdxRovingFocusItem
                    >
                        Center
                    </button>
                    <button
                        class="border-border bg-background text-foreground hover:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 inline-flex cursor-pointer items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
                        rdxRovingFocusItem
                    >
                        Right
                    </button>
                </div>
            </section>
        `
    })
};

export const MixedActiveAndInactive: Story = {
    render: () => ({
        template: html`
            <section class="w-full max-w-2xl space-y-4">
                <h2 class="text-foreground text-lg font-semibold">Mixed Active and Inactive States</h2>
                <p class="text-muted-foreground text-sm leading-6">
                    Try navigating with arrow keys. Ensure that the inactive item (Disabled) is skipped.
                </p>
                <div class="flex gap-2" rdxRovingFocusGroup [orientation]="'horizontal'" [loop]="true">
                    <button
                        class="border-border bg-background text-foreground hover:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 data-[disabled]:bg-muted inline-flex cursor-pointer items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px] data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                        rdxRovingFocusItem
                        [focusable]="true"
                    >
                        Left
                    </button>
                    <button
                        class="border-border bg-background text-foreground hover:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 data-[disabled]:bg-muted inline-flex cursor-pointer items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px] data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                        rdxRovingFocusItem
                        [focusable]="false"
                    >
                        Center
                    </button>
                    <button
                        class="border-border bg-background text-foreground hover:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 data-[disabled]:bg-muted inline-flex cursor-pointer items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px] data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                        rdxRovingFocusItem
                        [focusable]="true"
                    >
                        Right
                    </button>
                </div>
            </section>
        `
    })
};

export const VerticalWithoutLooping: Story = {
    render: () => ({
        template: html`
            <section class="w-full max-w-2xl space-y-4">
                <h2 class="text-foreground text-lg font-semibold">Vertical Navigation without Looping</h2>
                <p class="text-muted-foreground text-sm leading-6">
                    Use the ArrowLeft and ArrowRight keys to navigate between buttons. Ensure that when reaching the end
                    of the group, the focus cycles back to the first item (and vice versa).
                </p>
                <div class="flex w-fit flex-col gap-2" rdxRovingFocusGroup [orientation]="'vertical'" [loop]="false">
                    <button
                        class="border-border bg-background text-foreground hover:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 inline-flex cursor-pointer items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
                        rdxRovingFocusItem
                    >
                        Item 1
                    </button>
                    <button
                        class="border-border bg-background text-foreground hover:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 inline-flex cursor-pointer items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
                        rdxRovingFocusItem
                    >
                        Item 2
                    </button>
                    <button
                        class="border-border bg-background text-foreground hover:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 inline-flex cursor-pointer items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
                        rdxRovingFocusItem
                    >
                        Item 3
                    </button>
                </div>
            </section>
        `
    })
};

export const IgnoreShiftKey: Story = {
    render: () => ({
        template: html`
            <section class="w-full max-w-2xl space-y-4">
                <h2 class="text-foreground text-lg font-semibold">Ignore Shift Key (allowShiftKey)</h2>
                <p class="text-muted-foreground text-sm leading-6">
                    Use the ArrowLeft and ArrowRight keys to navigate between buttons. Holding the
                    <code class="border-border bg-muted rounded border px-1.5 py-0.5 text-xs">Shift</code>
                    key should not affect focus behavior.
                </p>
                <div class="flex gap-2" rdxRovingFocusGroup [orientation]="'horizontal'" [loop]="true">
                    <button
                        class="border-border bg-background text-foreground hover:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 inline-flex cursor-pointer items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
                        rdxRovingFocusItem
                        allowShiftKey="true"
                    >
                        Item 1 (Shift Allowed)
                    </button>
                    <button
                        class="border-border bg-background text-foreground hover:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 inline-flex cursor-pointer items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
                        rdxRovingFocusItem
                    >
                        Item 2 (Default)
                    </button>
                    <button
                        class="border-border bg-background text-foreground hover:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 inline-flex cursor-pointer items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
                        rdxRovingFocusItem
                        allowShiftKey="true"
                    >
                        Item 3 (Shift Allowed)
                    </button>
                </div>
            </section>
        `
    })
};

export const EventHandling: Story = {
    render: () => ({
        template: html`
            <section class="w-full max-w-2xl space-y-4">
                <h2 class="text-foreground text-lg font-semibold">Event Handling</h2>
                <p class="text-muted-foreground text-sm leading-6">
                    Verify that the
                    <code class="border-border bg-muted rounded border px-1.5 py-0.5 text-xs">entryFocus</code>
                    and
                    <code class="border-border bg-muted rounded border px-1.5 py-0.5 text-xs">
                        currentTabStopIdChange
                    </code>
                    events are triggered during the appropriate actions.
                </p>
                <rvg-events />
            </section>
        `
    })
};
