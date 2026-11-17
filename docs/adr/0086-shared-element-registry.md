# ADR 0086: Share element registration and document order across navigation models

- Status: Accepted
- Date: 2026-11-17
- Decision owners: Radix NG maintainers
- Related: ADR 0001, ADR 0014, ADR 0057, packages/primitives/core/src/composables/use-element-registry.ts, packages/primitives/composite/src/composite-list.ts, packages/primitives/combobox/src/combobox-engine.ts

## Context

Composite observes DOM moves and maintains memoized indices. Combobox's separate registry sorted only
on registration/removal. Angular's tracked `@for` can move existing views without either operation:
the DOM becomes c, b, a while Combobox and Autocomplete still navigate a, b, c.

Registration has the same lifetime and ordering requirements across roving tabindex and
`aria-activedescendant`. Selection, filtering, disabled handling and focus ownership differ.
Angular [queries never pierce component boundaries](https://angular.dev/guide/components/queries), so
signal queries cannot discover every option rendered inside consumer wrapper components.

## Decision

Core's `useElementRegistry` owns one stable element-keyed Map, connected document order and a memoized
element-to-index map. Registration returns a generation-checked cleanup. Explicit removal checks the
original owner, so a late cleanup cannot remove a replacement registered on the same native element.
`update` replaces a registered payload without replacing its owner or lifetime. Metadata may contain
signals; consumers read them reactively without invalidating the document-order/index cache.

An Angular render hook reconciles moves and connection changes after rendering. Batched membership
effects initialize observation even when no template consumes the snapshot. Mutation observers watch
item parents and adjacent items' common ancestors, catching direct and wrapper moves without a global
subtree observer. `refresh` supports explicit synchronization after external DOM work. Observers and
registrations are disposed with the owner's `DestroyRef`; SSR needs no global `Node` or observer.

CompositeList delegates registration and ordering to core, retaining its metadata-map adapter.
Combobox's shared engine uses the same registry, including Autocomplete. CompositeRoot continues to
own roving tabindex, move-focus repair and keyboard policy; the engine continues to own filtering,
selection and virtual highlight. Reordering preserves the logical highlighted item. Virtualized
navigation continues to use data indices rather than the rendered DOM window.

DI registration and Composite's explicit projected-item owner remain the boundary adapters. Signal
queries can describe parts inside a known template; they do not replace cross-component registration.
The existing Composite order-helper exports forward to core for compatibility.

## Consequences

Tracked option moves update all three consumers consistently. Metadata changes do not rebuild native
indices. Registrations mutate a stable Map; sorting is deferred to snapshot consumption after a
membership/order change. Render reconciliation scans existing nodes, so it must remain independent
of per-item render hooks and metadata-only updates.

DOM observation is scoped. Consumers making arbitrary external changes beyond the observed
containers must call `refresh` or trigger an Angular render. The registry owns no keyboard handlers,
focus restoration, filtering or hidden-item semantics.

## Verification

Core tests cover registration, replacement ownership, payload updates, disposal, connection and
native wrapper moves. Composite retains its tracked/group reorder and focus tests. Shared-engine
tests reorder options inside child component templates and update disabled/text metadata while
retaining native instances. The Combobox Reorder story drives browser checks for native identity,
DOM-order navigation, input focus and `aria-activedescendant`. Composite, Combobox and Autocomplete
participate in the affected browser catalog.

## Base UI references

- `packages/react/src/internals/composite/list/CompositeList.tsx` — ordered registration and scoped
  observation of moves.
- `packages/react/src/combobox/root/ComboboxRoot.tsx` — virtual highlight, filtering and selection
  remain widget policies above registration.
