import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxAspectRatioDirective } from '../src/aspect-ratio.directive';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

const html = String.raw;

const IMG_SRC = 'https://images.unsplash.com/photo-1535025183041-0991a977e25b?w=300&dpr=2&q=80';
const IMG_ALT = 'Landscape photograph by Tobias Tullius';

export default {
    title: 'Primitives/Aspect Ratio',
    // Opt out of the `apps/visual-regression` screenshot sweep: both demos fill the ratio box with a
    // remote Unsplash image and have no fallback, so the captured frame depends on network timing.
    // Visual regression must stay hermetic. (Avatar keeps the sweep — it deterministically renders its
    // initials fallback regardless of whether the remote image resolves.)
    tags: ['!visual'],
    decorators: [
        moduleMetadata({
            imports: [RdxAspectRatioDirective]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: html`
            <div class="border-border w-[300px] overflow-hidden rounded-md border shadow-sm">
                <div rdxAspectRatio [ratio]="16 / 9">
                    <img class="size-full object-cover" src="${IMG_SRC}" alt="${IMG_ALT}" />
                </div>
            </div>
        `
    })
};

export const Ratios: Story = {
    render: () => ({
        props: {
            ratios: [
                { value: 1 / 2, label: '1/2' },
                { value: 1, label: '1' },
                { value: 16 / 9, label: '16/9' },
                { value: 2 / 1, label: '2/1' }
            ]
        },
        template: html`
            <div class="flex gap-5">
                @for (ratio of ratios; track ratio.label) {
                <div class="w-[200px]">
                    <span class="text-foreground text-sm">{{ ratio.label }}</span>
                    <div class="border-border mt-1 overflow-hidden rounded-md border shadow-sm">
                        <div rdxAspectRatio [ratio]="ratio.value">
                            <img class="size-full object-cover" src="${IMG_SRC}" alt="${IMG_ALT}" />
                        </div>
                    </div>
                </div>
                }
            </div>
        `
    })
};
