import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { RdxAccordionContentDirective } from '../src/accordion-content.directive';
import { RdxAccordionHeaderDirective } from '../src/accordion-header.directive';
import { RdxAccordionItemDirective } from '../src/accordion-item.directive';
import { RdxAccordionRootDirective } from '../src/accordion-root.directive';
import { RdxAccordionTriggerDirective } from '../src/accordion-trigger.directive';
import { AccordionHorizontalStory, AccordionMultipleStory, AccordionStory } from './accordion';

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
                BrowserAnimationsModule,
                AccordionStory,
                AccordionMultipleStory,
                AccordionHorizontalStory
            ],
            providers: [provideAnimations()]
        }),
        componentWrapperDecorator(
            (story) => html`
                <div
                    class="radix-themes light light-theme radix-themes-default-fonts"
                    data-accent-color="indigo"
                    data-radius="medium"
                    data-scaling="100%"
                >
                    ${story}
                </div>
            `
        )
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: html`
            <rdx-accordion-story />
        `
    })
};

export const Multiple: Story = {
    render: () => ({
        template: html`
            <rdx-accordion-multiple-story />
        `
    })
};

export const Horizontal: Story = {
    render: () => ({
        template: html`
            <rdx-accordion-horizontal-story />
        `
    })
};
