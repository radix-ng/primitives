import { Component, ViewEncapsulation } from '@angular/core';
import {
    RdxAccordionContentDirective,
    RdxAccordionContentPresenceDirective,
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';

@Component({
    selector: 'rdx-accordion-story',
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionContentDirective,
        RdxAccordionContentPresenceDirective
    ],
    encapsulation: ViewEncapsulation.None,
    styles: `
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
            background-color: transparent;
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

        .AccordionContent[data-state='open'] {
            animation: slideDown 300ms cubic-bezier(0.87, 0, 0.13, 1);
        }

        .AccordionContent[data-state='closed'] {
            animation: slideUp 300ms cubic-bezier(0.87, 0, 0.13, 1);
        }

        .AccordionContentText {
            padding: 15px 20px;
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
    `,
    template: `
        <div class="AccordionRoot" [defaultValue]="'item-1'" rdxAccordionRoot>
            <div class="AccordionItem" [value]="'item-1'" rdxAccordionItem>
                <h3 class="AccordionHeader" rdxAccordionHeader>
                    <button class="AccordionTrigger" type="button" rdxAccordionTrigger>Is it accessible?</button>
                </h3>
                <div class="AccordionContent" rdxAccordionContent>
                    <div class="AccordionContentText">Yes. It adheres to the WAI-ARIA design pattern.</div>
                </div>
            </div>

            <div class="AccordionItem" [value]="'item-2'" disabled rdxAccordionItem>
                <h3 class="AccordionHeader" rdxAccordionHeader>
                    <button class="AccordionTrigger" type="button" rdxAccordionTrigger>Is it unstyled?</button>
                </h3>
                <div class="AccordionContent" rdxAccordionContent>
                    <div class="AccordionContentText">
                        Yes. It's unstyled by default, giving you freedom over the look and feel.
                    </div>
                </div>
            </div>

            <div class="AccordionItem" [value]="'item-3'" rdxAccordionItem>
                <div class="AccordionHeader" rdxAccordionHeader>
                    <button class="AccordionTrigger" type="button" rdxAccordionTrigger>Can it be animated?</button>
                </div>
                <div class="AccordionContent" rdxAccordionContent>
                    <div class="AccordionContentText">Yes! You can animate the Accordion with CSS or JavaScript.</div>
                </div>
            </div>
        </div>
    `
})
export class AccordionStory {}
