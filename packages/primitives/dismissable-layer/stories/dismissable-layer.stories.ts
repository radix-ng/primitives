import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { DismissableFocusTrap } from './dismissable-focus-trap';
import { DismissableLayer } from './dismissable-layer';
import { DismissableNested } from './dismissable-nested';

const html = String.raw;

export default {
    title: 'Primitives/Dismissable Layer',
    decorators: [
        moduleMetadata({
            imports: [DismissableLayer, DismissableNested, DismissableFocusTrap]
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
    args: {
        preventEscapeKeyDownEvent: false,
        preventPointerDownOutsideEvent: false,
        preventFocusOutsideEvent: false
    },
    render: (args) => ({
        props: args,
        template: html`
            <dismissable-layer
                [preventEscapeKeyDownEvent]="preventEscapeKeyDownEvent"
                [preventPointerDownOutsideEvent]="preventPointerDownOutsideEvent"
                [preventFocusOutsideEvent]="preventFocusOutsideEvent"
            />
        `
    })
};

export const Nested: Story = {
    render: () => ({
        template: html`
            <dismissable-nested />
        `
    })
};

export const FocusTrap: Story = {
    render: () => ({
        template: html`
            <dismissable-focus-trap />
        `
    })
};
