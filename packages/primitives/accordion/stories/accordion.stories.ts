import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { radixChevronDown } from '@ng-icons/radix-icons';
import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { RdxAccordionContentDirective } from '../src/accordion-content/accordion-content.directive';
import { RdxAccordionHeaderDirective } from '../src/accordion-header/accordion-header.directive';
import { RdxAccordionItemDirective } from '../src/accordion-item/accordion-item.directive';
import { RdxAccordionTriggerDirective } from '../src/accordion-trigger/accordion-trigger.directive';
import { RdxAccordionDirective } from '../src/accordion/accordion.directive';

export default {
    title: 'Primitives/Accordion',
    decorators: [
        moduleMetadata({
            imports: [
                NgIconComponent,
                RdxAccordionDirective,
                RdxAccordionItemDirective,
                RdxAccordionContentDirective,
                RdxAccordionHeaderDirective,
                RdxAccordionTriggerDirective
            ],
            providers: [provideIcons({ radixChevronDown })]
        }),
        componentWrapperDecorator(
            (story) =>
                `<div class="radix-themes light light-theme"
                      data-radius="medium"
                      data-scaling="100%">${story}</div>`
        )
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: `

<style>
/* reset */
button,
h3 {
  all: unset;
}

.AccordionRoot {
  border-radius: 6px;
  width: 300px;
  background-color: var(--mauve-6);
  box-shadow: 0 2px 10px var(--black-a4);
}

.AccordionItem {
  overflow: hidden;
  margin-top: 1px;
}

.AccordionItem:first-child {
  margin-top: 0;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.AccordionItem:last-child {
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

.AccordionItem:focus-within {
  position: relative;
  z-index: 1;
  box-shadow: 0 0 0 2px var(--mauve-12);
}

.AccordionHeader {
  display: flex;
}

.AccordionTrigger {
  font-family: inherit;
  padding: 0 20px;
  height: 45px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 15px;
  line-height: 1;
  color: var(--violet-11);
  box-shadow: 0 1px 0 var(--mauve-6);
  background-color: white;
}

.AccordionTrigger:hover {
  background-color: var(--mauve-2);
}

.AccordionContent {
  overflow: hidden;
  font-size: 15px;
  color: var(--mauve-11);
  background-color: var(--mauve-2);
}

.AccordionContentText {
  padding: 15px 20px;
}

.AccordionChevron {
  color: var(--violet-10);
  transition: transform 300ms cubic-bezier(0.87, 0, 0.13, 1);
}
</style>

<div rdxAccordion class="AccordionRoot">
    <div rdxAccordionItem class="AccordionItem">
        <h3 rdxAccordionHeader class="AccordionHeader">
            <button rdxAccordionTrigger class="AccordionTrigger">
                <span>Is it accessible?</span>
                <ng-icon name="radixChevronDown"></ng-icon>
            </button>
        </h3>
        <div rdxAccordionContent class="AccordionContent AccordionContentText">Yes. It adheres to the WAI-ARIA design pattern.</div>
    </div>
    <div rdxAccordionItem class="AccordionItem">
        <h3 rdxAccordionHeader class="AccordionHeader">
            <button rdxAccordionTrigger class="AccordionTrigger">
                <span>Is it unstyled?</span>
                <ng-icon name="radixChevronDown"></ng-icon>
            </button>
        </h3>
        <div rdxAccordionContent class="AccordionContent AccordionContentText">Yes. It's unstyled by default, giving you freedom over the look and feel.</div>
    </div>
    <div rdxAccordionItem class="AccordionItem">
        <h3 rdxAccordionHeader class="AccordionHeader">
            <button rdxAccordionTrigger class="AccordionTrigger">
                <span>Can it be animated?</span>
                <ng-icon name="radixChevronDown"></ng-icon>
            </button>
        </h3>
        <div rdxAccordionContent class="AccordionContent AccordionContentText">Yes! You can animate the Accordion with CSS or JavaScript.</div>
    </div>
</div>
`
    })
};
