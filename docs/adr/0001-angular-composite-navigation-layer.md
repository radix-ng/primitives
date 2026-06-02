# ADR 0001: Introduce an Internal Angular Composite Navigation Layer

- Status: Proposed
- Date: 2026-06-02
- Decision owners: Radix NG maintainers
- Related package: `packages/primitives/roving-focus`

## Context

Several primitives need keyboard navigation across a collection of items. The current shared solution is
`rdxRovingFocusGroup` with `rdxRovingFocusItem`, originally based on the Radix UI roving focus pattern.
It is currently used as a low-level building block by components such as Tabs, Toolbar, Toggle Group,
and Navigation Menu.

The current implementation is appropriate for basic linear roving focus. However, the group and item
directives combine several responsibilities:

- maintaining an item registry in DOM order;
- selecting the single item with `tabindex="0"`;
- temporarily making the group container tabbable and redirecting entry focus to an item;
- handling Tab and Shift+Tab transitions;
- handling arrow keys, orientation, direction, looping, and Home/End navigation;
- filtering items that should not participate in keyboard navigation.

This design has already required fixes around Shift+Tab state, dynamically disabled items, and tab stop
relocation. As component requirements grow, adding more flags directly to the existing roving focus
directives would make their public API harder to reason about.

[Base UI](https://base-ui.com/) is the project's primary behavioral reference. Base UI uses an internal
composite navigation layer rather than exposing its roving focus implementation as the shared component
contract. Its composite root centralizes navigation policy while each consuming component configures the
behavior it needs.

Relevant Base UI references:

- [`useCompositeRoot.ts`](https://github.com/mui/base-ui/blob/32539bb526c8d292da95cee1b7fdd6ad998ad69f/packages/react/src/internals/composite/root/useCompositeRoot.ts)
- [`useCompositeItem.ts`](https://github.com/mui/base-ui/blob/32539bb526c8d292da95cee1b7fdd6ad998ad69f/packages/react/src/internals/composite/item/useCompositeItem.ts)
- [`TabsList.tsx`](https://github.com/mui/base-ui/blob/32539bb526c8d292da95cee1b7fdd6ad998ad69f/packages/react/src/tabs/list/TabsList.tsx)
- [`RadioGroup.tsx`](https://github.com/mui/base-ui/blob/32539bb526c8d292da95cee1b7fdd6ad998ad69f/packages/react/src/radio-group/RadioGroup.tsx)

## Decision

Introduce an internal Angular composite navigation layer when the next component requires behavior that
does not fit the current linear roving focus implementation cleanly.

Do not replace the existing public roving focus API in the initial implementation. Keep
`rdxRovingFocusGroup` and `rdxRovingFocusItem` as compatibility wrappers until consumers have migrated
and the public API implications are understood.

The first implementation should remain intentionally narrow. It should solve shared linear navigation
requirements before adding grid navigation or exporting a new public primitive.

## Proposed Internal Shape

The exact Angular API should be designed during implementation. The expected shape is an internal root
directive or service plus item registration metadata:

```ts
interface CompositeItem {
  id: string;
  element: HTMLElement;
  disabled: boolean;
  focusableWhenDisabled?: boolean;
}

interface CompositeNavigationConfig {
  orientation: 'horizontal' | 'vertical' | 'both';
  dir: 'ltr' | 'rtl';
  loopFocus: boolean;
  enableHomeAndEndKeys: boolean;
}
```

The layer should initially support:

- item registration in DOM order;
- a stable highlighted item id;
- tab stop relocation when the highlighted item is disabled, removed, or becomes ineligible;
- root-level delegated keyboard handling;
- horizontal, vertical, and bidirectional orientation;
- RTL-aware horizontal navigation;
- configurable looping;
- configurable Home/End handling;
- component-specific disabled item policy;
- optional scrolling of the focused item into view;
- correct handling when keyboard events originate from text inputs or textareas.

The following features should be deferred until a concrete consumer requires them:

- grid navigation;
- dense grids and variable item sizes;
- exported public composite directives;
- generalized event propagation controls;
- a broad modifier-key configuration API.

## Public API Impact

The initial migration should be non-breaking.

Existing public selectors and inputs remain available:

- `rdxRovingFocusGroup`
- `rdxRovingFocusItem`
- `currentTabStopId`
- `defaultCurrentTabStopId`
- `focusable`
- `active`
- `allowShiftKey`
- `preventScrollOnEntryFocus`

Internally, some concepts may map to different composite terminology:

| Current roving focus concept | Internal composite concept            |
| ---------------------------- | ------------------------------------- |
| `currentTabStopId`           | highlighted item id                   |
| `focusable`                  | item eligibility metadata             |
| `active`                     | preferred entry item                  |
| item-level keydown handling  | root-level delegated keydown handling |

A future major version may simplify or deprecate parts of the roving focus API after all internal
consumers have migrated. That decision is explicitly out of scope for the initial implementation.

## Migration Plan

1. Add an internal linear composite navigation layer with focused unit tests.
2. Migrate Tabs first because its expected keyboard semantics are well defined.
3. Migrate Toolbar and Toggle Group.
4. Evaluate Navigation Menu separately because it may require component-specific behavior.
5. Adapt `rdxRovingFocusGroup` and `rdxRovingFocusItem` as compatibility wrappers if the internal layer
   can preserve their semantics without excessive complexity.
6. Evaluate Radio Group as a later consumer with its own disabled-item and form-control rules.
7. Add grid navigation only when a concrete component requires it.

## Consequences

### Positive

- Shared keyboard behavior becomes centralized and easier to test.
- Components can choose navigation policy without growing a single public directive with unrelated flags.
- Dynamic disabled and removed items can use one consistent relocation strategy.
- Tab, Shift+Tab, input caret behavior, and scrolling rules can be handled in one place.
- Future composite widgets can reuse the same foundation.

### Negative

- The migration adds an internal abstraction and a temporary compatibility layer.
- Existing consumers must be migrated incrementally and regression-tested.
- Maintaining both roving focus compatibility and composite behavior may briefly increase complexity.
- Copying the full Base UI composite implementation prematurely would introduce unused features.

## Alternatives Considered

### Continue Extending `roving-focus`

This keeps the current implementation small in the short term. It becomes less attractive as different
components need different Home/End rules, disabled-item behavior, input handling, or grid navigation.

### Replace the Public API Immediately

This would reduce compatibility code but risks unnecessary breaking changes for direct consumers of
`@radix-ng/primitives/roving-focus`. It should only be considered for a major release with migration
guidance.

### Port Base UI Composite Feature-for-Feature

This would provide the broadest capability set immediately. It is not recommended because the Angular
library does not yet have confirmed consumers for every Base UI option. The implementation should grow
from concrete component requirements.

## Open Questions

- Should the internal layer be implemented as directives, a service/context pair, or a combination?
- Is a stable item id sufficient as the controlled state, or do any consumers require an index?
- Which components need focusable-but-disabled items?
- Should compatibility wrappers preserve always-enabled PageUp/PageDown behavior?
- Which component should justify the first grid-navigation implementation?

## Trigger for Revisit

Revisit this ADR before:

- adding another navigation-specific flag to `rdxRovingFocusGroup`;
- implementing a component that requires grid navigation;
- duplicating keyboard navigation logic in a new primitive;
- making breaking changes to `@radix-ng/primitives/roving-focus`.
