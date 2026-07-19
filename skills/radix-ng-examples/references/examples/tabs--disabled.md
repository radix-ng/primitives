# Tabs — Disabled

> One example from the [Tabs](../components/tabs.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

A disabled tab remains reachable by composite keyboard navigation, but it cannot be activated.

```html
<div class="${rootClass}" rdxTabsRoot defaultValue="account">
    <div class="${listClass}" rdxTabsList>
        <button class="${tabClass}" rdxTabsTab value="account">Account</button>
        <button class="${tabClass}" rdxTabsTab value="password" disabled>Password</button>
        <button class="${tabClass}" rdxTabsTab value="team">Team</button>
    </div>
    <div class="${panelClass}" rdxTabsPanel value="account">
        The Password tab is disabled. Arrow keys can focus it, but it cannot be activated.
    </div>
    <div class="${panelClass}" rdxTabsPanel value="password">
        Change your password here. After saving, you'll be logged out.
    </div>
    <div class="${panelClass}" rdxTabsPanel value="team">Invite teammates and manage their roles.</div>
</div>
```
