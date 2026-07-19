# Accordion — Keep mounted

> One example from the [Accordion](../components/accordion.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

With `keepMounted`, collapsed panels keep their element in the DOM while hidden — useful to preserve
form state. Use `hiddenUntilFound` instead to keep collapsed content discoverable by the browser's
find-in-page (it renders `hidden="until-found"`).

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionPanelDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';
import { cn, demoAccordion, demoInput } from '../../storybook/styles';

/**
 * With `keepMounted`, collapsed panels keep their element in the DOM while hidden.
 * Type something below, collapse the panel, and reopen it — the value is retained.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'accordion-keep-mounted-example',
    imports: [
        FormsModule,
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective
    ],
    template: `
        <div [class]="cn(a.root, 'w-[300px]')" [defaultValue]="'item-1'" keepMounted rdxAccordionRoot>
            <div [class]="a.item" [value]="'item-1'" rdxAccordionItem>
                <h3 [class]="a.header" rdxAccordionHeader>
                    <button [class]="a.trigger" type="button" rdxAccordionTrigger>Shipping address</button>
                </h3>
                <div [class]="a.content" rdxAccordionPanel>
                    <div [class]="a.contentText">
                        <input [(ngModel)]="address" [class]="input" placeholder="Type, then collapse & reopen" />
                    </div>
                </div>
            </div>

            <div [class]="a.item" [value]="'item-2'" rdxAccordionItem>
                <h3 [class]="a.header" rdxAccordionHeader>
                    <button [class]="a.trigger" type="button" rdxAccordionTrigger>Billing address</button>
                </h3>
                <div [class]="a.content" rdxAccordionPanel>
                    <div [class]="a.contentText">Same as shipping.</div>
                </div>
            </div>
        </div>
    `
})
export class AccordionKeepMountedExample {
    protected readonly cn = cn;
    protected readonly a = demoAccordion;
    protected readonly input = demoInput;

    address = '';
}
```
