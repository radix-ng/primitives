# Accordion — Events

> One example from the [Accordion](../components/accordion.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

Each item emits `onOpenChange` with `{ open, eventDetails }` whenever it expands or collapses; the
root emits `onValueChange` with `{ value, eventDetails }`. Call `eventDetails.cancel()` to reject a
change before it commits.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
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
    selector: 'accordion-events-example',
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective
    ],
    template: `
        <div class="flex w-[300px] flex-col gap-3">
            <div [class]="a.root" [defaultValue]="'item-1'" rdxAccordionRoot>
                <div [class]="a.item" [value]="'item-1'" (onOpenChange)="log('Accessibility', $event)" rdxAccordionItem>
                    <h3 [class]="a.header" rdxAccordionHeader>
                        <button [class]="a.trigger" type="button" rdxAccordionTrigger>Is it accessible?</button>
                    </h3>
                    <div [class]="a.content" rdxAccordionPanel>
                        <div [class]="a.contentText">Yes. It adheres to the WAI-ARIA design pattern.</div>
                    </div>
                </div>

                <div [class]="a.item" [value]="'item-2'" (onOpenChange)="log('Styling', $event)" rdxAccordionItem>
                    <h3 [class]="a.header" rdxAccordionHeader>
                        <button [class]="a.trigger" type="button" rdxAccordionTrigger>Is it unstyled?</button>
                    </h3>
                    <div [class]="a.content" rdxAccordionPanel>
                        <div [class]="a.contentText">Yes. It's unstyled by default.</div>
                    </div>
                </div>
            </div>

            <p class="text-muted-foreground text-sm">Last event: {{ status() }}</p>
        </div>
    `
})
export class AccordionEventsExample {
    protected readonly cn = cn;
    protected readonly a = demoAccordion;

    readonly status = signal('—');

    log(title: string, event: { open: boolean }): void {
        this.status.set(`${title} ${event.open ? 'opened' : 'closed'}`);
    }
}
```
