import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxAlertDialogCloseConfirmationComponent } from './alert-dialog-close-confirmation';
import closeConfirmationSource from './alert-dialog-close-confirmation?raw';
import { RdxAlertDialogControlledComponent } from './alert-dialog-controlled';
import { RdxAlertDialogControlledMultipleComponent } from './alert-dialog-controlled-multiple';
import controlledMultipleSource from './alert-dialog-controlled-multiple?raw';
import controlledSource from './alert-dialog-controlled?raw';
import { RdxAlertDialogDefaultComponent } from './alert-dialog-default';
import defaultSource from './alert-dialog-default?raw';
import { RdxAlertDialogDetachedComponent } from './alert-dialog-detached';
import detachedSource from './alert-dialog-detached?raw';
import { RdxAlertDialogFromMenuComponent } from './alert-dialog-from-menu';
import fromMenuSource from './alert-dialog-from-menu?raw';
import { RdxAlertDialogMultipleTriggersComponent } from './alert-dialog-multiple-triggers';
import multipleTriggersSource from './alert-dialog-multiple-triggers?raw';

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
                RdxAlertDialogDetachedComponent,
                RdxAlertDialogMultipleTriggersComponent,
                RdxAlertDialogControlledMultipleComponent,
                RdxAlertDialogCloseConfirmationComponent,
                RdxAlertDialogFromMenuComponent
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

export const MultipleTriggers: Story = {
    parameters: source(multipleTriggersSource),
    render: () => ({
        template: html`
            <rdx-alert-dialog-multiple-triggers />
        `
    })
};

export const ControlledMultiple: Story = {
    parameters: source(controlledMultipleSource),
    render: () => ({
        template: html`
            <rdx-alert-dialog-controlled-multiple />
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

export const CloseConfirmation: Story = {
    parameters: source(closeConfirmationSource),
    render: () => ({
        template: html`
            <rdx-alert-dialog-close-confirmation />
        `
    })
};

export const FromMenu: Story = {
    parameters: source(fromMenuSource),
    render: () => ({
        template: html`
            <rdx-alert-dialog-from-menu />
        `
    })
};
