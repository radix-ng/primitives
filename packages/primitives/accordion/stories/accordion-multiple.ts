import { ChangeDetectionStrategy, Component } from '@angular/core';
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
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'accordion-multiple-example',
    imports: [
        LucidePlus,
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective,
        RdxAccordionPanelPresenceDirective
    ],
    template: `
        <div
            class="demo-accordion-root w-80 max-w-full"
            [defaultValue]="['item-2', 'item-3']"
            multiple
            rdxAccordionRoot
        >
            <div class="border-foreground border-b last:border-b-0" [value]="'item-1'" rdxAccordionItem>
                <h3 class="flex" rdxAccordionHeader>
                    <button
                        class="demo-accordion-trigger group flex min-h-9 w-full flex-1 items-center justify-between gap-4 px-3 py-2 text-start aria-disabled:opacity-60"
                        type="button"
                        rdxAccordionTrigger
                    >
                        Is it accessible?
                        <svg
                            class="shrink-0 group-data-panel-open:rotate-45 motion-safe:transition-transform motion-safe:duration-100"
                            lucidePlus
                            size="16"
                            aria-hidden="true"
                        ></svg>
                    </button>
                </h3>
                <div
                    class="demo-accordion-content h-(--accordion-panel-height) overflow-hidden data-ending-style:h-0 data-starting-style:h-0 motion-safe:transition-[height] motion-safe:duration-150 motion-safe:ease-out"
                    *rdxAccordionPanelPresence
                    rdxAccordionPanel
                >
                    <div class="px-3 pt-1 pb-3">Yes. It adheres to the WAI-ARIA design pattern.</div>
                </div>
            </div>

            <div class="border-foreground border-b last:border-b-0" [value]="'item-2'" rdxAccordionItem>
                <h3 class="flex" rdxAccordionHeader>
                    <button
                        class="demo-accordion-trigger group flex min-h-9 w-full flex-1 items-center justify-between gap-4 px-3 py-2 text-start aria-disabled:opacity-60"
                        type="button"
                        rdxAccordionTrigger
                    >
                        Is it unstyled?
                        <svg
                            class="shrink-0 group-data-panel-open:rotate-45 motion-safe:transition-transform motion-safe:duration-100"
                            lucidePlus
                            size="16"
                            aria-hidden="true"
                        ></svg>
                    </button>
                </h3>
                <div
                    class="demo-accordion-content h-(--accordion-panel-height) overflow-hidden data-ending-style:h-0 data-starting-style:h-0 motion-safe:transition-[height] motion-safe:duration-150 motion-safe:ease-out"
                    *rdxAccordionPanelPresence
                    rdxAccordionPanel
                >
                    <div class="px-3 pt-1 pb-3">
                        Yes. It's unstyled by default, giving you freedom over the look and feel.
                    </div>
                </div>
            </div>

            <div class="border-foreground border-b last:border-b-0" [value]="'item-3'" rdxAccordionItem>
                <h3 class="flex" rdxAccordionHeader>
                    <button
                        class="demo-accordion-trigger group flex min-h-9 w-full flex-1 items-center justify-between gap-4 px-3 py-2 text-start aria-disabled:opacity-60"
                        type="button"
                        rdxAccordionTrigger
                    >
                        Can it be animated?
                        <svg
                            class="shrink-0 group-data-panel-open:rotate-45 motion-safe:transition-transform motion-safe:duration-100"
                            lucidePlus
                            size="16"
                            aria-hidden="true"
                        ></svg>
                    </button>
                </h3>
                <div
                    class="demo-accordion-content h-(--accordion-panel-height) overflow-hidden data-ending-style:h-0 data-starting-style:h-0 motion-safe:transition-[height] motion-safe:duration-150 motion-safe:ease-out"
                    *rdxAccordionPanelPresence
                    rdxAccordionPanel
                >
                    <div class="px-3 pt-1 pb-3">
                        Yes. It's unstyled by default, giving you freedom over the look and feel.
                    </div>
                </div>
            </div>
        </div>
    `
})
export class AccordionMultipleExample {}
