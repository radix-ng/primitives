# Composition

#### Building your own directives and components _on top_ of primitives, not around them.

Once you're comfortable using primitives, the next step is reusing them inside your own building
blocks. Angular's [Directive Composition API](https://angular.dev/guide/directives/directive-composition-api)
(`hostDirectives`) lets one directive _wear_ another, inheriting its behavior, host bindings, and
accessibility — without wrapping it in extra DOM.

## The library does this itself

Accordion isn't built from scratch. An **Accordion Item is a Collapsible Root** — it composes the
existing primitive and adds only accordion-specific coordination:

```ts
@Directive({
  selector: '[rdxAccordionItem]',
  hostDirectives: [
    {
      directive: RdxCollapsibleRootDirective,
      inputs: ['disabled: disabled', 'open: open'] // re-expose the inputs you want public
    }
  ]
})
export class RdxAccordionItemDirective {
  // arrow-key navigation, single-vs-multiple open, data-open for the item…
}
```

All the open/close behavior, the `data-*` state, and the panel mounting come from Collapsible for
free. The accordion only writes the part that's genuinely new. Here's the result:

```typescript
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucidePlus } from '@lucide/angular';
import {
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionPanelDirective,
    RdxAccordionPanelPresenceDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';

@Component({
    host: { class: 'contents' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'rdx-accordion-default-example',
    imports: [
        RdxAccordionHeaderDirective,
        RdxAccordionItemDirective,
        RdxAccordionPanelPresenceDirective,
        RdxAccordionPanelDirective,
        RdxAccordionRootDirective,
        RdxAccordionTriggerDirective,
        LucidePlus
    ],
    template: `
        <div
            class="border-border text-foreground flex w-80 max-w-full flex-col border"
            [disabled]="disabled()"
            [multiple]="multiple()"
            rdxAccordionRoot
        >
            @for (item of items; track item.id) {
                <div class="border-border not-first:border-t" [value]="item.id" rdxAccordionItem>
                    <h3 rdxAccordionHeader>
                        <button
                            class="hover:not-data-disabled:bg-muted focus-visible:outline-ring group flex w-full items-center justify-between gap-4 bg-transparent px-3 py-2 text-start text-sm font-normal select-none focus-visible:relative focus-visible:z-1 focus-visible:outline-2"
                            type="button"
                            rdxAccordionTrigger
                        >
                            {{ item.question }}
                            <svg
                                class="shrink-0 transition-transform duration-100 ease-out group-data-panel-open:rotate-45"
                                aria-hidden="true"
                                lucidePlus
                                size="16"
                            />
                        </button>
                    </h3>
                    <div
                        class="h-(--accordion-panel-height) overflow-hidden text-sm transition-[height] duration-150 ease-out data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none"
                        *rdxAccordionPanelPresence
                        rdxAccordionPanel
                    >
                        <div class="px-3 py-2">{{ item.answer }}</div>
                    </div>
                </div>
            }
        </div>
    `
})
export class AccordionDefaultStory {
    readonly disabled = input(false);
    readonly multiple = input(false);

    protected readonly items = [
        {
            id: 'about',
            question: 'What is Radix NG?',
            answer: 'Radix NG provides unstyled Angular primitives for design systems and web apps.'
        },
        {
            id: 'start',
            question: 'How do I get started?',
            answer: 'Install the primitives and compose them using standalone Angular imports.'
        },
        {
            id: 'license',
            question: 'Can I use it for my project?',
            answer: 'Yes. Radix NG is free and open source.'
        }
    ];
}
```

The takeaway: when you need behavior that already exists, **compose it** instead of reimplementing
it. Same pattern is available to you in application code.

## Pattern 1 — bake in a policy with a wrapper

When the same configuration repeats across templates, wrap the primitive in your own component and
expose only the inputs that belong to your API:

```ts
@Component({
  selector: 'app-submit-button',
  template: '<ng-content />',
  hostDirectives: [
    {
      directive: RdxButtonDirective,
      inputs: ['disabled', 'focusableWhenDisabled']
    }
  ]
})
export class SubmitButton {}
```

`<app-submit-button>` now _is_ a Radix button — it has the button's host bindings and a11y — but
your app sees a small, intentional surface. Inputs you don't list stay private.

## Pattern 2 — read the Root context to extend behavior

Inside a primitive family you can inject the same Root context its parts use, and build a custom
part that reacts to shared state:

```ts
@Directive({ selector: '[appTabBadge]' })
export class TabBadge {
  private readonly tabs = injectTabsRootContext(); // same context the built-in parts use
  protected readonly activeValue = computed(() => this.tabs.value());
}
```

This is how you add a part the library doesn't ship — it coordinates through the exact same DI
context as `rdxTabsTab` and `rdxTabsPanel`. Pass `true`
(`injectTabsRootContext(true)`) if the directive should also work _outside_ a Tabs Root, returning
`null` instead of throwing.

## When to compose vs. when to bind

- **Composition (`hostDirectives`)** — you're defining a reusable building block: a styled button, a
  domain-specific field, a card that's always a dialog. The behavior becomes part of _your_
  component's identity.
- **Plain inputs/outputs** (see **Controlled & uncontrolled**) — you're using a primitive once, in
  one template. No new component needed.

For more worked examples, see **Guides/Composition** and **Guides/Inject Context**.

## Next

→ **Build a styled component** — the end-to-end tutorial. Start from a bare primitive and finish with
a polished, reusable component, applying every idea from this section.
