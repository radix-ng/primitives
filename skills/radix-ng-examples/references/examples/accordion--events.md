# Accordion — Events

> One example from the [Accordion](../components/accordion.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

An interaction first emits Item `onOpenChange` with `{ open, eventDetails }`, then Root
`onValueChange` with `{ value, eventDetails }`, using the same event details. Either handler can
cancel before commit. Changes to the controlled value and single-mode sibling closure do not emit
Item requests.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
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
    selector: 'accordion-events-example',
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective,
        RdxAccordionPanelPresenceDirective
    ],
    template: `
        <div class="flex w-[300px] flex-col gap-3">
            <div class="demo-accordion-root overflow-hidden" [defaultValue]="['item-1']" rdxAccordionRoot>
                <div
                    class="border-border focus-within:ring-ring overflow-hidden border-b last:border-b-0 focus-within:relative focus-within:z-[1] focus-within:ring-2 focus-within:outline-none focus-within:ring-inset"
                    [value]="'item-1'"
                    (onOpenChange)="log('Accessibility', $event)"
                    rdxAccordionItem
                >
                    <h3 class="flex" rdxAccordionHeader>
                        <button
                            class="demo-accordion-trigger flex h-12 w-full flex-1 items-center justify-between px-5 aria-disabled:opacity-60"
                            type="button"
                            rdxAccordionTrigger
                        >
                            Is it accessible?
                        </button>
                    </h3>
                    <div
                        class="demo-accordion-content [&[data-open][data-orientation=vertical]]:animate-accordion-down [&:not([data-open])[data-orientation=vertical]]:animate-accordion-up [&[data-open][data-orientation=horizontal]]:animate-accordion-right [&:not([data-open])[data-orientation=horizontal]]:animate-accordion-left overflow-hidden [&:not([data-open])[data-orientation=horizontal]]:w-0 [&:not([data-open])[data-orientation=vertical]]:h-0"
                        *rdxAccordionPanelPresence
                        rdxAccordionPanel
                    >
                        <div class="px-5 py-4">Yes. It adheres to the WAI-ARIA design pattern.</div>
                    </div>
                </div>

                <div
                    class="border-border focus-within:ring-ring overflow-hidden border-b last:border-b-0 focus-within:relative focus-within:z-[1] focus-within:ring-2 focus-within:outline-none focus-within:ring-inset"
                    [value]="'item-2'"
                    (onOpenChange)="log('Styling', $event)"
                    rdxAccordionItem
                >
                    <h3 class="flex" rdxAccordionHeader>
                        <button
                            class="demo-accordion-trigger flex h-12 w-full flex-1 items-center justify-between px-5 aria-disabled:opacity-60"
                            type="button"
                            rdxAccordionTrigger
                        >
                            Is it unstyled?
                        </button>
                    </h3>
                    <div
                        class="demo-accordion-content [&[data-open][data-orientation=vertical]]:animate-accordion-down [&:not([data-open])[data-orientation=vertical]]:animate-accordion-up [&[data-open][data-orientation=horizontal]]:animate-accordion-right [&:not([data-open])[data-orientation=horizontal]]:animate-accordion-left overflow-hidden [&:not([data-open])[data-orientation=horizontal]]:w-0 [&:not([data-open])[data-orientation=vertical]]:h-0"
                        *rdxAccordionPanelPresence
                        rdxAccordionPanel
                    >
                        <div class="px-5 py-4">Yes. It's unstyled by default.</div>
                    </div>
                </div>
            </div>

            <p class="text-muted-foreground text-sm">Last event: {{ status() }}</p>
        </div>
    `
})
export class AccordionEventsExample {
    readonly status = signal('—');

    log(title: string, event: { open: boolean }): void {
        this.status.set(`${title} ${event.open ? 'opened' : 'closed'}`);
    }
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
