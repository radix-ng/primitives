# ADR 0001: Use Angular Composite as the Shared Navigation Layer

- Status: Accepted
- Date: 2026-06-02 (updated 2026-09-05)
- Decision owners: Radix NG maintainers
- Related: `packages/primitives/composite`, `packages/primitives/tabs`, `packages/primitives/navigation-menu`

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

### Item ownership across content projection

Base UI resolves an item's composite root and list through React context, which follows the rendered
element tree. Angular resolves them through the element injector, which follows the **declaring**
template. The two agree until a wrapper component projects items: `<ng-content />` moves nodes into the
wrapper's view but keeps their declaring injector, so an item projected into a `List` that lives in the
wrapper's template cannot inject that List's contexts and silently drops out of the collection.

`RdxCompositeItemOwner` (`composite/src/composite-item-owner.ts`) is the Angular-specific escape hatch
for this. A primitive that wants to support the pattern republishes its List's `RdxCompositeRootContext`
and `RdxCompositeListContext` as signals on its own Root context, then provides an owner on each item
part; `RdxCompositeItem` / `RdxCompositeListItem` prefer an owner over injection whenever one is present.
The DOM containment checks (`rootElement.contains` / `listElement.contains`) still gate registration, so
an item that is bridged but rendered outside the list element registers with nothing.

Constraints that come with it:

- The owner is authoritative even while its signals are `null`, so an item that has one **never** falls
  back to injecting a nearer composite root. A primitive that later nests a second composite root inside
  itself has to make its owner conditional.
- The owner is resolved through the primitive's Root context, so the Root must stay in the projected
  items' declaring tree — wrappers compose it onto their host element.
- The bridge is opt-in per primitive. `tabs` and `navigation-menu` provide it (`tabs-composite-item-owner.ts`,
  `navigation-menu-composite-item-owner.ts`); every other composite consumer relies on plain injection.
- `menu` is deliberately left without one and instead falls back to reading focusable items out of the
  DOM when its composite list comes back empty (`menuItems()` in `menu-popup.ts`). That covers a popup
  whose items are _all_ projected, but not a **mixed** popup: as soon as one item registers inline, the
  fallback is skipped and the projected ones drop out of keyboard navigation. A real bridge is more
  expensive here than in Tabs — `rdxMenuSubTrigger` belongs to the _parent_ popup's list, so ownership
  has to be resolved per popup rather than per root, which a single pair of signals on the Root context
  cannot express.

`RdxCompositeItemOwner` is exported from the `composite` entry point only so sibling secondary entry
points can coordinate. It is marked `@internal` and carries no semver stability guarantee.

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

## Rejected alternatives

- **A generic DOM- or `WeakMap`-based fallback in `composite` itself**, resolving an item's list by
  walking up from the element instead of through DI. Rejected because it treats the symptom: in the
  projection case DI does not fail to find a context, it finds a _valid but wrong_ one (the wrapper's
  own ancestor), so a fallback would never be reached. It would also make every item's ownership
  implicit and position-dependent, where the owner provider keeps it explicit and per primitive.
- **Making `RdxCompositeItemOwner` part of the public API** so consumers can bridge their own
  composites. Deferred until someone asks: the shape is still driven by two primitives' needs, and
  freezing it now would lock in a contract we have not stress-tested.

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
- adding a new composite option that exists only for one primitive;
- nesting a second composite root inside a primitive that provides an `RdxCompositeItemOwner`;
- promoting `RdxCompositeItemOwner` to a supported public API;
- bridging ownership into a primitive whose lists are per-popup rather than per-root (`menu`).
