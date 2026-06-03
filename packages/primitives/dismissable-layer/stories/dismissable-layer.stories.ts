import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { DismissableBranch } from './dismissable-branch';
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
            imports: [
                DismissableLayer,
                DismissableBranch,
                DismissableNested,
                DismissableFocusTrap,
                DummyDialog,
                DummyPopover
            ]
        }),
        tailwindDemoDecorator()
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
            <section class="flex w-2xl flex-col gap-4">
                <div>
                    <h3 class="text-base font-semibold">Nested layers</h3>
                    <p class="text-muted-foreground mt-1 text-sm leading-6">
                        Open several children, then press Escape. Layers close one at a time, starting with the topmost
                        layer.
                    </p>
                </div>
                <dismissable-nested />
            </section>
        `
    })
};

export const Branch: Story = {
    render: () => ({
        template: html`
            <dismissable-branch />
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
            <section class="flex max-w-xl flex-col gap-4">
                <div class="border-border bg-card text-card-foreground rounded-xl border p-5 shadow-sm">
                    <h3 class="text-foreground mb-2 text-sm font-semibold">Dialog behavior</h3>
                    <ul class="text-muted-foreground ml-4 list-disc space-y-1 text-sm leading-5">
                        <li>Focus moves inside the dialog when mounted.</li>
                        <li>Focus is trapped inside the dialog.</li>
                        <li>Scrolling and outside interaction are disabled.</li>
                        <li>Escape or an outside interaction dismisses the dialog.</li>
                        <li>Focus returns to the open button after dismiss.</li>
                    </ul>
                </div>
                <dummy-dialog />
            </section>
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
            <section class="flex max-w-xl flex-col gap-4">
                <div class="border-border bg-card text-card-foreground rounded-xl border p-5 shadow-sm">
                    <h3 class="text-foreground mb-2 text-sm font-semibold">Popover behavior</h3>
                    <ul class="text-muted-foreground ml-4 list-disc space-y-1 text-sm leading-5">
                        <li>Focus moves inside the popover when mounted.</li>
                        <li>The controls can enable focus trapping and block outside pointer events.</li>
                        <li>Escape or an outside interaction dismisses the popover.</li>
                        <li>Focus returns to the open button after dismiss.</li>
                    </ul>
                </div>
                <dummy-popover [disableOutsidePointerEvents]="disableOutsidePointerEvents" [trapped]="trapped" />
            </section>
        `
    })
};
