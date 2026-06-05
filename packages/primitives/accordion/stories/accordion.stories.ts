import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { cn, demoAccordion } from '../../storybook/styles';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxAccordionContentDirective } from '../src/accordion-content.directive';
import { RdxAccordionHeaderDirective } from '../src/accordion-header.directive';
import { RdxAccordionItemDirective } from '../src/accordion-item.directive';
import { RdxAccordionRootDirective } from '../src/accordion-root.directive';
import { RdxAccordionTriggerDirective } from '../src/accordion-trigger.directive';
import { AccordionCollapsibleExample } from './accordion-collapsible';
import { AccordionCollapsibleArrayExample } from './accordion-collapsible-array';
import { AccordionDisabledExample } from './accordion-disabled';
import { AccordionEventsExample } from './accordion-events';
import { AccordionHorizontalExample } from './accordion-horizontal';
import { AccordionKeepMountedExample } from './accordion-keep-mounted';
import { AccordionMultipleExample } from './accordion-multiple';

import collapsibleArraySource from './accordion-collapsible-array?raw';
import collapsibleSource from './accordion-collapsible?raw';
import disabledSource from './accordion-disabled?raw';
import eventsSource from './accordion-events?raw';
import horizontalSource from './accordion-horizontal?raw';
import keepMountedSource from './accordion-keep-mounted?raw';
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
                RdxAccordionRootDirective,
                RdxAccordionItemDirective,
                RdxAccordionHeaderDirective,
                RdxAccordionTriggerDirective,
                RdxAccordionContentDirective,
                AccordionDisabledExample,
                AccordionMultipleExample,
                AccordionCollapsibleExample,
                AccordionCollapsibleArrayExample,
                AccordionHorizontalExample,
                AccordionEventsExample,
                AccordionKeepMountedExample
            ]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    args: {
        disabled: false,
        collapsible: false
    },
    render: (args) => ({
        props: { ...args, cn, a: demoAccordion },
        template: html`
            <div [class]="cn(a.root, 'w-[300px]')" [defaultValue]="'item-1'" ${argsToTemplate(args)} rdxAccordionRoot>
                <div [class]="a.item" [value]="'item-1'" rdxAccordionItem>
                    <h3 [class]="a.header" rdxAccordionHeader>
                        <button [class]="a.trigger" type="button" rdxAccordionTrigger>Is it accessible?</button>
                    </h3>
                    <div [class]="a.content" rdxAccordionContent>
                        <div [class]="a.contentText">Yes. It adheres to the WAI-ARIA design pattern.</div>
                    </div>
                </div>
                <div [class]="a.item" [value]="'item-2'" rdxAccordionItem>
                    <h3 [class]="a.header" rdxAccordionHeader>
                        <button [class]="a.trigger" type="button" rdxAccordionTrigger>Is it unstyled?</button>
                    </h3>
                    <div [class]="a.content" rdxAccordionContent>
                        <div [class]="a.contentText">
                            Yes. It's unstyled by default, giving you freedom over the look and feel.
                        </div>
                    </div>
                </div>
                <div [class]="a.item" [value]="'item-3'" rdxAccordionItem>
                    <h3 [class]="a.header" rdxAccordionHeader>
                        <button [class]="a.trigger" type="button" rdxAccordionTrigger>Can it be animated?</button>
                    </h3>
                    <div [class]="a.content" rdxAccordionContent>
                        <div [class]="a.contentText">Yes! You can animate the Accordion with CSS or JavaScript.</div>
                    </div>
                </div>
            </div>
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
