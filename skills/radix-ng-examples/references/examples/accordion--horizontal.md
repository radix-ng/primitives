# Accordion — Horizontal

> One example from the [Accordion](../components/accordion.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

Set `orientation="horizontal"` to expose horizontal state for styling. Following the APG guidance update adopted by Base UI, orientation no longer changes keyboard focus behavior.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
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
    selector: 'accordion-horizontal-example',
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective,
        RdxAccordionPanelPresenceDirective
    ],
    template: `
        <div
            class="demo-accordion-root flex h-[300px] flex-row overflow-hidden"
            [defaultValue]="['item-1']"
            [orientation]="'horizontal'"
            rdxAccordionRoot
        >
            <div
                class="border-border focus-within:ring-ring demo-accordion-item-h flex overflow-hidden border-b last:border-r-0 last:border-b-0 focus-within:relative focus-within:z-[1] focus-within:ring-2 focus-within:outline-none focus-within:ring-inset"
                [value]="'item-1'"
                rdxAccordionItem
            >
                <div class="flex" rdxAccordionHeader>
                    <button
                        class="demo-accordion-trigger flex h-12 h-full w-full flex-1 items-center justify-between px-0 px-5 py-5 [writing-mode:vertical-rl] aria-disabled:opacity-60"
                        type="button"
                        rdxAccordionTrigger
                    >
                        Is it accessible?
                    </button>
                </div>
                <div
                    class="demo-accordion-content [&[data-open][data-orientation=vertical]]:animate-accordion-down [&:not([data-open])[data-orientation=vertical]]:animate-accordion-up [&[data-open][data-orientation=horizontal]]:animate-accordion-right [&:not([data-open])[data-orientation=horizontal]]:animate-accordion-left overflow-hidden [&:not([data-open])[data-orientation=horizontal]]:w-0 [&:not([data-open])[data-orientation=vertical]]:h-0"
                    *rdxAccordionPanelPresence
                    rdxAccordionPanel
                >
                    <div class="w-80 px-5 py-4">Yes. It adheres to the WAI-ARIA design pattern.</div>
                </div>
            </div>

            <div
                class="border-border focus-within:ring-ring demo-accordion-item-h flex overflow-hidden border-b last:border-r-0 last:border-b-0 focus-within:relative focus-within:z-[1] focus-within:ring-2 focus-within:outline-none focus-within:ring-inset"
                [value]="'item-2'"
                [disabled]="true"
                rdxAccordionItem
            >
                <div class="flex" rdxAccordionHeader>
                    <button
                        class="demo-accordion-trigger flex h-12 h-full w-full flex-1 items-center justify-between px-0 px-5 py-5 [writing-mode:vertical-rl] aria-disabled:opacity-60"
                        type="button"
                        rdxAccordionTrigger
                    >
                        Is it unstyled?
                    </button>
                </div>
                <div
                    class="demo-accordion-content [&[data-open][data-orientation=vertical]]:animate-accordion-down [&:not([data-open])[data-orientation=vertical]]:animate-accordion-up [&[data-open][data-orientation=horizontal]]:animate-accordion-right [&:not([data-open])[data-orientation=horizontal]]:animate-accordion-left overflow-hidden [&:not([data-open])[data-orientation=horizontal]]:w-0 [&:not([data-open])[data-orientation=vertical]]:h-0"
                    *rdxAccordionPanelPresence
                    rdxAccordionPanel
                >
                    <div class="w-80 px-5 py-4">
                        Yes. It's unstyled by default, giving you freedom over the look and feel.
                    </div>
                </div>
            </div>

            <div
                class="border-border focus-within:ring-ring demo-accordion-item-h flex overflow-hidden border-b last:border-r-0 last:border-b-0 focus-within:relative focus-within:z-[1] focus-within:ring-2 focus-within:outline-none focus-within:ring-inset"
                [value]="'item-3'"
                rdxAccordionItem
            >
                <div class="flex" rdxAccordionHeader>
                    <button
                        class="demo-accordion-trigger flex h-12 h-full w-full flex-1 items-center justify-between px-0 px-5 py-5 [writing-mode:vertical-rl] aria-disabled:opacity-60"
                        type="button"
                        rdxAccordionTrigger
                    >
                        Can it be animated?
                    </button>
                </div>
                <div
                    class="demo-accordion-content [&[data-open][data-orientation=vertical]]:animate-accordion-down [&:not([data-open])[data-orientation=vertical]]:animate-accordion-up [&[data-open][data-orientation=horizontal]]:animate-accordion-right [&:not([data-open])[data-orientation=horizontal]]:animate-accordion-left overflow-hidden [&:not([data-open])[data-orientation=horizontal]]:w-0 [&:not([data-open])[data-orientation=vertical]]:h-0"
                    *rdxAccordionPanelPresence
                    rdxAccordionPanel
                >
                    <div class="w-80 px-5 py-4">Yes! You can animate the Accordion with CSS or JavaScript.</div>
                </div>
            </div>
        </div>
    `
})
export class AccordionHorizontalExample {}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
