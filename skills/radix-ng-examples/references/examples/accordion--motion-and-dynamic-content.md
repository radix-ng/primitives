# Accordion — Motion and dynamic content

> One example from the [Accordion](../components/accordion.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

Use the height variable with `data-starting-style` and `data-ending-style` for CSS transitions.
During motion it contains a measured scroll size. After motion it returns to `auto`, so the panel
follows later content changes. Closing measures the current expanded content before applying exit styles.

```typescript
import { Component, signal } from '@angular/core';
import {
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionPanelDirective,
    RdxAccordionPanelPresenceDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';
@Component({
    selector: 'accordion-motion-example',
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
            <button class="demo-button" (click)="tall.set(!tall())" type="button">Change content size</button>
            <div class="demo-accordion-root overflow-hidden" rdxAccordionRoot>
                @for (item of ['Details', 'Another item']; track item) {
                    <div
                        class="border-border focus-within:ring-ring overflow-hidden border-b last:border-b-0 focus-within:relative focus-within:z-[1] focus-within:ring-2 focus-within:outline-none focus-within:ring-inset"
                        [value]="item"
                        rdxAccordionItem
                    >
                        <h3 class="flex" rdxAccordionHeader>
                            <button
                                class="demo-accordion-trigger flex h-12 w-full flex-1 items-center justify-between px-5 aria-disabled:opacity-60"
                                rdxAccordionTrigger
                            >
                                {{ item }}
                            </button>
                        </h3>
                        <div
                            class="h-[var(--accordion-panel-height)] overflow-hidden transition-[height] duration-300 data-[ending-style]:h-0 data-[starting-style]:h-0"
                            *rdxAccordionPanelPresence
                            rdxAccordionPanel
                        >
                            <div class="bg-muted text-muted-foreground" [class.h-20]="!tall()" [class.h-40]="tall()">
                                <p class="p-4">The panel follows content changes after opening.</p>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </div>
    `
})
export class AccordionMotionExample {
    readonly tall = signal(false);
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
