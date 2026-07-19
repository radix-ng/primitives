# Tabs

A set of layered sections of content—known as tab panels—that are displayed one at a time.

> Index — full source of each example is one click away in `../examples/tabs--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Can be controlled or uncontrolled.
- ✅ Supports horizontal and vertical orientation.
- ✅ Supports automatic (on focus) and manual activation.
- ✅ Full keyboard navigation with composite focus.
- ✅ Optional active-tab indicator driven by CSS variables.
- ✅ Panels can stay mounted (and animate) or unmount when inactive.

## Import

```typescript
import {
    RdxTabsRoot,
    RdxTabsList,
    RdxTabsTab,
    RdxTabsPanel,
    RdxTabsPanelPresence,
    RdxTabsIndicator
} from '@radix-ng/primitives/tabs';
```

The aligned API follows [Base UI Tabs](https://base-ui.com/react/components/tabs): `Root` → `List` → `Tab`,
plus a `Panel` per value and an optional `Indicator`.

## Anatomy

```html
<div rdxTabsRoot>
    <div rdxTabsList>
        <button rdxTabsTab value="1"></button>
        <button rdxTabsTab value="2"></button>
        <span rdxTabsIndicator></span>
    </div>
    <div rdxTabsPanel value="1"></div>
    <div rdxTabsPanel value="2"></div>
</div>
```

## Examples

- [Activate on focus](../examples/tabs--activate-on-focus.md)
- [Vertical](../examples/tabs--vertical.md)
- [Disabled](../examples/tabs--disabled.md)
- [Indicator](../examples/tabs--indicator.md)
- [Animated panels](../examples/tabs--animated-panels.md)
- [Mounting & unmounting](../examples/tabs--mounting-unmounting.md)
- [Unmount with `@keyframes`](../examples/tabs--unmount-with-keyframes.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/tabs.json`
- Styling (parts + `data-*`): `references/styling-contract/tabs.json`
