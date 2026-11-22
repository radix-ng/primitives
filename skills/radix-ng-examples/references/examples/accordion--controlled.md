# Accordion — Controlled

> One example from the [Accordion](../components/accordion.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Use `[(value)]` to accept array requests. Cancel a request in `onValueChange` to keep the current selection.

```typescript
import { Component, signal } from '@angular/core';
import {
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionPanelDirective,
    RdxAccordionPanelPresenceDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective,
    RdxAccordionValueChangeEvent
} from '@radix-ng/primitives/accordion';

@Component({
    selector: 'accordion-controlled-example',
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
            <label class="flex items-center gap-2 text-sm" for="accordion-block-changes">
                <input
                    id="accordion-block-changes"
                    [checked]="blocked()"
                    (change)="blocked.set(!blocked())"
                    type="checkbox"
                />
                Block changes
            </label>
            <div
                class="demo-accordion-root overflow-hidden"
                [(value)]="selected"
                (onValueChange)="request($event)"
                rdxAccordionRoot
            >
                @for (item of items; track item) {
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
                            class="demo-accordion-content [&[data-open][data-orientation=vertical]]:animate-accordion-down [&:not([data-open])[data-orientation=vertical]]:animate-accordion-up [&[data-open][data-orientation=horizontal]]:animate-accordion-right [&:not([data-open])[data-orientation=horizontal]]:animate-accordion-left overflow-hidden [&:not([data-open])[data-orientation=horizontal]]:w-0 [&:not([data-open])[data-orientation=vertical]]:h-0"
                            *rdxAccordionPanelPresence
                            rdxAccordionPanel
                        >
                            <div class="px-5 py-4">Content for {{ item }}.</div>
                        </div>
                    </div>
                }
            </div>
            <p class="text-muted-foreground text-sm" data-testid="accordion-value">
                Selected: {{ selected().join(', ') }}
            </p>
            <p class="text-muted-foreground text-sm" data-testid="accordion-requests">Requests: {{ requests() }}</p>
        </div>
    `
})
export class AccordionControlledExample {
    readonly items = ['First', 'Second'];
    readonly selected = signal<unknown[]>(['First']);
    readonly blocked = signal(false);
    readonly requests = signal(0);
    request(event: RdxAccordionValueChangeEvent) {
        this.requests.update((count) => count + 1);
        if (this.blocked()) event.eventDetails.cancel();
    }
}
```

## Setup and shared files

These examples use Angular standalone components and Tailwind CSS v4. Install
`@radix-ng/primitives`. Copy the component from **Show code** and any shared files below,
preserving their relative import paths. Import the example component in its parent and use its selector.

Install `tailwindcss`, `@tailwindcss/postcss` and `postcss`. Configure the PostCSS plugin:

```json
{ "plugins": { "@tailwindcss/postcss": {} } }
```

Save the CSS below as `demo-styles.css` next to your global stylesheet. Import Tailwind first,
then the demo styles. Both Storybook and Playground use this same CSS through `main.css`.

```css
@import 'tailwindcss';
@import './demo-styles.css';
```

The shared file supplies theme values, light/dark tokens, common classes and animation keyframes.
Set `data-theme="dark"` on `<html>` for the dark theme; the default is light. The font stacks have
system fallbacks; Inter and JetBrains Mono can be self-hosted for the Storybook typography.

<details>
<summary>demo-styles.css</summary>

[Download demo-styles.css](../demo-styles.css)

</details>
