import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxDialogCloseConfirmationComponent } from './dialog-close-confirmation';
import closeConfirmationSource from './dialog-close-confirmation?raw';
import { RdxDialogControlledComponent } from './dialog-controlled';
import controlledSource from './dialog-controlled?raw';
import { RdxDialogControlledMultipleComponent } from './dialog-controlled-multiple';
import controlledMultipleSource from './dialog-controlled-multiple?raw';
import { RdxDialogDefaultComponent } from './dialog-default';
import defaultSource from './dialog-default?raw';
import { RdxDialogDetachedComponent } from './dialog-detached';
import detachedSource from './dialog-detached?raw';
import { RdxDialogFromMenuComponent } from './dialog-from-menu';
import fromMenuSource from './dialog-from-menu?raw';
import { RdxDialogInsideScrollComponent } from './dialog-inside-scroll';
import insideScrollSource from './dialog-inside-scroll?raw';
import { RdxDialogMultipleTriggersComponent } from './dialog-multiple-triggers';
import multipleTriggersSource from './dialog-multiple-triggers?raw';
import { RdxDialogNestedComponent } from './dialog-nested';
import nestedSource from './dialog-nested?raw';
import { RdxDialogNonModalComponent } from './dialog-non-modal';
import nonModalSource from './dialog-non-modal?raw';
import { RdxDialogOutsideScrollComponent } from './dialog-outside-scroll';
import outsideScrollSource from './dialog-outside-scroll?raw';
import { RdxDialogTrapFocusComponent } from './dialog-trap-focus';
import trapFocusSource from './dialog-trap-focus?raw';
import { RdxDialogUncontainedComponent } from './dialog-uncontained';
import uncontainedSource from './dialog-uncontained?raw';
import { RdxDialogWithoutDismissComponent } from './dialog-without-dismiss';
import withoutDismissSource from './dialog-without-dismiss?raw';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

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
                RdxDialogWithoutDismissComponent,
                RdxDialogMultipleTriggersComponent,
                RdxDialogControlledMultipleComponent,
                RdxDialogDetachedComponent,
                RdxDialogNestedComponent,
                RdxDialogCloseConfirmationComponent,
                RdxDialogOutsideScrollComponent,
                RdxDialogInsideScrollComponent,
                RdxDialogUncontainedComponent,
                RdxDialogFromMenuComponent
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

export const MultipleTriggers: Story = {
    parameters: source(multipleTriggersSource),
    render: () => ({
        template: html`
            <rdx-dialog-multiple-triggers />
        `
    })
};

export const ControlledMultiple: Story = {
    parameters: source(controlledMultipleSource),
    render: () => ({
        template: html`
            <rdx-dialog-controlled-multiple />
        `
    })
};

export const Detached: Story = {
    parameters: source(detachedSource),
    render: () => ({
        template: html`
            <rdx-dialog-detached />
        `
    })
};

export const Nested: Story = {
    parameters: source(nestedSource),
    render: () => ({
        template: html`
            <rdx-dialog-nested />
        `
    })
};

export const CloseConfirmation: Story = {
    parameters: source(closeConfirmationSource),
    render: () => ({
        template: html`
            <rdx-dialog-close-confirmation />
        `
    })
};

export const OutsideScroll: Story = {
    parameters: source(outsideScrollSource),
    render: () => ({
        template: html`
            <rdx-dialog-outside-scroll />
        `
    })
};

export const InsideScroll: Story = {
    parameters: source(insideScrollSource),
    render: () => ({
        template: html`
            <rdx-dialog-inside-scroll />
        `
    })
};

export const Uncontained: Story = {
    parameters: source(uncontainedSource),
    render: () => ({
        template: html`
            <rdx-dialog-uncontained />
        `
    })
};

export const FromMenu: Story = {
    parameters: source(fromMenuSource),
    render: () => ({
        template: html`
            <rdx-dialog-from-menu />
        `
    })
};
