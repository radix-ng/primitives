import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { RdxAspectRatioDirective } from '../src/aspect-ratio.directive';

const html = String.raw;

export default {
    title: 'Primitives/Aspect Ratio',
    decorators: [
        moduleMetadata({
            imports: [RdxAspectRatioDirective]
        }),
        componentWrapperDecorator(
            (story) => html`
                <div
                    class="radix-themes light light-theme radix-themes-default-fonts"
                    data-accent-color="indigo"
                    data-radius="medium"
                    data-scaling="100%"
                >
                    ${story}

                    <style>
                        .Container {
                            width: 300px;
                            border-radius: 6px;
                            overflow: hidden;
                            box-shadow: 0 2px 10px var(--black-a7);
                        }

                        .Image {
                            object-fit: cover;
                            width: 100%;
                            height: 100%;
                        }
                    </style>
                </div>
            `
        )
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: html`
            <div class="Container">
                <div rdxAspectRatio [ratio]="16/9">
                    <img
                        class="Image"
                        src="https://images.unsplash.com/photo-1535025183041-0991a977e25b?w=300&dpr=2&q=80"
                        alt="Landscape photograph by Tobias Tullius"
                    />
                </div>
            </div>
        `
    })
};

export const Ratios: Story = {
    render: () => ({
        template: html`
            <div style="display: flex; gap: 20px;">
                <div style="width: 200px;">
                    <span style="color: white">1/2</span>
                    <div rdxAspectRatio [ratio]="1/2">
                        <img
                            class="Image"
                            src="https://images.unsplash.com/photo-1535025183041-0991a977e25b?w=300&dpr=2&q=80"
                            alt="Landscape photograph by Tobias Tullius"
                        />
                    </div>
                </div>
                <div style="width: 200px;">
                    <span style="color: white">1</span>
                    <div rdxAspectRatio>
                        <img
                            class="Image"
                            src="https://images.unsplash.com/photo-1535025183041-0991a977e25b?w=300&dpr=2&q=80"
                            alt="Landscape photograph by Tobias Tullius"
                        />
                    </div>
                </div>
                <div style="width: 200px;">
                    <span style="color: white">16/9</span>
                    <div rdxAspectRatio [ratio]="16/9">
                        <img
                            class="Image"
                            src="https://images.unsplash.com/photo-1535025183041-0991a977e25b?w=300&dpr=2&q=80"
                            alt="Landscape photograph by Tobias Tullius"
                        />
                    </div>
                </div>
                <div style="width: 200px;">
                    <span style="color: white">2/1</span>
                    <div rdxAspectRatio [ratio]="2/1">
                        <img
                            class="Image"
                            src="https://images.unsplash.com/photo-1535025183041-0991a977e25b?w=300&dpr=2&q=80"
                            alt="Landscape photograph by Tobias Tullius"
                        />
                    </div>
                </div>
            </div>
        `
    })
};
