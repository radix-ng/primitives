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

```html
<div [class]="cn(a.root, 'w-[300px]')" [defaultValue]="'item-1'" ${argsToTemplate(args)} rdxAccordionRoot>
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
            <div [class]="a.contentText">Yes! You can animate the Accordion with CSS or JavaScript.</div>
        </div>
    </div>
</div>
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
