import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { ToastAnchoredExample } from './toast-anchored';
import anchoredSource from './toast-anchored?raw';
import { ToastCustomDataExample } from './toast-custom-data';
import customDataSource from './toast-custom-data?raw';
import { ToastCustomPositionExample } from './toast-custom-position';
import customPositionSource from './toast-custom-position?raw';
import { ToastDeduplicatedExample } from './toast-deduplicated';
import deduplicatedSource from './toast-deduplicated?raw';
import { ToastDefaultExample } from './toast-default';
import defaultSource from './toast-default?raw';
import { ToastPromiseExample } from './toast-promise';
import promiseSource from './toast-promise?raw';
import { ToastStackingExample } from './toast-stacking';
import stackingSource from './toast-stacking?raw';
import { ToastSwipeExample } from './toast-swipe';
import swipeSource from './toast-swipe?raw';
import { ToastTypesExample } from './toast-types';
import typesSource from './toast-types?raw';
import { ToastUndoActionExample } from './toast-undo-action';
import undoActionSource from './toast-undo-action?raw';
import { ToastVaryingHeightsExample } from './toast-varying-heights';
import varyingHeightsSource from './toast-varying-heights?raw';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

const html = String.raw;
const source = (code: string) => ({ docs: { source: { code, language: 'typescript' } } });

export default {
    title: 'Primitives/Toast',
    decorators: [
        moduleMetadata({
            imports: [
                ToastDefaultExample,
                ToastStackingExample,
                ToastSwipeExample,
                ToastPromiseExample,
                ToastTypesExample,
                ToastCustomPositionExample,
                ToastUndoActionExample,
                ToastCustomDataExample,
                ToastDeduplicatedExample,
                ToastVaryingHeightsExample,
                ToastAnchoredExample
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
            <toast-default-example />
        `
    })
};

export const Stacking: Story = {
    parameters: source(stackingSource),
    render: () => ({
        template: html`
            <toast-stacking-example />
        `
    })
};

export const SwipeToDismiss: Story = {
    parameters: source(swipeSource),
    render: () => ({
        template: html`
            <toast-swipe-example />
        `
    })
};

export const Promise: Story = {
    parameters: source(promiseSource),
    render: () => ({
        template: html`
            <toast-promise-example />
        `
    })
};

export const Types: Story = {
    parameters: source(typesSource),
    render: () => ({
        template: html`
            <toast-types-example />
        `
    })
};

export const CustomPosition: Story = {
    parameters: source(customPositionSource),
    render: () => ({
        template: html`
            <toast-custom-position-example />
        `
    })
};

export const UndoAction: Story = {
    parameters: source(undoActionSource),
    render: () => ({
        template: html`
            <toast-undo-action-example />
        `
    })
};

export const CustomData: Story = {
    parameters: source(customDataSource),
    render: () => ({
        template: html`
            <toast-custom-data-example />
        `
    })
};

export const Deduplicated: Story = {
    parameters: source(deduplicatedSource),
    render: () => ({
        template: html`
            <toast-deduplicated-example />
        `
    })
};

export const VaryingHeights: Story = {
    parameters: source(varyingHeightsSource),
    render: () => ({
        template: html`
            <toast-varying-heights-example />
        `
    })
};

export const Anchored: Story = {
    parameters: source(anchoredSource),
    render: () => ({
        template: html`
            <toast-anchored-example />
        `
    })
};
