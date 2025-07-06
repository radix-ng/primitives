import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { FocusScope, FocusScopeEvents, FocusScopeLoop } from './focus-scope';

const html = String.raw;

export default {
    title: 'Utilities/Focus Scope',
    decorators: [
        moduleMetadata({
            imports: [FocusScope, FocusScopeLoop, FocusScopeEvents]
        }),
        componentWrapperDecorator(
            (story) => html`
                <div class="radix-themes light light-theme" data-radius="medium" data-scaling="100%">${story}</div>
            `
        )
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
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
