import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxDialogControlledComponent } from './dialog-controlled';
import controlledSource from './dialog-controlled?raw';
import { RdxDialogDefaultComponent } from './dialog-default';
import defaultSource from './dialog-default?raw';
import { RdxDialogNonModalComponent } from './dialog-non-modal';
import nonModalSource from './dialog-non-modal?raw';
import { RdxDialogTrapFocusComponent } from './dialog-trap-focus';
import trapFocusSource from './dialog-trap-focus?raw';
import { RdxDialogWithoutDismissComponent } from './dialog-without-dismiss';
import withoutDismissSource from './dialog-without-dismiss?raw';

const html = String.raw;

const source = (code: string) => ({
    docs: {
        source: {
            code,
            language: 'typescript'
        }
    }
});

export default {
    title: 'Primitives/Dialog',
    decorators: [
        moduleMetadata({
            imports: [
                RdxDialogDefaultComponent,
                RdxDialogControlledComponent,
                RdxDialogNonModalComponent,
                RdxDialogTrapFocusComponent,
                RdxDialogWithoutDismissComponent
            ]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    parameters: source(defaultSource),
    render: () => ({
        template: html`
            <rdx-dialog-default />
        `
    })
};

export const Controlled: Story = {
    parameters: source(controlledSource),
    render: () => ({
        template: html`
            <rdx-dialog-controlled />
        `
    })
};

export const NonModal: Story = {
    parameters: source(nonModalSource),
    render: () => ({
        template: html`
            <rdx-dialog-non-modal />
        `
    })
};

export const TrapFocus: Story = {
    parameters: source(trapFocusSource),
    render: () => ({
        template: html`
            <rdx-dialog-trap-focus />
        `
    })
};

export const WithoutDismiss: Story = {
    parameters: source(withoutDismissSource),
    render: () => ({
        template: html`
            <rdx-dialog-without-dismiss />
        `
    })
};
