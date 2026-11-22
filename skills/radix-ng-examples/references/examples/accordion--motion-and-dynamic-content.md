# Accordion — Motion and dynamic content

> One example from the [Accordion](../components/accordion.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

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
