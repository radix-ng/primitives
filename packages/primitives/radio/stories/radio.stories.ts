import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { RdxLabelDirective } from '../../label';
import { RdxRovingFocusGroupDirective, RdxRovingFocusItemDirective } from '../../roving-focus';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxRadioIndicatorDirective } from '../src/radio-indicator.directive';
import { RdxRadioItemInputDirective } from '../src/radio-item-input.directive';
import { RdxRadioItemDirective } from '../src/radio-item.directive';
import { RdxRadioGroupDirective } from '../src/radio-root.directive';
import { RadioGroupComponent } from './radio-group.component';

const html = String.raw;

export default {
    title: 'Primitives/Radio Group',
    decorators: [
        moduleMetadata({
            imports: [
                RdxLabelDirective,
                RdxRadioItemDirective,
                RdxRadioIndicatorDirective,
                RdxRadioItemInputDirective,
                RdxRadioGroupDirective,
                RdxRovingFocusGroupDirective,
                RdxRovingFocusItemDirective,
                RadioGroupComponent
            ]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: html`
            <form>
                <div class="flex flex-col gap-2.5" rdxRadioRoot orientation="vertical" aria-label="View density">
                    <div class="flex items-center gap-3">
                        <button
                            class="border-border bg-background hover:bg-muted focus-visible:ring-ring flex size-6 items-center justify-center rounded-full border shadow-sm outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                            id="r1"
                            rdxRadioItem
                            value="default"
                        >
                            <div
                                class="after:bg-primary flex size-full items-center justify-center after:block after:size-2.5 after:rounded-full data-[state=unchecked]:hidden"
                                rdxRadioIndicator
                            ></div>
                            <input
                                class="pointer-events-none absolute m-0 size-6 -translate-x-full opacity-0"
                                rdxRadioItemInput
                                feature="fully-hidden"
                            />
                        </button>
                        <label class="text-foreground text-sm font-medium" rdxLabel htmlFor="r1">Default</label>
                    </div>
                    <div class="flex items-center gap-3">
                        <button
                            class="border-border bg-background hover:bg-muted focus-visible:ring-ring flex size-6 items-center justify-center rounded-full border shadow-sm outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                            id="r2"
                            rdxRadioItem
                            [required]="true"
                            value="comfortable"
                        >
                            <div
                                class="after:bg-primary flex size-full items-center justify-center after:block after:size-2.5 after:rounded-full data-[state=unchecked]:hidden"
                                rdxRadioIndicator
                            ></div>
                            <input
                                class="pointer-events-none absolute m-0 size-6 -translate-x-full opacity-0"
                                rdxRadioItemInput
                                feature="fully-hidden"
                            />
                        </button>
                        <label class="text-foreground text-sm font-medium" rdxLabel htmlFor="r2">Comfortable</label>
                    </div>
                    <div class="flex items-center gap-3">
                        <button
                            class="border-border bg-background hover:bg-muted focus-visible:ring-ring flex size-6 items-center justify-center rounded-full border shadow-sm outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                            id="r3"
                            rdxRadioItem
                            value="compact"
                        >
                            <div
                                class="after:bg-primary flex size-full items-center justify-center after:block after:size-2.5 after:rounded-full data-[state=unchecked]:hidden"
                                rdxRadioIndicator
                            ></div>
                            <input
                                class="pointer-events-none absolute m-0 size-6 -translate-x-full opacity-0"
                                rdxRadioItemInput
                                feature="fully-hidden"
                            />
                        </button>
                        <label class="text-foreground text-sm font-medium" rdxLabel htmlFor="r3">Compact</label>
                    </div>
                </div>
            </form>
        `
    })
};

export const RadioGroup: Story = {
    render: () => ({
        template: `<radio-groups-forms-example></radio-groups-forms-example>`
    })
};

export const DisabledGroup: Story = {
    render: () => ({
        template: html`
            <div
                class="flex flex-col gap-2.5"
                rdxRadioRoot
                [value]="'comfortable'"
                disabled
                orientation="vertical"
                aria-label="View density"
            >
                <div class="flex items-center gap-3">
                    <button
                        class="border-border bg-background hover:bg-muted focus-visible:ring-ring flex size-6 items-center justify-center rounded-full border shadow-sm outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                        id="r1"
                        rdxRadioItem
                        value="default"
                    >
                        <div
                            class="after:bg-primary flex size-full items-center justify-center after:block after:size-2.5 after:rounded-full data-[state=unchecked]:hidden"
                            rdxRadioIndicator
                        ></div>
                        <input
                            class="pointer-events-none absolute m-0 size-6 -translate-x-full opacity-0"
                            rdxRadioItemInput
                            feature="fully-hidden"
                        />
                    </button>
                    <label class="text-foreground text-sm font-medium" rdxLabel htmlFor="r1">Default</label>
                </div>
                <div class="flex items-center gap-3">
                    <button
                        class="border-border bg-background hover:bg-muted focus-visible:ring-ring flex size-6 items-center justify-center rounded-full border shadow-sm outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                        id="r2"
                        rdxRadioItem
                        [required]="true"
                        value="comfortable"
                    >
                        <div
                            class="after:bg-primary flex size-full items-center justify-center after:block after:size-2.5 after:rounded-full data-[state=unchecked]:hidden"
                            rdxRadioIndicator
                        ></div>
                        <input
                            class="pointer-events-none absolute m-0 size-6 -translate-x-full opacity-0"
                            rdxRadioItemInput
                            feature="fully-hidden"
                        />
                    </button>
                    <label class="text-foreground text-sm font-medium" rdxLabel htmlFor="r2">Comfortable</label>
                </div>
                <div class="flex items-center gap-3">
                    <button
                        class="border-border bg-background hover:bg-muted focus-visible:ring-ring flex size-6 items-center justify-center rounded-full border shadow-sm outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                        id="r3"
                        rdxRadioItem
                        value="compact"
                    >
                        <div
                            class="after:bg-primary flex size-full items-center justify-center after:block after:size-2.5 after:rounded-full data-[state=unchecked]:hidden"
                            rdxRadioIndicator
                        ></div>
                        <input
                            class="pointer-events-none absolute m-0 size-6 -translate-x-full opacity-0"
                            rdxRadioItemInput
                            feature="fully-hidden"
                        />
                    </button>
                    <label class="text-foreground text-sm font-medium" rdxLabel htmlFor="r3">Compact</label>
                </div>
            </div>
        `
    })
};
