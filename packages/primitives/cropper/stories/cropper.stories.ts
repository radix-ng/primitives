import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { CropperDefault } from './cropper-default';
import { CropperDisabled } from './cropper-disabled';
import { CropperWithData } from './cropper-with-data';

// Full component source for the "Show code" panel (Vite `?raw` import).
import defaultSource from './cropper-default?raw';
import disabledSource from './cropper-disabled?raw';
import withDataSource from './cropper-with-data?raw';

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
