import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { CropperDefault } from './cropper-default';
// Full component source for the "Show code" panel (Vite `?raw` import).
import defaultSource from './cropper-default?raw';
import { CropperDisabled } from './cropper-disabled';
import disabledSource from './cropper-disabled?raw';
import { CropperWithData } from './cropper-with-data';
import withDataSource from './cropper-with-data?raw';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

const source = (code: string) => ({
    docs: {
        source: {
            code: code.trim(),
            language: 'typescript',
            type: 'code'
        }
    }
});

const html = String.raw;

export default {
    title: 'Primitives/Cropper',
    // Opt out of the `apps/visual-regression` screenshot sweep: every cropper demo loads a remote
    // Unsplash image, so the rendered frame depends on network timing (spinner → placeholder → image)
    // and is not deterministic for pixel diffing. Visual regression must stay hermetic.
    tags: ['!visual'],
    decorators: [
        moduleMetadata({
            imports: [CropperDefault, CropperDisabled, CropperWithData]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    parameters: source(defaultSource),
    render: () => ({
        template: html`
            <cropper-default />
        `
    })
};

export const Disabled: Story = {
    parameters: source(disabledSource),
    render: () => ({
        template: html`
            <cropper-disabled />
        `
    })
};

export const WithData: Story = {
    parameters: source(withDataSource),
    render: () => ({
        template: html`
            <cropper-with-data />
        `
    })
};
