import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxAlertDialogControlledComponent } from './alert-dialog-controlled';
import controlledSource from './alert-dialog-controlled?raw';
import { RdxAlertDialogDefaultComponent } from './alert-dialog-default';
import defaultSource from './alert-dialog-default?raw';
import { RdxAlertDialogDetachedComponent } from './alert-dialog-detached';
import detachedSource from './alert-dialog-detached?raw';

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
    title: 'Primitives/Alert Dialog',
    decorators: [
        moduleMetadata({
            imports: [
                RdxAlertDialogDefaultComponent,
                RdxAlertDialogControlledComponent,
                RdxAlertDialogDetachedComponent
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
            <rdx-alert-dialog-default />
        `
    })
};

export const Controlled: Story = {
    parameters: source(controlledSource),
    render: () => ({
        template: html`
            <rdx-alert-dialog-controlled />
        `
    })
};

export const Detached: Story = {
    parameters: source(detachedSource),
    render: () => ({
        template: html`
            <rdx-alert-dialog-detached />
        `
    })
};
