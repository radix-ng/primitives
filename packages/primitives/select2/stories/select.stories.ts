import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import {
    SelectAlignedPosition,
    SelectAlignedPositionWithScroll,
    SelectDefault,
    SelectDefaultWithScroll
} from './select';

const html = String.raw;

export default {
    title: 'Primitives/Select2',
    decorators: [
        moduleMetadata({
            imports: [SelectDefault, SelectDefaultWithScroll, SelectAlignedPosition, SelectAlignedPositionWithScroll]
        }),
        componentWrapperDecorator(
            (story) => html`
                <div class="radix-themes light light-theme" data-radius="medium" data-scaling="100%">
                    <div
                        style="height: 500px;
                                display: flex;
                                justify-content: center;
                                gap: 80px;
                                align-items: center;
                                border: 3px dashed var(--white-a8);
                                border-radius: 12px;"
                    >
                        ${story}
                    </div>

                    <style></style>
                </div>
            `
        )
    ],
    argTypes: {
        side: {
            options: ['top', 'right', 'bottom', 'left'],
            control: { type: 'select' }
        },
        sideOffset: {
            control: { type: 'number' }
        },
        open: {
            control: { type: 'boolean' }
        }
    }
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    args: {
        open: true,
        disabled: false,
        sideOffset: 8,
        closeDelay: 0,
        side: 'top',
        options: ['Apple', 'Banana', 'Blueberry', 'Grapes', 'Pineapple']
    },
    render: (args) => ({
        props: args,
        template: html`
            <select-default />
        `
    })
};

export const DefaultWithScroll: Story = {
    render: (args) => ({
        props: args,
        template: html`
            <select-default-with-scroll />
        `
    })
};

export const AlignedPosition: Story = {
    args: {
        open: true,
        disabled: false,
        sideOffset: 8,
        closeDelay: 0,
        side: 'top',
        options: ['Apple', 'Banana', 'Blueberry', 'Grapes', 'Pineapple']
    },
    render: (args) => ({
        props: args,
        template: html`
            <select-aligned-position />
        `
    })
};

export const AlignedPositionWithScroll: Story = {
    render: (args) => ({
        props: args,
        template: html`
            <select-aligned-position-with-scroll />
        `
    })
};
