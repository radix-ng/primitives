# Composition

## Compound anatomy

Compound primitives are assembled from nested part directives: a Root that owns state, and children
(Item, Trigger, Content, …) that read it. Children find their Root through Angular **dependency
injection context**, so a part must live inside its Root in the DOM — otherwise it throws.

```html
<div rdxAccordionRoot>
  <div rdxAccordionItem>
    <h3 rdxAccordionHeader>
      <button rdxAccordionTrigger>…</button>
    </h3>
    <div rdxAccordionContent>…</div>
  </div>
</div>
```

Rules:

- Don't flatten the hierarchy or move a Trigger/Content outside its Root.
- Copy the part structure from the primitive's example / `styling-contract.json` anatomy verbatim.
- Each part is a directive you import from the secondary entry point, e.g.
  `import { RdxAccordionRootDirective } from '@radix-ng/primitives/accordion';`.

## State: controlled vs uncontrolled

Inputs/outputs are signal-based.

```html
<!-- uncontrolled: primitive owns state, seed with defaultValue -->
<div rdxAccordionRoot [defaultValue]="'item-1'">…</div>

<!-- controlled: you own state via two-way binding -->
<div rdxAccordionRoot [(value)]="selected">…</div>
```

```ts
selected = signal('item-1');
```

Read state from the model/signal — never by mutating the DOM or toggling `data-*` yourself; the
primitive sets those.

## Building your own components with `hostDirectives`

To wrap a primitive in your own design-system component, compose it with `hostDirectives` instead of
re-implementing behavior:

```ts
@Component({
  selector: 'app-accordion',
  hostDirectives: [
    { directive: RdxAccordionRootDirective, inputs: ['value', 'defaultValue', 'disabled', 'orientation'] }
  ],
  template: `
    <ng-content />
  `
})
export class AppAccordion {}
```

Expose only the inputs/outputs you want to surface. This keeps accessibility, keyboard handling, and
state management in the primitive while your component adds the styling and a friendlier API.

## Headless utilities

When no primitive fits, the building blocks under `@radix-ng/primitives/{composite, focus-scope,
dismissable-layer, presence, portal, popper, collection, visually-hidden}` (plus `injectId` and
`live-announcer` from `core`) let you build new accessible behavior the same way the primitives do.
