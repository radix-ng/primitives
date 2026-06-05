import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { AccordionCollapsibleExample } from './accordion-collapsible';
import { AccordionCollapsibleArrayExample } from './accordion-collapsible-array';
import { AccordionDefaultExample } from './accordion-default';
import { AccordionDisabledExample } from './accordion-disabled';
import { AccordionHorizontalExample } from './accordion-horizontal';
import { AccordionMultipleExample } from './accordion-multiple';

import collapsibleArraySource from './accordion-collapsible-array?raw';
import collapsibleSource from './accordion-collapsible?raw';
import defaultSource from './accordion-default?raw';
import disabledSource from './accordion-disabled?raw';
import horizontalSource from './accordion-horizontal?raw';
import multipleSource from './accordion-multiple?raw';

const source = (code: string) => ({
    docs: { source: { code: code.trim(), language: 'typescript', type: 'code' } }
});

const html = String.raw;

export default {
    title: 'Primitives/Accordion',
    decorators: [
        moduleMetadata({
            imports: [
                AccordionDefaultExample,
                AccordionMultipleExample,
                AccordionDisabledExample,
                AccordionCollapsibleExample,
                AccordionCollapsibleArrayExample,
                AccordionHorizontalExample
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
            <accordion-default-example />
        `
    })
};

export const Multiple: Story = {
    parameters: source(multipleSource),
    render: () => ({
        template: html`
            <accordion-multiple-example />
        `
    })
};

export const Disabled: Story = {
    parameters: source(disabledSource),
    render: () => ({
        template: html`
            <accordion-disabled-example />
        `
    })
};

export const Collapsible: Story = {
    parameters: source(collapsibleSource),
    render: () => ({
        template: html`
            <accordion-collapsible-example />
        `
    })
};

export const CollapsibleArray: Story = {
    parameters: source(collapsibleArraySource),
    render: () => ({
        template: html`
            <accordion-collapsible-array-example />
        `
    })
};

export const Horizontal: Story = {
    parameters: source(horizontalSource),
    render: () => ({
        template: html`
            <accordion-horizontal-example />
        `
    })
};
