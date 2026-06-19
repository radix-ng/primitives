# ADR 0001: Use Angular Composite as the Shared Navigation Layer

- Status: Accepted
- Date: 2026-06-02
- Updated: 2026-06-19
- Decision owners: Radix NG maintainers
- Related package: `packages/primitives/composite`

## Context

Several primitives need keyboard navigation across an ordered collection of items. The original shared
solution was the public `@radix-ng/primitives/roving-focus` entry point, based on the Radix UI roving
focus pattern.

Base UI is the project's primary behavioral reference. Base UI models this as an internal composite
layer: one part registers ordered items, and another part applies roving focus and keyboard navigation
for widgets that need it.

Relevant Base UI references:

- [`CompositeList.tsx`](https://github.com/mui/base-ui/blob/32539bb526c8d292da95cee1b7fdd6ad998ad69f/packages/react/src/internals/composite/list/CompositeList.tsx)
- [`useCompositeListItem.ts`](https://github.com/mui/base-ui/blob/32539bb526c8d292da95cee1b7fdd6ad998ad69f/packages/react/src/internals/composite/list/useCompositeListItem.ts)
- [`useCompositeRoot.ts`](https://github.com/mui/base-ui/blob/32539bb526c8d292da95cee1b7fdd6ad998ad69f/packages/react/src/internals/composite/root/useCompositeRoot.ts)
- [`useCompositeItem.ts`](https://github.com/mui/base-ui/blob/32539bb526c8d292da95cee1b7fdd6ad998ad69f/packages/react/src/internals/composite/item/useCompositeItem.ts)

## Decision

Use `@radix-ng/primitives/composite` as the shared ordered-list and composite-navigation layer.

The Angular implementation is split into two layers:

- `RdxCompositeList` / `rdxCompositeList` owns DOM-order item registration and metadata maps.
- `RdxCompositeListItem` / `rdxCompositeListItem` registers an item without changing focus behavior.
- `RdxCompositeRoot` / `rdxCompositeRoot` composes `RdxCompositeList` and adds roving `tabindex`,
  highlighted-index state, arrow-key navigation, optional Home/End, looping, RTL handling, disabled
  index policy, and keyboard-event relaying.
- `RdxCompositeItem` / `rdxCompositeItem` composes `RdxCompositeListItem` and receives roving
  `tabindex` from the nearest `RdxCompositeRoot`.

The old public `@radix-ng/primitives/roving-focus` entry point is removed in the breaking Base UI
parity cleanup. Consumers should migrate to `@radix-ng/primitives/composite` or, preferably, to the
higher-level primitive that owns the interaction pattern.

## Scope

The current composite root intentionally supports the linear behavior needed by Radio Group, Tabs,
Toolbar, Toggle Group, Menubar, and Navigation Menu:

- item registration in DOM order;
- root-level delegated keyboard handling;
- horizontal, vertical, and bidirectional orientation;
- RTL-aware horizontal navigation;
- configurable looping;
- configurable Home/End handling;
- explicit disabled index policy;
- optional focus-on-hover;
- scrolling the focused item into view;
- preserving native text input arrow behavior until the caret reaches an edge.

The following features remain deferred until a concrete consumer requires them:

- grid navigation;
- dense grids and variable item sizes;
- typeahead as part of composite root;
- broad modifier-key policy beyond the current allow-list.

## Public API Impact

Breaking:

- remove `@radix-ng/primitives/roving-focus`;
- remove `rdxRovingFocusGroup`;
- remove `rdxRovingFocusItem`.

Replacement:

```ts
import {
  RdxCompositeList,
  RdxCompositeListItem,
  RdxCompositeRoot,
  RdxCompositeItem
} from '@radix-ng/primitives/composite';
```

Use `rdxCompositeList` / `rdxCompositeListItem` when only ordered metadata registration is needed.
Use `rdxCompositeRoot` / `rdxCompositeItem` when the widget also needs roving focus and arrow-key
navigation.

## Consequences

### Positive

- Shared keyboard behavior is centralized and tested in one package.
- Ordered item registration can now be reused without opting into roving focus.
- Component code can more closely match Base UI's `CompositeList` plus `CompositeRoot` split.
- The old roving-focus public API no longer constrains new primitive behavior.

### Negative

- Direct consumers of `@radix-ng/primitives/roving-focus` must migrate.
- The Angular composite layer still has fewer features than Base UI's full internal implementation.

## Trigger for Revisit

Revisit this ADR before:

- adding grid navigation;
- adding typeahead to composite root;
- duplicating ordered item registration in a new primitive;
- adding a new composite option that exists only for one primitive.
