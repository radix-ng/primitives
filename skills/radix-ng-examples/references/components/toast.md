# Toast

A succinct, low-priority message that appears temporarily, stacks, and can be swiped away.

> Index — full source of each example is one click away in `../examples/toast--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Imperative API — push toasts from anywhere with `add` / `update` / `close` / `promise`.
- ✅ Headless and unstyled — state is exposed through `data-*` attributes and CSS variables.
- ✅ Stacking with a hover/focus expand, driven by measured heights (`--toast-offset-y`).
- ✅ Swipe-to-dismiss with rubber-banding and flick detection in any allowed direction.
- ✅ Auto-dismiss timers that pause while the stack is hovered, focused, or being swiped.
- ✅ Promise toasts with `loading` / `success` / `error` copy.
- ✅ Accessible — announces through `role="status"` / `role="alert"` by priority.

## Import

```ts
import { provideRdxToastManager, RdxToastManager, toastImports } from '@radix-ng/primitives/toast';
```

`toastImports` bundles every part directive; `provideRdxToastManager()` (or the `[rdxToastProvider]`
directive) supplies the queue, and `RdxToastManager` is injected to push toasts.

## Anatomy

Provide the manager once, render the viewport, and iterate the queue. Each item from
`manager.toasts()` is bound to a `rdxToastRoot`.

```html
<div rdxToastProvider>
    <div rdxToastPortal>
        <div rdxToastViewport>
            <!-- @for (toast of manager.toasts(); track toast.id) -->
            <div rdxToastRoot [toast]="toast">
                <div rdxToastContent>
                    <p rdxToastTitle></p>
                    <p rdxToastDescription></p>
                    <button rdxToastAction></button>
                    <button rdxToastClose></button>
                </div>
            </div>
        </div>
    </div>
</div>
```

```ts
const manager = inject(RdxToastManager);
manager.add({ title: 'Saved', description: 'Your changes are live.' });
```

An anchored toast is wrapped in `rdxToastPositioner` instead of joining the stack:

```html
<div rdxToastPositioner [anchor]="toast.positionerProps.anchor">
    <div rdxToastRoot [toast]="toast">
        <div rdxToastContent>
            <p rdxToastTitle></p>
        </div>
    </div>
</div>
```

## Examples

- [Default](../examples/toast--default.md)
- [Stacking](../examples/toast--stacking.md)
- [Swipe to dismiss](../examples/toast--swipe-to-dismiss.md)
- [Promise](../examples/toast--promise.md)
- [Types](../examples/toast--types.md)
- [Custom position](../examples/toast--custom-position.md)
- [Undo action](../examples/toast--undo-action.md)
- [Custom data](../examples/toast--custom-data.md)
- [Deduplicated](../examples/toast--deduplicated.md)
- [Varying heights](../examples/toast--varying-heights.md)
- [Anchored](../examples/toast--anchored.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/toast.json`
- Styling (parts + `data-*`): `references/styling-contract/toast.json`
