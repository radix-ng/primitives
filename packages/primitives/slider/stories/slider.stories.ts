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
            imports: [
                RdxSliderRootComponent,
                RdxSliderTrackComponent,
                RdxSliderRangeComponent,
                RdxSliderThumbComponent
            ]
        }),
        componentWrapperDecorator(
            (story) => html`
                <div class="radix-themes light light-theme" data-radius="medium" data-scaling="100%">
                    ${story}

                    <style></style>
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
            <rdx-slider
                className="SliderRoot"
                style="display: flex; width: 200px;"
                [modelValue]="[45]"
                [min]="0"
                [max]="100"
                [step]="5"
            >
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
            <rdx-slider
                className="SliderRoot"
                style="display: flex; width: 200px;"
                [modelValue]="[45, 80]"
                [min]="0"
                [max]="100"
                [step]="5"
            >
                <rdx-slider-track class="SliderTrack">
                    <rdx-slider-range class="SliderRange" />
                </rdx-slider-track>
                <rdx-slider-thumb class="SliderThumb" />
                <rdx-slider-thumb class="SliderThumb" />
            </rdx-slider>
        `
    })
};
