# Tabs — Mounting & unmounting

> One example from the [Tabs](../components/tabs.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

An ordinary `rdxTabsPanel` stays in the DOM and is hidden while inactive. Apply
`*rdxTabsPanelPresence="value"` to the panel host to create only the active Panel view and destroy
the complete view after its exit finishes. Its Angular children are destroyed as well; returning
creates new children. The structural directive supplies the value to `rdxTabsPanel`.
Use `keepMounted: true` on the structural directive to retain the whole view and its child state.

```html
<!-- Unmount when inactive -->
<div *rdxTabsPanelPresence="'one'" rdxTabsPanel>Panel one</div>

<!-- Keep mounted (hidden) when inactive -->
<div *rdxTabsPanelPresence="'two'; keepMounted: true" rdxTabsPanel>Panel two</div>
```
