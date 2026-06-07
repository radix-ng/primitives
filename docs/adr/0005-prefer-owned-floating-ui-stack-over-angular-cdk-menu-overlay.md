# ADR 0005: Prefer the Owned Floating UI Stack over Angular CDK Menu and Overlay

- Status: Accepted — implemented (2026-06-07)
- Date: 2026-06-03
- Decision owners: Radix NG maintainers
- Related packages: `packages/primitives/menu`, `packages/primitives/dropdown-menu`, `packages/primitives/popper`,
  `packages/primitives/dismissable-layer`, `packages/primitives/portal`, `packages/primitives/focus-scope`

## Outcome (2026-06-07)

This direction has shipped, in full and slightly beyond:

- No `@angular/cdk` imports remain in `packages/primitives/**/src` — not even `@angular/cdk/coercion`.
  The ADR had allowed coercion to stay; in practice **all** CDK was removed and `BooleanInput` /
  `NumberInput` now live in `packages/primitives/core/src/types.ts`. This is a deliberate deviation
  beyond the ADR, recorded here.
- `@angular/cdk` is absent from `package.json`, the lockfile, and `tsconfig.base.json` paths.
- `@radix-ng/primitives/dropdown-menu` was **removed outright** (the breaking-release option), not
  kept as a deprecated compatibility layer.
- `menu`, `context-menu`, and `menubar` exist as the Base UI-aligned primitives and compose
  `RdxPopper`, `RdxDismissableLayer`, and `RdxFocusScope` from the owned floating stack.

The "Open Questions" below were resolved by implementation: `dropdown-menu` deleted immediately;
`context-menu` and `menubar` became coordinators over the shared `menu` foundation (see CLAUDE.md).
Status moved Proposed → Accepted; this ADR is now a historical record, not active work.

## Context

Several primitives display floating interactive surfaces: Select, Popover, Tooltip, Menu, Context Menu,
Dropdown Menu, and Menubar. These surfaces share recurring behavior:

- positioning relative to a trigger or virtual anchor;
- collision handling, side / align metadata, offsets, and arrows;
- portal rendering;
- open / close state;
- outside pointer and focus dismissal;
- Escape key dismissal;
- focus lifecycle and focus restore;
- keyboard navigation inside composite item collections;
- nested floating surfaces such as submenus.

The project already has a local floating stack:

- `@radix-ng/primitives/popper`, built on `@floating-ui/dom`;
- `@radix-ng/primitives/portal`;
- `@radix-ng/primitives/dismissable-layer`;
- `@radix-ng/primitives/focus-scope`;
- `@radix-ng/primitives/collection`;

`@radix-ng/primitives/select`, `popover`, and `tooltip` already compose these primitives instead of
using Angular CDK Overlay. This gives the library Base UI-like anatomy while keeping DOM parts
headless and directive-composable.

The older menu-family implementations are inconsistent:

- `packages/primitives/dropdown-menu` extends `CdkMenuTrigger`, `CdkMenu`, and `CdkMenuItem` directly.
- `packages/primitives/menu` uses `hostDirectives` around `CdkMenuTrigger`, `CdkMenu`, `CdkMenuItem`,
  `CdkMenuItemCheckbox`, `CdkMenuItemRadio`, and `CdkMenuGroup`.
- `context-menu` and `menubar` also depend on `@angular/cdk/menu`.

This creates several problems:

- The public API follows CDK's template-trigger model more than Base UI's `Root / Trigger / Portal /
Positioner / Popup / Item` anatomy.
- CDK Menu owns important behavior internally, which makes Base UI feature parity hard to add
  incrementally.
- Menu positioning, dismissal, and focus behavior diverge from Select, Popover, and Tooltip.
- There are two overlapping menu surfaces: `menu` and `dropdown-menu`.
- Storybook examples for the older menu-family components still rely on old Radix theme CSS and
  story-local styles instead of the current Tailwind demo contract.

At the same time, not every Angular CDK import is a problem. The project widely uses small CDK utility
packages such as `@angular/cdk/coercion` for `BooleanInput`, `NumberInput`, `booleanAttribute`, and
`numberAttribute` typing patterns. Removing these utilities is not required to align floating
primitives with Base UI.

## Decision

For new or substantially rewritten floating / menu primitives, prefer the owned floating stack:

```txt
Portal + Popper(Floating UI) + DismissableLayer + FocusScope + Collection/Composite navigation
```

Do not use `@angular/cdk/menu` for new menu-family behavior.

Do not use `@angular/cdk/overlay` for new floating primitive surfaces when the existing local stack can
provide the required behavior.

Continue allowing `@angular/cdk/coercion` as a utility dependency. This ADR does not require removing
all Angular CDK usage from the repository.

`packages/primitives/menu` should become the single Base UI-aligned menu primitive. The older
`packages/primitives/dropdown-menu` entry point should either be removed in a breaking release or kept
temporarily as a deprecated compatibility layer around `menu`.

## Target Menu Anatomy

Align the preferred Angular API with Base UI Menu while preserving the project's directive-first,
headless model:

```html
<ng-container rdxMenuRoot>
  <button rdxMenuTrigger>Open</button>

  <ng-template rdxMenuPortal>
    <div rdxMenuPositioner>
      <div rdxMenuPopup>
        <button rdxMenuItem>New tab</button>
        <a rdxMenuLinkItem href="/settings">Settings</a>
        <div rdxMenuSeparator></div>

        <label rdxMenuCheckboxItem>
          <span rdxMenuCheckboxItemIndicator></span>
          Show bookmarks
        </label>
      </div>
    </div>
  </ng-template>
</ng-container>
```

Expected part mapping:

| Base UI part                 | Angular preferred part              |
| ---------------------------- | ----------------------------------- |
| `Menu.Root`                  | `ng-container[rdxMenuRoot]`         |
| `Menu.Trigger`               | `[rdxMenuTrigger]`                  |
| `Menu.Portal`                | `ng-template[rdxMenuPortal]`        |
| `Menu.Backdrop`              | `[rdxMenuBackdrop]`                 |
| `Menu.Positioner`            | `[rdxMenuPositioner]`               |
| `Menu.Popup`                 | `[rdxMenuPopup]`                    |
| `Menu.Viewport`              | `[rdxMenuViewport]`                 |
| `Menu.Arrow`                 | `[rdxMenuArrow]`                    |
| `Menu.Item`                  | `[rdxMenuItem]`                     |
| `Menu.LinkItem`              | `[rdxMenuLinkItem]`                 |
| `Menu.Group`                 | `[rdxMenuGroup]`                    |
| `Menu.GroupLabel`            | `[rdxMenuGroupLabel]`               |
| `Menu.Separator`             | `[rdxMenuSeparator]`                |
| `Menu.CheckboxItem`          | `[rdxMenuCheckboxItem]`             |
| `Menu.CheckboxItemIndicator` | `[rdxMenuCheckboxItemIndicator]`    |
| `Menu.RadioGroup`            | `[rdxMenuRadioGroup]`               |
| `Menu.RadioItem`             | `[rdxMenuRadioItem]`                |
| `Menu.RadioItemIndicator`    | `[rdxMenuRadioItemIndicator]`       |
| `Menu.SubmenuRoot`           | `ng-container[rdxMenuSubmenuRoot]`  |
| `Menu.SubmenuTrigger`        | `[rdxMenuSubmenuTrigger]`           |
| `Menu.SubmenuPortal`         | `ng-template[rdxMenuSubmenuPortal]` |
| `Menu.SubmenuPositioner`     | `[rdxMenuSubmenuPositioner]`        |
| `Menu.SubmenuPopup`          | `[rdxMenuSubmenuPopup]`             |

The exact selector names may be adjusted during implementation, but they should stay lowercase
`rdx...` selectors and should remain close to Base UI part names.

## Responsibilities by Primitive

Menu should compose existing primitives rather than reimplement their responsibilities:

| Responsibility                                 | Preferred owner                                     |
| ---------------------------------------------- | --------------------------------------------------- |
| trigger anchoring and Floating UI positioning  | `RdxPopper`, `RdxPopperContentWrapper`              |
| `data-side`, `data-align`, arrow positioning   | `RdxPopperContent`, `RdxPopperArrow`                |
| portal mounting                                | `RdxPortal` plus a high-level menu portal directive |
| outside pointer/focus, Escape, layer stack     | `RdxDismissableLayer`                               |
| focus lifecycle and focus restore hooks        | `RdxFocusScope`                                     |
| item registration in DOM order                 | `RdxCollectionProvider` or internal composite layer |
| menu keyboard navigation and typeahead         | `menu` / internal composite layer                   |
| checkbox and radio item selection              | `menu` item state contexts                          |
| submenu stack, hover delay, pointer grace area | `menu`                                              |

`RdxDismissableLayer` is not a full overlay replacement by itself. It should be used as the dismissal
and layering part of the popup. The overlay-like behavior is the composition of Portal, Popper,
DismissableLayer, FocusScope, and menu-specific state.

## Public API Impact

This is a breaking direction for `@radix-ng/primitives/dropdown-menu` if the entry point is removed.

If the library needs a migration window, keep `dropdown-menu` as a deprecated compatibility layer for
one release:

- re-export the new menu implementation where selectors and semantics can be preserved;
- document the replacement `@radix-ng/primitives/menu` API;
- avoid adding new features to `dropdown-menu`;
- remove `dropdown-menu` in the next major release.

If the project is still comfortable with immediate breaking changes, delete the `dropdown-menu`
secondary entry point and update docs, paths, stories, and package exports in the same change.

`@angular/cdk/menu` should be removed from menu-family production imports after migration.
`@angular/cdk/coercion` may remain.

## Migration Plan

1. Freeze `dropdown-menu` feature work and mark it as deprecated in docs.
2. Define the target `@radix-ng/primitives/menu` API and selectors around Base UI anatomy.
3. Add contract tests for Menu behavior before replacing CDK Menu:
   - trigger opens and closes;
   - outside pointer closes;
   - Escape closes only the topmost menu and restores focus;
   - ArrowUp / ArrowDown / Home / End move the highlighted item;
   - Enter / Space select the highlighted item;
   - disabled items are skipped and expose state attributes;
   - typeahead highlights matching items;
   - checkbox items toggle and emit state;
   - radio groups select exactly one item;
   - submenu opens and closes by keyboard;
   - submenu opens by pointer with delay and uses a pointer grace area;
   - `data-state`, `data-highlighted`, `data-disabled`, `data-side`, and `data-align` are exposed.
4. Implement menu root and trigger contexts without CDK Menu.
5. Compose `rdxMenuPositioner` and `rdxMenuPopup` from Popper, DismissableLayer, FocusScope, and
   collection/composite navigation.
6. Implement item, link item, separator, group, group label, checkbox item, and radio item state.
7. Implement submenu root, trigger, portal, positioner, popup, hover delay, and pointer grace area.
8. Rewrite Menu Storybook stories and docs using the project Story CSF / MDX templates and Tailwind
   shared demo styles.
9. Remove `@angular/cdk/menu` imports from `menu`, `dropdown-menu`, `context-menu`, and `menubar` when
   each package is migrated or removed.
10. Update installation/dependency docs only if peer dependencies change.

## Consequences

### Positive

- Menu anatomy becomes closer to Base UI.
- Floating primitives share the same local architecture instead of mixing CDK Overlay/Menu and
  Floating UI patterns.
- Positioning, collision metadata, dismissal, focus lifecycle, and portal behavior become consistent
  across Select, Popover, Tooltip, and Menu.
- The library can add Base UI menu features without depending on CDK Menu internals.
- The long-term dependency surface becomes smaller and easier to reason about.

### Negative / Risks

- Replacing CDK Menu means owning complex accessibility behavior.
- Keyboard navigation, typeahead, submenu behavior, and focus restore require thorough tests.
- A compatibility layer for `dropdown-menu` may temporarily increase maintenance cost.
- Removing `dropdown-menu` immediately is a breaking change.
- Reimplementing menu behavior prematurely without tests could regress accessibility.

## Alternatives Considered

### Keep Using Angular CDK Menu

This keeps mature keyboard behavior with less local code. It is not preferred because it locks menu
anatomy and behavior to CDK's model and diverges from the project's Base UI-aligned floating stack.

### Use Angular CDK Overlay without CDK Menu

This would remove CDK Menu while keeping CDK Overlay for portals and positioning. It is not preferred
because the project already has Popper, Portal, DismissableLayer, and FocusScope. Adding CDK Overlay
would create a second floating-surface architecture.

### Remove All Angular CDK Usage

This is broader than needed. `@angular/cdk/coercion` is a small utility dependency and does not own
runtime behavior. Removing it can be considered separately if the project later adopts local input
typing helpers.

### Keep `dropdown-menu` and `menu` as Separate Primitives

This preserves old imports but duplicates behavior and documentation. It is not preferred. A
compatibility layer is acceptable temporarily, but new behavior should live in `menu`.

## Open Questions

- Should `dropdown-menu` be deleted immediately or kept as deprecated aliases for one release?
- Should Menu use the future internal composite navigation layer from ADR 0001, or implement a narrow
  menu-specific navigation layer first?
- Should `context-menu` and `menubar` become wrappers around the same internal menu foundation?
- How much of Base UI's hover delay and pointer grace area should be implemented in the first pass?
- Should Menu support modal and non-modal modes in the first release, or defer non-modal behavior?

## Trigger for Revisit

Revisit this ADR before:

- adding new `@angular/cdk/menu` usage;
- introducing `@angular/cdk/overlay` into a new floating primitive;
- deleting `@radix-ng/primitives/dropdown-menu`;
- rewriting `@radix-ng/primitives/menu`;
- making a major release with menu-family breaking changes;
- changing Popper, Portal, DismissableLayer, or FocusScope contracts used by floating primitives.
