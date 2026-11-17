# Accordion — Panel lifetime

> One example from the [Accordion](../components/accordion.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

Apply `*rdxAccordionPanelPresence` to each Panel host. Closed Panels create no Angular children
by default. Closing destroys the complete view after exit motion; reopening creates fresh children
and native form state. Retained Panels preserve that state.

```typescript
import { Component } from '@angular/core';
import {
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionPanelDirective,
    RdxAccordionPanelPresenceDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';
import { demoAccordion } from '../../storybook/styles';

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
            <div [class]="a.root" rdxAccordionRoot multiple>
                @for (retained of [false, true]; track retained) {
                    <div [value]="retained" [class]="a.item" rdxAccordionItem>
                        <h3 [class]="a.header" rdxAccordionHeader>
                            <button [class]="a.trigger" rdxAccordionTrigger>
                                {{ retained ? 'Keep state' : 'Reset state' }}
                            </button>
                        </h3>
                        <div
                            *rdxAccordionPanelPresence="{ keepMounted: retained }"
                            [class]="a.content"
                            rdxAccordionPanel
                        >
                            <div [class]="a.contentText">
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
export class AccordionPanelLifetimeExample {
    protected readonly a = demoAccordion;
}
```
