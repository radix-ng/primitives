import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { ChevronDown, LucideAngularModule } from 'lucide-angular';
import { RdxAccordionContentDirective } from '../src/accordion-content.directive';
import { RdxAccordionHeaderDirective } from '../src/accordion-header.directive';
import { RdxAccordionItemDirective } from '../src/accordion-item.directive';
import { RdxAccordionRootDirective } from '../src/accordion-root.directive';
import { RdxAccordionTriggerDirective } from '../src/accordion-trigger.directive';
import { AccordionMultipleStory, AccordionStory } from './accordion';

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
                LucideAngularModule,
                LucideAngularModule.pick({ ChevronDown }),
                AccordionStory,
                AccordionMultipleStory
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
            <div class="horizontal-flex-container">
                <div class="AccordionRoot" rdxAccordionRoot [defaultValue]="'item-1'" [orientation]="'horizontal'">
                    <div class="AccordionItem" [value]="'item-1'" rdxAccordionItem>
                        <div class="AccordionHeader" rdxAccordionHeader>
                            <button class="AccordionTrigger" type="button" rdxAccordionTrigger>
                                Is it accessible?
                            </button>
                        </div>
                        <div class="AccordionContent" rdxAccordionContent>
                            <div class="AccordionContentText">Yes. It adheres to the WAI-ARIA design pattern.</div>
                        </div>
                    </div>

                    <div class="AccordionItem" [value]="'item-2'" rdxAccordionItem [disabled]="true">
                        <div class="AccordionHeader" rdxAccordionHeader>
                            <button class="AccordionTrigger" type="button" rdxAccordionTrigger>Is it unstyled?</button>
                        </div>
                        <div class="AccordionContent" rdxAccordionContent>
                            <div class="AccordionContentText">
                                Yes. It's unstyled by default, giving you freedom over the look and feel.
                            </div>
                        </div>
                    </div>

                    <div class="AccordionItem" [value]="'item-3'" rdxAccordionItem>
                        <div class="AccordionHeader" rdxAccordionHeader>
                            <button class="AccordionTrigger" type="button" rdxAccordionTrigger>
                                Can it be animated?
                            </button>
                        </div>
                        <div class="AccordionContent" rdxAccordionContent>
                            <div class="AccordionContentText">
                                Yes! You can animate the Accordion with CSS or JavaScript.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    })
};
