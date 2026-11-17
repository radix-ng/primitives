# Accordion — Motion and dynamic content

> One example from the [Accordion](../components/accordion.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

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
import { demoAccordion, demoButton } from '../../storybook/styles';
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
            <button [class]="b.base" (click)="tall.set(!tall())" type="button">Change content size</button>
            <div [class]="a.root" rdxAccordionRoot>
                @for (item of ['Details', 'Another item']; track item) {
                    <div [value]="item" [class]="a.item" rdxAccordionItem>
                        <h3 [class]="a.header" rdxAccordionHeader>
                            <button [class]="a.trigger" rdxAccordionTrigger>{{ item }}</button>
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
    protected readonly a = demoAccordion;
    protected readonly b = demoButton;
    readonly tall = signal(false);
}
```
