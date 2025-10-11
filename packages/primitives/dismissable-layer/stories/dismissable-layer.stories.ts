import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { DismissableFocusTrap } from './dismissable-focus-trap';
import { DismissableLayer } from './dismissable-layer';
import { DismissableNested } from './dismissable-nested';
import { DummyDialog } from './dummy-dialog';
import { DummyPopover } from './dummy-popover';

const html = String.raw;

export default {
    title: 'Primitives/Dismissable Layer',
    decorators: [
        moduleMetadata({
            imports: [DismissableLayer, DismissableNested, DismissableFocusTrap, DummyDialog, DummyPopover]
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

export const Dialog: Story = {
    render: () => ({
        template: html`
            <ul class="ml-4 list-disc p-4 text-white">
                <li>✅ focus should move inside \`Dialog\` when mounted</li>
                <li>✅ focus should be trapped inside \`Dialog\`</li>
                <li>✅ scrolling outside \`Dialog\` should be disabled</li>
                <li>✅ should be able to dismiss \`Dialog\` on pressing escape</li>
                <li class="ml-6">✅ focus should return to the open button</li>
                <li>
                    ✅ interacting outside \`Dialog\` should be disabled (clicking the "alert me" button shouldn't do
                    anything)
                </li>
                <li>➕</li>
                <li>✅ should be able to dismiss \`Dialog\` when interacting outside</li>
                <li class="ml-6">✅ focus should return to the open button</li>
            </ul>
            <dummy-dialog />
        `
    })
};

export const Popover: Story = {
    args: {
        disableOutsidePointerEvents: false,
        trapped: false
    },
    render: (args) => ({
        props: args,
        template: html`
            <dummy-popover [disableOutsidePointerEvents]="disableOutsidePointerEvents" [trapped]="trapped" />
        `
    })
};
