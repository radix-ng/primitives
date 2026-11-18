import { Component } from '@angular/core';
import {
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionPanelDirective,
    RdxAccordionPanelPresenceDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';

@Component({
    selector: 'accordion-panel-lifetime-example',
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective,
        RdxAccordionPanelPresenceDirective
    ],
    template: `
        <div class="flex w-[320px] flex-col gap-3">
            <p class="text-muted-foreground text-sm">
                Edit each field, then close and reopen its panel to compare state retention.
            </p>
            <div class="demo-accordion-root overflow-hidden" rdxAccordionRoot multiple>
                @for (retained of [false, true]; track retained) {
                    <div
                        class="border-border focus-within:ring-ring overflow-hidden border-b last:border-b-0 focus-within:relative focus-within:z-[1] focus-within:ring-2 focus-within:outline-none focus-within:ring-inset"
                        [value]="retained"
                        rdxAccordionItem
                    >
                        <h3 class="flex" rdxAccordionHeader>
                            <button
                                class="demo-accordion-trigger flex h-12 w-full flex-1 items-center justify-between px-5 aria-disabled:opacity-60"
                                rdxAccordionTrigger
                            >
                                {{ retained ? 'Keep state' : 'Reset state' }}
                            </button>
                        </h3>
                        <div
                            class="demo-accordion-content [&[data-open][data-orientation=vertical]]:animate-accordion-down [&:not([data-open])[data-orientation=vertical]]:animate-accordion-up [&[data-open][data-orientation=horizontal]]:animate-accordion-right [&:not([data-open])[data-orientation=horizontal]]:animate-accordion-left overflow-hidden [&:not([data-open])[data-orientation=horizontal]]:w-0 [&:not([data-open])[data-orientation=vertical]]:h-0"
                            *rdxAccordionPanelPresence="{ keepMounted: retained }"
                            rdxAccordionPanel
                        >
                            <div class="px-5 py-4">
                                <label
                                    class="flex flex-col gap-2"
                                    [for]="retained ? 'accordion-retained-input' : 'accordion-fresh-input'"
                                >
                                    {{ retained ? 'Retained field' : 'Fresh field' }}
                                    <input
                                        class="border-border bg-background text-foreground rounded border px-3 py-2"
                                        [id]="retained ? 'accordion-retained-input' : 'accordion-fresh-input'"
                                        value="initial"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </div>
    `
})
export class AccordionPanelLifetimeExample {}
