# ADR 0006: Centralize Headless State → `data-*` Mapping in Core (instead of porting `useRender` / `Store`)

- Status: Proposed
- Date: 2026-06-06
- Decision owners: Radix NG maintainers
- Related package: `packages/primitives/core` (consumers: all primitives; pilot: `packages/primitives/collapsible`)

## Context

Radix NG is headless: a primitive carries no styles and exposes its state to consumers through
`data-*` attributes set with `host` bindings. The mapping from signal state to attribute value is
written inline, per directive, as a ternary:

```ts
host: {
    '[attr.data-state]': 'open() ? "open" : "closed"',
    '[attr.data-disabled]': 'disabled() ? "" : undefined'
}
```

This expression is repeated across every part of a primitive family (root, trigger, content, …) and
across the whole library. A sweep of `packages/primitives` shows the scale of the duplication:

| Pattern                                                                  | Occurrences |
| ------------------------------------------------------------------------ | ----------- |
| `? "" : undefined` (boolean presence: `disabled`, `required`, …)         | ~244        |
| `? "open" : "closed"`                                                    | ~29         |
| `? "checked" / "unchecked"`, `? "on" / "off"`, `? "active" / "inactive"` | ~10         |

Because the rule lives in many places by hand, it drifts. In `collapsible` the root emits the
spec-correct empty string while the child parts emit `"true"`:

```ts
// collapsible-root.directive.ts
'[attr.data-disabled]': 'disabled() ? "" : undefined'          // ""
// collapsible-content.directive.ts / collapsible-trigger.directive.ts
'[attr.data-disabled]': 'rootContext.disabled() ? "true" : undefined'   // "true"
```

A consumer styling `[data-disabled=""]` gets inconsistent behavior between a primitive's own parts.
`CLAUDE.md` mandates the empty string; the children violate it.

### What Base UI does, and why it does not transfer

[Base UI](https://base-ui.com/) solves the same concern with two utilities the project was asked to
evaluate:

- [`useRender`](https://github.com/mui/base-ui/blob/master/packages/react/src/use-render/useRender.ts) —
  the engine behind its `render` prop. It makes an element polymorphic, merges external props into
  internal ones (event handlers combined, `className` / `style` joined), and serializes a `state`
  object into `data-*` attributes, overridable via `stateAttributesMapping`.
- [`Store`](https://github.com/mui/base-ui/blob/master/packages/utils/src/store/Store.ts) — a
  framework-agnostic external store (`setState` / `update` / `subscribe` / selector `use()`), built
  for React's `useSyncExternalStore` so components subscribe to slices of state without re-rendering
  the whole tree.

Both exist to work around React's render model. Angular already covers their responsibilities with
native mechanisms, so porting either would re-implement framework features, worse:

| Base UI responsibility                               | Angular-native equivalent already used here                       |
| ---------------------------------------------------- | ----------------------------------------------------------------- |
| Polymorphic `render` element                         | Attribute directives — the consumer picks the host element        |
| Merge external/internal event handlers               | Angular multicasts host listeners and consumer `(event)` bindings |
| Reuse internal behavior                              | `hostDirectives` composition                                      |
| `state` reactivity, selector subscriptions, batching | Signals + `computed` (fine-grained, glitch-free)                  |
| Share state across parts                             | `createContext` + signals in the context object                   |
| `state` → `data-*` serialization                     | `host: { '[attr.data-*]': … }` bindings                           |

The only responsibility **not** already factored out is the last row: the serialization rule itself,
which is the duplicated, drifting code above. That — not `useRender` or `Store` — is the real gap.

### Constraint: host-binding expressions cannot reference module imports

An expression inside `host: { '[attr.x]': 'expr' }` is compiled against the **directive instance**.
It can reference instance members only, not free functions imported at module scope. A plain
`dataAttr(disabled())` in a host binding will not resolve. This constraint shapes the design below.

## Decision

1. Add a small, pure helper module to `@radix-ng/primitives/core` that names the serialization rules
   in one place:

   ```ts
   // core/src/data-attrs.ts

   /** Boolean → presence attribute: true → "", false → undefined (attribute removed). */
   export function dataAttr(condition: boolean | null | undefined): '' | undefined {
     return condition ? '' : undefined;
   }

   /** Open / closed state. */
   export function dataState(open: boolean | null | undefined): 'open' | 'closed' {
     return open ? 'open' : 'closed';
   }

   /** Arbitrary on/off pair, e.g. dataEnum(checked, 'checked', 'unchecked'). */
   export function dataEnum<On extends string, Off extends string>(
     on: boolean | null | undefined,
     onValue: On,
     offValue: Off
   ): On | Off {
     return on ? onValue : offValue;
   }
   ```

2. Use the helpers at two levels, matching the host-binding constraint:
   - **Level 1 — single directives.** A directive that owns its own state exposes the helper as a
     class member (one line) and calls it from host bindings. Worthwhile where a class has several
     such attributes (typically roots):

     ```ts
     export class RdxCollapsibleRootDirective {
       protected readonly dataAttr = dataAttr;
       // host: '[attr.data-disabled]': 'dataAttr(disabled())'
     }
     ```

   - **Level 2 — compound families.** The root context exposes **precomputed** `data-*` signals;
     every part binds them directly. This is the idiomatic equivalent of Base UI's
     `stateAttributesMapping`: the mapping lives once, in the context factory, and child parts carry
     no serialization logic at all.

     ```ts
     // context interface
     dataState: Signal<'open' | 'closed'>;
     dataDisabled: Signal<'' | undefined>;

     // rootContext() factory
     dataState: computed(() => dataState(instance.open())),
     dataDisabled: computed(() => dataAttr(instance.disabled())),

     // every part — root, content, trigger
     '[attr.data-state]':    'rootContext.dataState()',
     '[attr.data-disabled]': 'rootContext.dataDisabled()'
     ```

3. Do **not** port `useRender` or `Store`. Their other responsibilities are already covered by
   Angular directives, host multicast, `hostDirectives`, signals, and `createContext`.

## Consequences

### Positive

- A primitive family has a single source of truth for each `data-*` value. The `collapsible`
  `"true"` vs `""` divergence disappears by construction once parts read `rootContext.dataDisabled()`.
- Child parts shrink to declarative bindings with no embedded serialization logic.
- The serialization rule is named and unit-testable in one place (`dataAttr`, `dataState`,
  `dataEnum`) instead of being an unsearchable ternary repeated ~280 times.
- No new runtime dependency, no new abstraction layer, no framework feature re-implemented.

### Negative / Risks

- Two usage levels rather than one. Contributors must know when to use a class member (Level 1) vs a
  context signal (Level 2). Mitigated by the rule of thumb: shared across parts → context signal.
- Level 2 adds a `computed` per exposed attribute. The cost is negligible and the values are pulled
  on demand by host bindings anyway.
- A blanket rewrite of ~280 call sites would be churn with merge-conflict risk for little behavioral
  gain. The migration is therefore opportunistic, not mechanical (see below).

## Alternatives Considered

### Port Base UI `useRender`

Re-creates polymorphism, prop merging, and state serialization that Angular already provides through
directives, host multicast, and host bindings. The function-returns-element model does not map to
Angular's template compilation. Rejected.

### Port Base UI `Store`

Re-creates manual subscriptions and selectors on top of signals, which are already fine-grained and
glitch-free. A `signal<State>()` plus `computed` selectors gives the same store shape natively when a
primitive genuinely needs one connected state object. Rejected.

### Free helper functions only (no Level 2)

Helpers alone cannot be called from host expressions without a per-class member alias, so child parts
would still each carry a member and a call. This neither removes per-part boilerplate nor enforces a
single source of truth, so it does not fix the `collapsible` divergence. Insufficient on its own.

### Status quo (inline ternaries everywhere)

Keeps the duplication and the drift that already produced the `collapsible` inconsistency. Rejected.

### A shared base directive carrying the helpers

Angular directives compose through `hostDirectives`, not class inheritance, and a base class cannot
inject the per-part state generically. This fights the project's composition model. Rejected.

## Migration Plan

1. Add `core/src/data-attrs.ts` and export it from `core/index.ts`.
2. Pilot on `collapsible` using Level 2: expose `dataState` / `dataDisabled` on
   `CollapsibleRootContext`, point root/content/trigger at them, and in the same change fix the
   `"true"` → `""` divergence and drop the redundant `isDisabled = this.disabled` alias.
3. Roll out opportunistically: when a primitive is otherwise being touched, migrate its parts to the
   helpers. Do not mass-rewrite all ~280 call sites in one pass.
4. Reference the helpers in `CLAUDE.md` / `patterns.md` as the preferred way to emit `data-*` state.

## Trigger for Revisit

- A future primitive needs a genuinely connected multi-field state with selector semantics — revisit
  whether a thin signals-based `Store`-like context object earns its place (still not a `Store` port).
- Angular ships a first-party host-binding helper or a `data-*` directive convention that supersedes
  this module.
- The serialization rules diverge by primitive enough that a single `dataEnum` no longer covers the
  common cases, suggesting per-family mapping objects instead.
