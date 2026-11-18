import {
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionPanelDirective,
    RdxAccordionPanelPresenceDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { AccordionDefaultStory } from './accordion-default-example';
import defaultPortableSource from './accordion-default-example?raw';

import { AccordionCollapsibleExample } from './accordion-collapsible';
import { AccordionCollapsibleArrayExample } from './accordion-collapsible-array';
import { AccordionControlledExample } from './accordion-controlled';
import { AccordionDisabledExample } from './accordion-disabled';
import { AccordionEventsExample } from './accordion-events';
import { AccordionHorizontalExample } from './accordion-horizontal';
import { AccordionKeepMountedExample } from './accordion-keep-mounted';
import { AccordionMotionExample } from './accordion-motion';
import { AccordionMultipleExample } from './accordion-multiple';
import { AccordionPanelLifetimeExample } from './accordion-panel-lifetime';

import collapsibleArraySource from './accordion-collapsible-array?raw';
import collapsibleSource from './accordion-collapsible?raw';
import controlledSource from './accordion-controlled?raw';
import disabledSource from './accordion-disabled?raw';
import eventsSource from './accordion-events?raw';
import horizontalSource from './accordion-horizontal?raw';
import keepMountedSource from './accordion-keep-mounted?raw';
import motionSource from './accordion-motion?raw';
import multipleSource from './accordion-multiple?raw';
import panelLifetimeSource from './accordion-panel-lifetime?raw';

const source = (code: string) => ({
    docs: { source: { code: code.trim(), language: 'typescript', type: 'code' } }
});

const html = String.raw;

export default {
    title: 'Primitives/Accordion',
    decorators: [
        moduleMetadata({
            imports: [
                AccordionDefaultStory,
                RdxAccordionRootDirective,
                RdxAccordionItemDirective,
                RdxAccordionHeaderDirective,
                RdxAccordionTriggerDirective,
                RdxAccordionPanelDirective,
                RdxAccordionPanelPresenceDirective,
                AccordionDisabledExample,
                AccordionMultipleExample,
                AccordionMotionExample,
                AccordionPanelLifetimeExample,
                AccordionCollapsibleExample,
                AccordionCollapsibleArrayExample,
                AccordionHorizontalExample,
                AccordionEventsExample,
                AccordionControlledExample,
                AccordionKeepMountedExample
            ]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    parameters: source(defaultPortableSource),
    args: {
        disabled: false,
        multiple: false
    },
    render: (args) => ({
        props: { ...args },
        template: html`
            <rdx-accordion-default-example [disabled]="disabled" [multiple]="multiple" />
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

export const Multiple: Story = {
    parameters: source(multipleSource),
    render: () => ({
        template: html`
            <accordion-multiple-example />
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

export const Events: Story = {
    parameters: source(eventsSource),
    render: () => ({
        template: html`
            <accordion-events-example />
        `
    })
};

export const KeepMounted: Story = {
    parameters: source(keepMountedSource),
    render: () => ({
        template: html`
            <accordion-keep-mounted-example />
        `
    })
};

export const Controlled: Story = {
    parameters: source(controlledSource),
    render: () => ({
        template: html`
            <accordion-controlled-example />
        `
    })
};

export const PanelLifetime: Story = {
    parameters: source(panelLifetimeSource),
    render: () => ({
        template: html`
            <accordion-panel-lifetime-example />
        `
    })
};

export const Motion: Story = {
    parameters: source(motionSource),
    render: () => ({
        template: html`
            <accordion-motion-example />
        `
    })
};
