# ADR 0003: Prefer a Base UI-like Popover Anatomy with a Template Portal Directive

- Status: Superseded by ADR-0010
- Date: 2026-06-03
- Decision owners: Radix NG maintainers
- Related: ADR 0010 (structural portal presence — shipped popover's Base UI anatomy under its redesign), `packages/primitives/popover`

> **Superseded by [ADR 0010](0010-structural-portal-presence.md) (2026-06-13).** The Base UI-like popover
> anatomy and template portal directive proposed here shipped — but under ADR 0010's structural
> `*rdxPopoverPortal` redesign, which removed the low-level `rdxPopoverPortalPresence` / element-portal
> split this ADR meant to preserve. ADR 0010 lists this ADR as Related and used popover as its pilot.

## Context

`@radix-ng/primitives/popover` is a headless Angular primitive aligned with Base UI. The current
functional API is directive-first and keeps the root virtual:

```html
<ng-container rdxPopoverRoot>
  <button rdxPopoverTrigger>Open</button>

  <ng-template rdxPopoverPortalPresence>
    <div rdxPopoverPortal>
      <div rdxPopoverPositioner>
        <div rdxPopoverPopup>...</div>
      </div>
    </div>
  </ng-template>
</ng-container>
```

This is layout-safe because `ng-container[rdxPopoverRoot]` creates no DOM box. It is also flexible
because the real DOM parts are directives, so consumers can choose semantic elements and wrapper
directives can compose them through Angular `hostDirectives`.

However, the portal layer is more verbose than the Base UI anatomy:

```tsx
<Popover.Root>
  <Popover.Trigger />
  <Popover.Portal>
    <Popover.Backdrop />
    <Popover.Positioner>
      <Popover.Popup />
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
```

In the current Angular API, one Base UI concept (`Popover.Portal`) is represented by two user-visible
parts:

- `ng-template[rdxPopoverPortalPresence]` for mount / unmount timing;
- `[rdxPopoverPortal]` on a real element for moving content to `document.body` or a custom container.

That split is useful as a low-level primitive, but it makes the default anatomy look more technical
than necessary.

## Decision

Add a preferred high-level `ng-template[rdxPopoverPortal]` API that combines presence and portal
mounting.

The preferred Popover anatomy should become:

```html
<ng-container rdxPopoverRoot>
  <button rdxPopoverTrigger>Open</button>

  <ng-template rdxPopoverPortal>
    <div rdxPopoverBackdrop></div>

    <div rdxPopoverPositioner>
      <div rdxPopoverPopup>
        <span rdxPopoverArrow></span>

        <div rdxPopoverViewport>
          <h2 rdxPopoverTitle>Title</h2>
          <p rdxPopoverDescription>Description</p>
          <button rdxPopoverClose>Close</button>
        </div>
      </div>
    </div>
  </ng-template>
</ng-container>
```

This maps to Base UI as follows:

| Base UI part          | Angular preferred part          |
| --------------------- | ------------------------------- |
| `Popover.Root`        | `ng-container[rdxPopoverRoot]`  |
| `Popover.Trigger`     | `[rdxPopoverTrigger]`           |
| `Popover.Portal`      | `ng-template[rdxPopoverPortal]` |
| `Popover.Backdrop`    | `[rdxPopoverBackdrop]`          |
| `Popover.Positioner`  | `[rdxPopoverPositioner]`        |
| `Popover.Popup`       | `[rdxPopoverPopup]`             |
| `Popover.Arrow`       | `[rdxPopoverArrow]`             |
| `Popover.Viewport`    | `[rdxPopoverViewport]`          |
| `Popover.Title`       | `[rdxPopoverTitle]`             |
| `Popover.Description` | `[rdxPopoverDescription]`       |
| `Popover.Close`       | `[rdxPopoverClose]`             |

Do not replace the real DOM parts with Angular components as the default API. Components would make the
anatomy visually closer to React, but they would reduce headless flexibility because consumers could no
longer freely choose host elements or compose primitive parts with `hostDirectives`.

## Proposed API Shape

The existing low-level API remains available:

```html
<ng-template rdxPopoverPortalPresence>
  <div rdxPopoverPortal>...</div>
</ng-template>
```

The new preferred API should be:

```html
<ng-template rdxPopoverPortal>...</ng-template>
```

`ng-template[rdxPopoverPortal]` should:

- read the current `RdxPopoverRoot` context;
- mount only while the popover is open;
- keep content mounted through CSS exit animation completion, matching `RdxPresenceDirective`;
- portal the instantiated content to `document.body` by default;
- accept the same custom portal container input as the current low-level `[rdxPopoverPortal]` directive;
- expose the same portal state attributes where applicable.

The current `[rdxPopoverPortal]` selector on real elements should stay available as a low-level escape
hatch for consumers that need to control presence and portal movement separately.

## Public API Impact

The initial implementation should be non-breaking.

Keep these APIs exported:

- `RdxPopoverPortalPresence`
- `RdxPopoverPortal` on real elements
- all existing Popover part directives

After adding `ng-template[rdxPopoverPortal]`, update docs and stories to show the new preferred
anatomy. `rdxPopoverPortalPresence` can be documented as an advanced / low-level primitive rather than
removed.

A future deprecation of `rdxPopoverPortalPresence` should only be considered after the new template
portal API has been released and validated.

## Consequences

### Positive

- The default Angular anatomy more closely mirrors Base UI without sacrificing headless flexibility.
- `Popover.Root` remains layout-neutral via `ng-container[rdxPopoverRoot]`.
- Real DOM parts remain directives and can still be applied to semantic user-chosen elements.
- Wrapper directives can continue to compose Popover parts through `hostDirectives`.
- The most technical portal boilerplate disappears from examples and documentation.

### Negative / Risks

- `RdxPopoverPortal` would become overloaded across two selectors: real elements and `ng-template`.
- The implementation must avoid confusing the low-level portal directive with the high-level template
  portal directive.
- Tests must cover custom containers, exit animations, state attributes, and cleanup for both APIs.
- Documentation must clearly explain that `ng-template[rdxPopoverPortal]` is the preferred default and
  `rdxPopoverPortalPresence` is advanced.

## Alternatives Considered

### Keep the Current API

This avoids implementation work and preserves maximum explicitness. It leaves a user-facing mismatch
where one Base UI part maps to two Angular parts.

### Introduce Component Parts

Components such as `<rdx-popover-root>` and `<rdx-popover-portal>` would look closer to React, but they
would introduce DOM hosts or fixed element choices. This is not a good default for this library because
the primitives are intentionally headless and directive-composable.

### Use a Real Element for `rdxPopoverRoot`

Using `<div rdxPopoverRoot>` would look simpler but would make `Popover.Root` affect layout. This
conflicts with Base UI's virtual root semantics and can break flex, grid, inline layout, spacing, and
consumer selectors. The preferred root should stay `ng-container[rdxPopoverRoot]`.

### Rename the High-level Directive

A separate name such as `rdxPopoverTemplatePortal` would avoid selector overloading, but it would move
the preferred anatomy farther away from Base UI's `Popover.Portal` naming. Reconsider only if selector
overloading proves too confusing in implementation.

## Migration Plan

1. Add a high-level `ng-template[rdxPopoverPortal]` directive that combines presence and portal behavior.
2. Keep the existing `ng-template[rdxPopoverPortalPresence]` plus real-element `[rdxPopoverPortal]` path.
3. Add tests for open / close mounting, exit animation waiting, custom containers, cleanup, and state
   attributes.
4. Update Popover stories and docs to use `ng-template[rdxPopoverPortal]` as the preferred anatomy.
5. Document the low-level split API as advanced usage.
6. Revisit whether `rdxPopoverPortalPresence` should be deprecated after the new API has been used in
   examples for at least one release.

## Trigger for Revisit

Revisit this ADR before:

- changing Popover portal / presence behavior;
- adding component-based Popover anatomy;
- deprecating `rdxPopoverPortalPresence`;
- applying the same anatomy pattern to Tooltip, Select, Menu, or other portaled primitives.
