# Tabs — Mounting & unmounting

> One example from the [Tabs](../components/tabs.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

By default an inactive `rdxTabsPanel` stays in the DOM and is toggled with the `hidden` attribute. To
unmount the contents while inactive (Base UI's default `keepMounted: false`), nest a
`*rdxTabsPanelPresence` inside the panel — it mounts the contents only while the tab is active and waits
for any exit `@keyframes` to finish before removing them. Set `keepMounted` on the panel to keep the
contents mounted regardless.

```html
<!-- Unmount when inactive -->
<div rdxTabsPanel value="1">
    <div *rdxTabsPanelPresence>Panel 1</div>
</div>

<!-- Keep mounted (hidden) when inactive -->
<div rdxTabsPanel value="2" keepMounted>
    <div *rdxTabsPanelPresence>Panel 2</div>
</div>
```
