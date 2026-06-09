# Presence

`RdxPresenceDirective` is a headless structural directive that conditionally mounts and
unmounts its template content based on a reactive `present` signal supplied through the
presence context.

When `present` becomes `false`, the directive keeps the content in the DOM while a CSS exit
animation (`@keyframes` applied for the `data-state="closed"` state) is running, and removes it
only once that animation ends. If the content has no exit animation, it unmounts immediately.

It is not used directly — it is composed into a part directive via `hostDirectives`, and the
host provides the `present` signal with `provideRdxPresenceContext`.

```html
<presence-example />
```

## Usage

Provide the context and compose the directive on an `ng-template`:

```ts
@Directive({
  selector: 'ng-template[myContentPresence]',
  hostDirectives: [RdxPresenceDirective],
  providers: [
    provideRdxPresenceContext(() => {
      const rootContext = injectMyRootContext()!;
      return { present: rootContext.open };
    })
  ]
})
export class MyContentPresence {}
```

```html
<ng-template myContentPresence>
  <div [attr.data-state]="open() ? 'open' : 'closed'">Content</div>
</ng-template>
```

Expose state with a `data-state` attribute on the content element and define the exit
animation for `[data-state='closed']`. The directive keeps the element mounted until that
animation finishes:

```css
.content[data-state='open'] {
  animation: fade-in 150ms ease-out;
}
.content[data-state='closed'] {
  animation: fade-out 150ms ease-in;
}
```

## API

### `RdxPresenceContext`

```ts
type RdxPresenceContext = {
  present: Signal<boolean>;
};
```

### `provideRdxPresenceContext(factory)`

DI helper that registers the `RdxPresenceContext` consumed by `RdxPresenceDirective`. The
factory runs in an injection context, so it can `inject()` ancestor contexts to derive the
`present` signal.
