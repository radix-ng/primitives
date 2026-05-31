import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxSliderRangeComponent } from '../src/slider-range.component';
import { RdxSliderRootComponent } from '../src/slider-root.component';
import { RdxSliderThumbComponent } from '../src/slider-thumb.component';
import { RdxSliderTrackComponent } from '../src/slider-track.component';

const html = String.raw;

export default {
    title: 'Primitives/Slider',
    decorators: [
        moduleMetadata({
            imports: [RdxSliderRootComponent, RdxSliderTrackComponent, RdxSliderRangeComponent, RdxSliderThumbComponent]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: (args) => ({
        props: args,
        template: html`
            <rdx-slider
                styleClass="relative flex h-5 w-52 touch-none select-none items-center"
                [modelValue]="[45]"
                [step]="5"
            >
                <rdx-slider-track class="bg-muted relative h-1 grow overflow-hidden rounded-full">
                    <rdx-slider-range class="bg-primary absolute h-full rounded-full" />
                </rdx-slider-track>
                <rdx-slider-thumb
                    class="border-border bg-background focus-visible:ring-ring block size-5 rounded-full border shadow-sm outline-none focus-visible:ring-2"
                />
            </rdx-slider>
        `
    })
};

export const Inverted: Story = {
    render: (args) => ({
        props: args,
        template: html`
            <rdx-slider
                styleClass="relative flex h-5 w-52 touch-none select-none items-center"
                inverted
                [modelValue]="[45]"
                [step]="5"
            >
                <rdx-slider-track class="bg-muted relative h-1 grow overflow-hidden rounded-full">
                    <rdx-slider-range class="bg-primary absolute h-full rounded-full" />
                </rdx-slider-track>
                <rdx-slider-thumb
                    class="border-border bg-background focus-visible:ring-ring block size-5 rounded-full border shadow-sm outline-none focus-visible:ring-2"
                />
            </rdx-slider>
        `
    })
};

export const Thumbs: Story = {
    render: (args) => ({
        props: args,
        template: html`
            <rdx-slider
                styleClass="relative flex h-5 w-52 touch-none select-none items-center"
                [modelValue]="[45, 80]"
                [step]="5"
            >
                <rdx-slider-track class="bg-muted relative h-1 grow overflow-hidden rounded-full">
                    <rdx-slider-range class="bg-primary absolute h-full rounded-full" />
                </rdx-slider-track>
                <rdx-slider-thumb
                    class="border-border bg-background focus-visible:ring-ring block size-5 rounded-full border shadow-sm outline-none focus-visible:ring-2"
                />
                <rdx-slider-thumb
                    class="border-border bg-background focus-visible:ring-ring block size-5 rounded-full border shadow-sm outline-none focus-visible:ring-2"
                />
            </rdx-slider>
        `
    })
};

export const Vertical: Story = {
    render: (args) => ({
        props: args,
        template: html`
            <rdx-slider
                styleClass="relative flex h-52 w-5 touch-none select-none flex-col items-center"
                [orientation]="'vertical'"
                [modelValue]="[45]"
                [step]="5"
            >
                <rdx-slider-track class="bg-muted relative w-1 grow overflow-hidden rounded-full">
                    <rdx-slider-range class="bg-primary absolute w-full rounded-full" />
                </rdx-slider-track>
                <rdx-slider-thumb
                    class="border-border bg-background focus-visible:ring-ring absolute block size-5 -translate-y-1/2 rounded-full border shadow-sm outline-none focus-visible:ring-2"
                />
            </rdx-slider>

            <rdx-slider
                styleClass="relative flex h-5 w-52 touch-none select-none items-center"
                [orientation]="'horizontal'"
                [modelValue]="[45]"
                [step]="5"
            >
                <rdx-slider-track class="bg-muted relative h-1 grow overflow-hidden rounded-full">
                    <rdx-slider-range class="bg-primary absolute h-full rounded-full" />
                </rdx-slider-track>
                <rdx-slider-thumb
                    class="border-border bg-background focus-visible:ring-ring block size-5 rounded-full border shadow-sm outline-none focus-visible:ring-2"
                />
            </rdx-slider>
        `
    })
};

export const VerticalInverted: Story = {
    render: (args) => ({
        props: args,
        template: html`
            <rdx-slider
                styleClass="relative flex h-52 w-5 touch-none select-none flex-col items-center"
                inverted
                [orientation]="'vertical'"
                [modelValue]="[45]"
                [step]="5"
            >
                <rdx-slider-track class="bg-muted relative w-1 grow overflow-hidden rounded-full">
                    <rdx-slider-range class="bg-primary absolute w-full rounded-full" />
                </rdx-slider-track>
                <rdx-slider-thumb
                    class="border-border bg-background focus-visible:ring-ring absolute block size-5 -translate-y-1/2 rounded-full border shadow-sm outline-none focus-visible:ring-2"
                />
            </rdx-slider>
        `
    })
};
