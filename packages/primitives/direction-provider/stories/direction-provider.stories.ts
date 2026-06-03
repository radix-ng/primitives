import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { DirectionProviderSliderExample } from './direction-provider-slider';
import sliderSource from './direction-provider-slider?raw';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

const html = String.raw;
const source = (code: string) => ({ docs: { source: { code, language: 'typescript' } } });

export default {
    title: 'Utilities/DirectionProvider',
    decorators: [
        moduleMetadata({
            imports: [DirectionProviderSliderExample]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Slider: Story = {
    parameters: source(sliderSource),
    render: () => ({
        template: html`
            <direction-provider-slider-example />
        `
    })
};
