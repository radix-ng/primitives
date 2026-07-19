# Accordion — Multiple

> One example from the [Accordion](../components/accordion.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

Set `multiple` to let several items stay open at once.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionPanelDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';
import { cn, demoAccordion } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'accordion-multiple-example',
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective
    ],
    template: `
        <div [class]="cn(a.root, 'w-[300px]')" [value]="['item-2', 'item-3']" multiple rdxAccordionRoot>
            <div [class]="a.item" [value]="'item-1'" rdxAccordionItem>
                <h3 [class]="a.header" rdxAccordionHeader>
                    <button [class]="a.trigger" type="button" rdxAccordionTrigger>Is it accessible?</button>
                </h3>
                <div [class]="a.content" rdxAccordionPanel>
                    <div [class]="a.contentText">Yes. It adheres to the WAI-ARIA design pattern.</div>
                </div>
            </div>

            <div [class]="a.item" [value]="'item-2'" rdxAccordionItem>
                <h3 [class]="a.header" rdxAccordionHeader>
                    <button [class]="a.trigger" type="button" rdxAccordionTrigger>Is it unstyled?</button>
                </h3>
                <div [class]="a.content" rdxAccordionPanel>
                    <div [class]="a.contentText">
                        Yes. It's unstyled by default, giving you freedom over the look and feel.
                    </div>
                </div>
            </div>

            <div [class]="a.item" [value]="'item-3'" rdxAccordionItem>
                <h3 [class]="a.header" rdxAccordionHeader>
                    <button [class]="a.trigger" type="button" rdxAccordionTrigger>Can it be animated?</button>
                </h3>
                <div [class]="a.content" rdxAccordionPanel>
                    <div [class]="a.contentText">
                        Yes. It's unstyled by default, giving you freedom over the look and feel.
                    </div>
                </div>
            </div>
        </div>
    `
})
export class AccordionMultipleExample {
    protected readonly cn = cn;
    protected readonly a = demoAccordion;
}
```
