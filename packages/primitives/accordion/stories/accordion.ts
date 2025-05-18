import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxAccordionContentDirective,
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
        RdxAccordionContentDirective
    ],
    styleUrl: 'styles.css',
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

            <div class="AccordionItem" [value]="'item-2'" rdxAccordionItem>
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

@Component({
    selector: 'rdx-accordion-multiple-story',
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionContentDirective
    ],
    styleUrl: 'styles.css',
    template: `
        <div class="AccordionRoot" [value]="['item-2', 'item-3']" type="multiple" rdxAccordionRoot>
            <div class="AccordionItem" [value]="'item-1'" rdxAccordionItem>
                <h3 class="AccordionHeader" rdxAccordionHeader>
                    <button class="AccordionTrigger" type="button" rdxAccordionTrigger>Is it accessible?</button>
                </h3>
                <div class="AccordionContent" rdxAccordionContent>
                    <div class="AccordionContentText">Yes. It adheres to the WAI-ARIA design pattern.</div>
                </div>
            </div>

            <div class="AccordionItem" [value]="'item-2'" rdxAccordionItem>
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
export class AccordionMultipleStory {}

@Component({
    selector: 'rdx-accordion-disabled-story',
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionContentDirective
    ],
    styleUrl: 'styles.css',
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
export class AccordionDisabledStory {}

@Component({
    selector: 'rdx-accordion-collapsible-story',
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionContentDirective
    ],
    styleUrl: 'styles.css',
    template: `
        <div class="AccordionRoot" [defaultValue]="'item-1'" collapsible rdxAccordionRoot>
            <div class="AccordionItem" [value]="'item-1'" rdxAccordionItem>
                <h3 class="AccordionHeader" rdxAccordionHeader>
                    <button class="AccordionTrigger" type="button" rdxAccordionTrigger>Is it accessible?</button>
                </h3>
                <div class="AccordionContent" rdxAccordionContent>
                    <div class="AccordionContentText">Yes. It adheres to the WAI-ARIA design pattern.</div>
                </div>
            </div>

            <div class="AccordionItem" [value]="'item-2'" rdxAccordionItem>
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
export class AccordionCollapsibleStory {}

@Component({
    selector: 'rdx-accordion-collapsible-array-story',
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionContentDirective
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: 'styles.css',
    template: `
        <div class="AccordionRoot" [defaultValue]="'item-1'" collapsible rdxAccordionRoot>
            @for (item of items; track item.id) {
                <div class="AccordionItem" [value]="item.id" rdxAccordionItem>
                    <h3 class="AccordionHeader" rdxAccordionHeader>
                        <button class="AccordionTrigger" type="button" rdxAccordionTrigger>{{ item.title }}</button>
                    </h3>
                    <div class="AccordionContent" rdxAccordionContent>
                        <div class="AccordionContentText">{{ item.content }}</div>
                    </div>
                </div>
            }
        </div>
    `
})
export class AccordionCollapsibleArrayStory {
    readonly items = [
        {
            id: 'item-1',
            title: 'Is it accessible?',
            content: 'Yes. It adheres to the WAI-ARIA design pattern.'
        },
        {
            id: 'item-2',
            title: 'Is it unstyled?',
            content: "Yes. It's unstyled by default, giving you freedom over the look and feel."
        },
        {
            id: 'item-3',
            title: 'Can it be animated?',
            content: 'Yes! You can animate the Accordion with CSS or JavaScript.'
        }
    ];
}

@Component({
    selector: 'rdx-accordion-horizontal-story',
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionContentDirective
    ],
    styleUrl: 'styles.css',
    template: `
        <div class="horizontal-flex-container">
            <div class="AccordionRoot" [defaultValue]="'item-1'" [orientation]="'horizontal'" rdxAccordionRoot>
                <div class="AccordionItem" [value]="'item-1'" rdxAccordionItem>
                    <div class="AccordionHeader" rdxAccordionHeader>
                        <button class="AccordionTrigger" type="button" rdxAccordionTrigger>Is it accessible?</button>
                    </div>
                    <div class="AccordionContent" rdxAccordionContent>
                        <div class="AccordionContentText">Yes. It adheres to the WAI-ARIA design pattern.</div>
                    </div>
                </div>

                <div class="AccordionItem" [value]="'item-2'" [disabled]="true" rdxAccordionItem>
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
export class AccordionHorizontalStory {}
