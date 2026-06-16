import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { SelectAlignedPosition } from './select-aligned-position';
import { SelectAlignedPositionWithScroll } from './select-aligned-position-with-scroll';
import alignedPositionWithScrollSource from './select-aligned-position-with-scroll?raw';
import alignedPositionSource from './select-aligned-position?raw';
import { SelectDefault } from './select-default';
import defaultSource from './select-default?raw';
import { SelectMultiple } from './select-multiple';
import multipleSource from './select-multiple?raw';
import { SelectObjectValues } from './select-object-values';
import objectValuesSource from './select-object-values?raw';
import { SelectWithScroll } from './select-with-scroll';
import withScrollSource from './select-with-scroll?raw';

const html = String.raw;

const source = (code: string) => ({
    docs: { source: { code, language: 'typescript' } }
});

export default {
    title: 'Primitives/Select',
    decorators: [
        moduleMetadata({
            imports: [
                SelectDefault,
                SelectMultiple,
                SelectObjectValues,
                SelectWithScroll,
                SelectAlignedPosition,
                SelectAlignedPositionWithScroll
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
            <select-default />
        `
    })
};

export const Multiple: Story = {
    parameters: source(multipleSource),
    render: () => ({
        template: html`
            <select-multiple />
        `
    })
};

export const ObjectValues: Story = {
    parameters: source(objectValuesSource),
    render: () => ({
        template: html`
            <select-object-values />
        `
    })
};

export const WithScroll: Story = {
    parameters: source(withScrollSource),
    render: () => ({
        template: html`
            <select-with-scroll />
        `
    })
};

export const AlignedPosition: Story = {
    parameters: source(alignedPositionSource),
    render: () => ({
        template: html`
            <select-aligned-position />
        `
    })
};

export const AlignedPositionWithScroll: Story = {
    parameters: source(alignedPositionWithScrollSource),
    render: () => ({
        template: html`
            <select-aligned-position-with-scroll />
        `
    })
};

/**
 * A **non-modal** item-aligned select. Base UI still locks page scroll for an item-aligned popup even
 * when `modal === false` (the popup overlays the trigger, so the page must not scroll behind it).
 */
export const AlignedPositionNonModal: Story = {
    parameters: source(alignedPositionSource),
    render: () => ({
        template: html`
            <select-aligned-position [modal]="false" />
        `
    })
};
