import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxDismissableLayerDemo } from './dismissable-layer';
import source from './dismissable-layer?raw';

const html = String.raw;

const meta: Meta = {
    title: 'Utilities/Dismissable Layer',
    decorators: [
        moduleMetadata({
            imports: [RdxDismissableLayerDemo]
        }),
        tailwindDemoDecorator({ size: 'tall' })
    ]
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: html`
            <rdx-dismissable-layer-demo />
        `
    }),
    parameters: {
        docs: {
            source: {
                code: source,
                language: 'typescript'
            }
        }
    }
};
