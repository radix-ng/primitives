import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { ChevronDown, LucideAngularModule } from 'lucide-angular';
import { RdxAccordionContentDirective } from '../src/accordion-content.directive';
import { RdxAccordionHeaderDirective } from '../src/accordion-header.directive';
import { RdxAccordionItemDirective } from '../src/accordion-item.directive';
import { RdxAccordionRootDirective } from '../src/accordion-root.directive';
import { RdxAccordionTriggerDirective } from '../src/accordion-trigger.directive';

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
                LucideAngularModule.pick({ ChevronDown })
            ],
            providers: [provideAnimations()]
        }),
        componentWrapperDecorator(
            (story) => `
                <div class="radix-themes light light-theme radix-themes-default-fonts"
                    data-accent-color="indigo"
                    data-radius="medium"
                    data-scaling="100%"
                >
                    ${story}
                </div>

                <style>
                    /* reset */
                    button,
                    h3 {
                        all: unset;
                    }

                    .AccordionRoot {
                        border-radius: 6px;
                        background-color: var(--mauve-6);
                        box-shadow: 0 2px 10px var(--black-a4);
                    }

                    .AccordionRoot[data-orientation="vertical"] {
                        width: 300px;
                    }

                    .AccordionRoot[data-orientation="horizontal"] {
                        height: 300px;

                        display: flex;
                        flex-direction: row;
                    }

                    .AccordionItem {
                        overflow: hidden;
                        margin-top: 1px;
                    }

                    .AccordionItem[data-orientation="horizontal"] {
                        display: flex;
                    }

                    .AccordionItem[data-orientation="vertical"]:first-child {
                        margin-top: 0;
                        border-top-left-radius: 4px;
                        border-top-right-radius: 4px;
                    }

                    .AccordionItem[data-orientation="vertical"]:last-child {
                        border-bottom-left-radius: 4px;
                        border-bottom-right-radius: 4px;
                    }

                    .AccordionItem[data-orientation="horizontal"]:first-child {
                        margin-top: 0;
                        border-top-left-radius: 4px;
                        border-bottom-left-radius: 4px;
                    }

                    .AccordionItem[data-orientation="horizontal"]:last-child {
                        border-top-right-radius: 4px;
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
                        cursor: default;
                    }

                    .AccordionTrigger[data-orientation="horizontal"] {
                        height: 100%;
                        padding: 20px;
                        writing-mode: vertical-rl;
                    }

                    .AccordionTrigger[data-disabled="true"] {
                        color: var(--gray-7);
                    }

                    .AccordionTrigger:hover {
                        background-color: var(--mauve-2);
                    }

                    .AccordionContent {
                        display: flex;
                        overflow: hidden;
                        font-size: 15px;
                        color: var(--mauve-11);
                        background-color: var(--mauve-2);
                    }
                    .AccordionContent[data-orientation='vertical'][data-state='open'] {
                        animation: slideDown 300ms cubic-bezier(0.87, 0, 0.13, 1);
                    }
                    .AccordionContent[data-orientation='vertical'][data-state='closed'] {
                        animation: slideUp 300ms cubic-bezier(0.87, 0, 0.13, 1);
                    }

                    .AccordionContent[data-orientation='horizontal'][data-state='open'] {
                        animation: slideRight 300ms cubic-bezier(0.87, 0, 0.13, 1);
                    }
                    .AccordionContent[data-orientation='horizontal'][data-state='closed'] {
                        animation: slideLeft 300ms cubic-bezier(0.87, 0, 0.13, 1);
                    }

                    .AccordionContentText {
                        padding: 15px 20px;
                    }

                    .AccordionChevron {
                        display: flex;
                        color: var(--violet-10);
                        transition: transform 300ms cubic-bezier(0.87, 0, 0.13, 1);
                    }
                    .AccordionTrigger[data-state='open'] > .AccordionChevron {
                        transform: rotate(180deg);
                    }

                    .horizontal-flex-container {
                        display: flex;
                    }

                    @keyframes slideDown {
                        from {
                            height: 0;
                        }
                        to {
                            height: var(--radix-accordion-content-height);
                        }
                    }

                    @keyframes slideUp {
                        from {
                            height: var(--radix-accordion-content-height);
                        }
                        to {
                            height: 0;
                        }
                    }

                    @keyframes slideRight {
                        from {
                            width: 0;
                        }
                        to {
                            width: var(--radix-accordion-content-width);
                        }
                    }

                    @keyframes slideLeft {
                        from {
                            width: var(--radix-accordion-content-width);
                        }
                        to {
                            width: 0;
                        }
                    }
                </style>`
        )
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: `
            <div class="AccordionRoot" rdxAccordionRoot [defaultValue]="'item-1'">
                <div [value]="'item-1'" class="AccordionItem" rdxAccordionItem>
                    <div class="AccordionHeader" rdxAccordionHeader>
                        <button class="AccordionTrigger" type="button" rdxAccordionTrigger>Is it accessible?
                            <lucide-icon class="AccordionChevron" aria-hidden size="16" name="chevron-down"/>
                        </button>
                    </div>
                    <div class="AccordionContent" rdxAccordionContent>
                        <div class="AccordionContentText">
                            Yes. It adheres to the WAI-ARIA design pattern.
                        </div>
                    </div>
                </div>

                <div [value]="'item-2'" class="AccordionItem" rdxAccordionItem [disabled]="true">
                    <div class="AccordionHeader" rdxAccordionHeader>
                        <button class="AccordionTrigger" type="button" rdxAccordionTrigger>Is it unstyled?
                            <lucide-icon class="AccordionChevron" aria-hidden size="16" name="chevron-down"/>
                        </button>
                    </div>
                    <div class="AccordionContent" rdxAccordionContent>
                        <div class="AccordionContentText">
                            Yes. It's unstyled by default, giving you freedom over the look and feel.
                        </div>
                    </div>
                </div>

                <div [value]="'item-3'" class="AccordionItem" rdxAccordionItem>
                    <div class="AccordionHeader" rdxAccordionHeader>
                        <button class="AccordionTrigger" type="button" rdxAccordionTrigger>Can it be animated?
                            <lucide-icon class="AccordionChevron" aria-hidden size="16" name="chevron-down"/>
                        </button>
                    </div>
                    <div class="AccordionContent" rdxAccordionContent>
                        <div class="AccordionContentText">
                            Yes! You can animate the Accordion with CSS or JavaScript.
                        </div>
                    </div>
                </div>
            </div>
        `
    })
};

export const Multiple: Story = {
    render: () => ({
        template: `
            <div class="AccordionRoot" rdxAccordionRoot [value]="['item-2', 'item-3']" [type]="'multiple'">
                <div [value]="'item-1'" class="AccordionItem" rdxAccordionItem>
                    <div class="AccordionHeader" rdxAccordionHeader>
                        <button class="AccordionTrigger" type="button" rdxAccordionTrigger>Is it accessible?</button>
                    </div>
                    <div class="AccordionContent" rdxAccordionContent >
                        <div class="AccordionContentText">
                            Yes. It adheres to the WAI-ARIA design pattern.
                        </div>
                    </div>
                </div>

                <div [value]="'item-2'" class="AccordionItem" rdxAccordionItem>
                    <div class="AccordionHeader" rdxAccordionHeader>
                        <button class="AccordionTrigger" type="button" rdxAccordionTrigger>Is it unstyled?</button>
                    </div>
                    <div class="AccordionContent" rdxAccordionContent>
                        <div class="AccordionContentText">
                            Yes. It's unstyled by default, giving you freedom over the look and feel.
                        </div>
                    </div>
                </div>

                <div [value]="'item-3'" class="AccordionItem" rdxAccordionItem>
                    <div class="AccordionHeader" rdxAccordionHeader>
                        <button class="AccordionTrigger" type="button" rdxAccordionTrigger>Can it be animated?</button>
                    </div>
                    <div class="AccordionContent" rdxAccordionContent>
                        <div class="AccordionContentText">
                            Yes! You can animate the Accordion with CSS or JavaScript.
                        </div>
                    </div>
                </div>
            </div>
        `
    })
};

export const Horizontal: Story = {
    render: () => ({
        template: `
            <div class="horizontal-flex-container">
                <div class="AccordionRoot" rdxAccordionRoot [defaultValue]="'item-1'" [orientation]="'horizontal'">
                    <div [value]="'item-1'" class="AccordionItem" rdxAccordionItem>
                        <div class="AccordionHeader" rdxAccordionHeader>
                            <button class="AccordionTrigger" type="button" rdxAccordionTrigger>Is it accessible?</button>
                        </div>
                        <div class="AccordionContent" rdxAccordionContent>
                            <div class="AccordionContentText">
                                Yes. It adheres to the WAI-ARIA design pattern.
                            </div>
                        </div>
                    </div>

                    <div [value]="'item-2'" class="AccordionItem" rdxAccordionItem [disabled]="true">
                        <div class="AccordionHeader" rdxAccordionHeader>
                            <button class="AccordionTrigger" type="button" rdxAccordionTrigger>Is it unstyled?</button>
                        </div>
                        <div class="AccordionContent" rdxAccordionContent>
                            <div class="AccordionContentText">
                                Yes. It's unstyled by default, giving you freedom over the look and feel.
                            </div>
                        </div>
                    </div>

                    <div [value]="'item-3'" class="AccordionItem" rdxAccordionItem>
                        <div class="AccordionHeader" rdxAccordionHeader>
                            <button class="AccordionTrigger" type="button" rdxAccordionTrigger>Can it be animated?</button>
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
