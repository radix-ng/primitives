import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { FocusScope, FocusScopeEvents, FocusScopeLoop } from './focus-scope';

const html = String.raw;

export default {
    title: 'Utilities/Focus Scope',
    decorators: [
        moduleMetadata({
            imports: [FocusScope, FocusScopeLoop, FocusScopeEvents]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Trapped: Story = {
    render: () => ({
        template: html`
            <focus-scope-trapped />
        `
    })
};

export const Loop: Story = {
    render: () => ({
        template: html`
            <focus-scope-trapped-loop />
        `
    })
};

export const Events: Story = {
    render: () => ({
        template: html`
            <focus-scope-events />
        `
    })
};
