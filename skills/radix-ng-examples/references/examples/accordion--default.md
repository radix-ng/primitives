# Accordion — Default

> One example from the [Accordion](../components/accordion.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

The preview above uses this standalone component. Copy the setup and shared files below as well.

```typescript
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucidePlus } from '@lucide/angular';
import {
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionPanelDirective,
    RdxAccordionPanelPresenceDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';

@Component({
    host: { class: 'contents' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'rdx-accordion-default-example',
    imports: [
        RdxAccordionHeaderDirective,
        RdxAccordionItemDirective,
        RdxAccordionPanelPresenceDirective,
        RdxAccordionPanelDirective,
        RdxAccordionRootDirective,
        RdxAccordionTriggerDirective,
        LucidePlus
    ],
    template: `
        <div
            class="border-border text-foreground flex w-80 max-w-full flex-col border"
            [disabled]="disabled()"
            [multiple]="multiple()"
            rdxAccordionRoot
        >
            @for (item of items; track item.id) {
                <div class="border-border not-first:border-t" [value]="item.id" rdxAccordionItem>
                    <h3 rdxAccordionHeader>
                        <button
                            class="hover:not-data-disabled:bg-muted focus-visible:outline-ring group flex w-full items-center justify-between gap-4 bg-transparent px-3 py-2 text-start text-sm font-normal select-none focus-visible:relative focus-visible:z-1 focus-visible:outline-2"
                            type="button"
                            rdxAccordionTrigger
                        >
                            {{ item.question }}
                            <svg
                                class="shrink-0 transition-transform duration-100 ease-out group-data-panel-open:rotate-45"
                                aria-hidden="true"
                                lucidePlus
                                size="16"
                            />
                        </button>
                    </h3>
                    <div
                        class="h-(--accordion-panel-height) overflow-hidden text-sm transition-[height] duration-150 ease-out data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none"
                        *rdxAccordionPanelPresence
                        rdxAccordionPanel
                    >
                        <div class="px-3 py-2">{{ item.answer }}</div>
                    </div>
                </div>
            }
        </div>
    `
})
export class AccordionDefaultStory {
    readonly disabled = input(false);
    readonly multiple = input(false);

    protected readonly items = [
        {
            id: 'about',
            question: 'What is Radix NG?',
            answer: 'Radix NG provides unstyled Angular primitives for design systems and web apps.'
        },
        {
            id: 'start',
            question: 'How do I get started?',
            answer: 'Install the primitives and compose them using standalone Angular imports.'
        },
        {
            id: 'license',
            question: 'Can I use it for my project?',
            answer: 'Yes. Radix NG is free and open source.'
        }
    ];
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
