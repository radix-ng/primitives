import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { SelectAlignedPosition } from './select-aligned-position';
import { SelectAlignedPositionWithScroll } from './select-aligned-position-with-scroll';
import alignedPositionWithScrollSource from './select-aligned-position-with-scroll?raw';
import alignedPositionSource from './select-aligned-position?raw';
import { SelectArrowExample } from './select-arrow';
import arrowSource from './select-arrow?raw';
import { SelectDefault } from './select-default';
import defaultSource from './select-default?raw';
import { SelectDeferredUnmount } from './select-deferred-unmount';
import deferredUnmountSource from './select-deferred-unmount?raw';
import { SelectEvents } from './select-events';
import eventsSource from './select-events?raw';
import { SelectItems } from './select-items';
import itemsSource from './select-items?raw';
import { SelectLabels } from './select-labels';
import labelsSource from './select-labels?raw';
import { SelectMultiple } from './select-multiple';
import multipleSource from './select-multiple?raw';
import { SelectNativeForms } from './select-native-forms';
import nativeFormsSource from './select-native-forms?raw';
import { SelectObjectValues } from './select-object-values';
import objectValuesSource from './select-object-values?raw';
import { SelectReactiveForms } from './select-reactive-forms';
import reactiveFormsSource from './select-reactive-forms?raw';
import { SelectTemplateDrivenForms } from './select-template-driven-forms';
import templateDrivenFormsSource from './select-template-driven-forms?raw';
import { SelectTypedWrapper } from './select-typed-wrapper';
import typedWrapperSource from './select-typed-wrapper?raw';
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
                SelectDeferredUnmount,
                SelectArrowExample,
                SelectEvents,
                SelectMultiple,
                SelectObjectValues,
                SelectReactiveForms,
                SelectTemplateDrivenForms,
                SelectWithScroll,
                SelectAlignedPosition,
                SelectAlignedPositionWithScroll,
                SelectTypedWrapper,
                SelectItems,
                SelectLabels,
                SelectNativeForms
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

export const Arrow: Story = {
    parameters: source(arrowSource),
    args: { side: 'bottom', align: 'center', alignOffset: 0, dir: 'ltr' },
    render: (args) => ({
        props: args,
        template: html`
            <select-arrow-example [side]="side" [align]="align" [alignOffset]="alignOffset" [dir]="dir" />
        `
    })
};

export const DeferredUnmount: Story = {
    parameters: source(deferredUnmountSource),
    render: () => ({
        template: html`
            <select-deferred-unmount />
        `
    })
};

export const Events: Story = {
    parameters: source(eventsSource),
    render: () => ({
        template: html`
            <select-events />
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

export const ReactiveForms: Story = {
    parameters: source(reactiveFormsSource),
    render: () => ({
        template: html`
            <select-reactive-forms />
        `
    })
};

export const TemplateDrivenForms: Story = {
    parameters: source(templateDrivenFormsSource),
    render: () => ({
        template: html`
            <select-template-driven-forms />
        `
    })
};

export const TypedWrapper: Story = {
    parameters: source(typedWrapperSource),
    render: () => ({
        template: html`
            <select-typed-wrapper />
        `
    })
};

export const Items: Story = {
    parameters: source(itemsSource),
    render: () => ({
        template: html`
            <select-items />
        `
    })
};

export const Labels: Story = {
    parameters: source(labelsSource),
    render: () => ({
        template: html`
            <select-labels />
        `
    })
};

export const NativeForms: Story = {
    parameters: source(nativeFormsSource),
    render: () => ({
        template: html`
            <select-native-forms />
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
    args: { keepMounted: false },
    parameters: source(alignedPositionSource),
    render: (args) => ({
        props: args,
        template: html`
            <select-aligned-position [keepMounted]="keepMounted" />
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
