# Composition

## Compound anatomy

Compound primitives are assembled from nested part directives: a Root that owns state, and children
(Item, Trigger, Content, …) that read it. Children find their Root through Angular **dependency
injection context**, so DOM ancestry alone is not sufficient. A part must also have the provider-bearing
part in its declaring injector ancestry unless the primitive documents an explicit projection bridge.

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
- Remember that `<ng-content>` changes where a node renders, not the injector ancestry it was declared
  with. Prefer exposing intermediate provider-bearing parts as wrapper hosts.
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

For compound primitives with an intermediate owner such as `Tabs.List`, the portable pattern is to
compose that part onto another wrapper host and project its children there:

```ts
@Component({
  selector: 'app-tabs-list',
  hostDirectives: [RdxTabsList],
  template: '<ng-content />'
})
export class AppTabsList {}
```

`Tabs` and `Navigation Menu` additionally bridge projected top-level composite items into a List that
lives inside the wrapper's view. The bridge runs through the Root, so `RdxTabsRoot` /
`RdxNavigationMenuRoot` must stay in the projected content's declaring tree — compose it onto the
wrapper's host. Moving the Root into the wrapper's template puts it out of the projected parts' reach
and they throw a missing-context error. Do not assume the same bridge exists for other compound
primitives unless their documentation says so.

## Headless utilities

When no primitive fits, the building blocks under `@radix-ng/primitives/{composite, focus-scope,
dismissable-layer, presence, portal, popper, visually-hidden}` (plus `injectId` and
`live-announcer` from `core`) let you build new accessible behavior the same way the primitives do.
