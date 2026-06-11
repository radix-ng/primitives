import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { ComboboxAsync } from './combobox-async';
import { ComboboxAsyncMultiple } from './combobox-async-multiple';
import asyncMultipleSource from './combobox-async-multiple?raw';
import asyncSource from './combobox-async?raw';
import { ComboboxCommand } from './combobox-command';
import commandSource from './combobox-command?raw';
import { ComboboxCreatable } from './combobox-creatable';
import creatableSource from './combobox-creatable?raw';
import { ComboboxDefault } from './combobox-default';
import defaultSource from './combobox-default?raw';
import { ComboboxDisabled } from './combobox-disabled';
import disabledSource from './combobox-disabled?raw';
import { ComboboxEmpty } from './combobox-empty';
import emptySource from './combobox-empty?raw';
import { ComboboxGrouped } from './combobox-grouped';
import groupedSource from './combobox-grouped?raw';
import { ComboboxInputInPopup } from './combobox-input-in-popup';
import inputInPopupSource from './combobox-input-in-popup?raw';
import { ComboboxModal } from './combobox-modal';
import modalSource from './combobox-modal?raw';
import { ComboboxMultiple } from './combobox-multiple';
import multipleSource from './combobox-multiple?raw';
import { ComboboxReactiveForms } from './combobox-reactive-forms';
import reactiveFormsSource from './combobox-reactive-forms?raw';
import { ComboboxVirtualizedExample } from './combobox-virtualized';
import virtualizedSource from './combobox-virtualized?raw';

const html = String.raw;

const source = (code: string) => ({
    docs: { source: { code, language: 'typescript' } }
});

export default {
    title: 'Primitives/Combobox',
    decorators: [
        moduleMetadata({
            imports: [
                ComboboxDefault,
                ComboboxDisabled,
                ComboboxGrouped,
                ComboboxMultiple,
                ComboboxAsync,
                ComboboxAsyncMultiple,
                ComboboxCreatable,
                ComboboxInputInPopup,
                ComboboxModal,
                ComboboxCommand,
                ComboboxReactiveForms,
                ComboboxEmpty,
                ComboboxVirtualizedExample
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
            <combobox-default />
        `
    })
};

export const Disabled: Story = {
    parameters: source(disabledSource),
    render: () => ({
        template: html`
            <combobox-disabled />
        `
    })
};

export const Grouped: Story = {
    parameters: source(groupedSource),
    render: () => ({
        template: html`
            <combobox-grouped />
        `
    })
};

export const Multiple: Story = {
    parameters: source(multipleSource),
    render: () => ({
        template: html`
            <combobox-multiple />
        `
    })
};

export const Async: Story = {
    parameters: source(asyncSource),
    render: () => ({
        template: html`
            <combobox-async />
        `
    })
};

export const AsyncMultiple: Story = {
    parameters: source(asyncMultipleSource),
    render: () => ({
        template: html`
            <combobox-async-multiple />
        `
    })
};

export const Creatable: Story = {
    parameters: source(creatableSource),
    render: () => ({
        template: html`
            <combobox-creatable />
        `
    })
};

export const InputInPopup: Story = {
    parameters: source(inputInPopupSource),
    render: () => ({
        template: html`
            <combobox-input-in-popup />
        `
    })
};

export const Modal: Story = {
    parameters: source(modalSource),
    render: () => ({
        template: html`
            <combobox-modal />
        `
    })
};

export const Command: Story = {
    parameters: source(commandSource),
    render: () => ({
        template: html`
            <combobox-command />
        `
    })
};

export const ReactiveForms: Story = {
    parameters: source(reactiveFormsSource),
    render: () => ({
        template: html`
            <combobox-reactive-forms />
        `
    })
};

export const Empty: Story = {
    parameters: source(emptySource),
    render: () => ({
        template: html`
            <combobox-empty />
        `
    })
};

export const Virtualized: Story = {
    parameters: source(virtualizedSource),
    render: () => ({
        template: html`
            <combobox-virtualized-example />
        `
    })
};
