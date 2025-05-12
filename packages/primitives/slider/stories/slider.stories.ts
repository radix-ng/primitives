import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
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
        componentWrapperDecorator(
            (story) => html`
                <div class="radix-themes light light-theme" data-radius="medium" data-scaling="100%">
                    ${story}

                    <style>
                        /*Look at root main.scss*/
                    </style>
                </div>
            `
        )
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: (args) => ({
        props: args,
        template: html`
            <rdx-slider styleClass="SliderRoot" [modelValue]="[45]" [step]="5">
                <rdx-slider-track class="SliderTrack">
                    <rdx-slider-range class="SliderRange" />
                </rdx-slider-track>
                <rdx-slider-thumb class="SliderThumb" />
            </rdx-slider>
        `
    })
};

export const Inverted: Story = {
    render: (args) => ({
        props: args,
        template: html`
            <rdx-slider styleClass="SliderRoot" inverted [modelValue]="[45]" [step]="5">
                <rdx-slider-track class="SliderTrack">
                    <rdx-slider-range class="SliderRange" />
                </rdx-slider-track>
                <rdx-slider-thumb class="SliderThumb" />
            </rdx-slider>
        `
    })
};

export const Thumbs: Story = {
    render: (args) => ({
        props: args,
        template: html`
            <rdx-slider styleClass="SliderRoot" [modelValue]="[45, 80]" [step]="5">
                <rdx-slider-track class="SliderTrack">
                    <rdx-slider-range class="SliderRange" />
                </rdx-slider-track>
                <rdx-slider-thumb class="SliderThumb" />
                <rdx-slider-thumb class="SliderThumb" />
            </rdx-slider>
        `
    })
};

export const Vertical: Story = {
    render: (args) => ({
        props: args,
        template: html`
            <rdx-slider styleClass="SliderRootV" [orientation]="'vertical'" [modelValue]="[45]" [step]="5">
                <rdx-slider-track class="SliderTrackV">
                    <rdx-slider-range class="SliderRangeV" />
                </rdx-slider-track>
                <rdx-slider-thumb class="SliderThumbV" />
            </rdx-slider>

            <rdx-slider styleClass="SliderRoot" [orientation]="'horizontal'" [modelValue]="[45]" [step]="5">
                <rdx-slider-track class="SliderTrack">
                    <rdx-slider-range class="SliderRange" />
                </rdx-slider-track>
                <rdx-slider-thumb class="SliderThumb" />
            </rdx-slider>
        `
    })
};

export const VerticalInverted: Story = {
    render: (args) => ({
        props: args,
        template: html`
            <rdx-slider
                styleClass="SliderRootV"
                style="display: flex; height: 200px;"
                inverted
                [orientation]="'vertical'"
                [modelValue]="[45]"
                [step]="5"
            >
                <rdx-slider-track class="SliderTrackV">
                    <rdx-slider-range class="SliderRangeV" />
                </rdx-slider-track>
                <rdx-slider-thumb class="SliderThumbV" />
            </rdx-slider>
        `
    })
};
