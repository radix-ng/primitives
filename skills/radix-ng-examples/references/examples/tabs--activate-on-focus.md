# Tabs — Activate on focus

> One example from the [Tabs](../components/tabs.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

Set `activateOnFocus` on the list to activate a tab as soon as it receives keyboard focus (automatic
activation). By default activation is manual — tabs activate on click or `Enter` / `Space`.

```html
<div class="${rootClass}" rdxTabsRoot defaultValue="account">
    <div class="${listClass}" rdxTabsList activateOnFocus>
        <button class="${tabClass}" rdxTabsTab value="account">Account</button>
        <button class="${tabClass}" rdxTabsTab value="password">Password</button>
        <button class="${tabClass}" rdxTabsTab value="team">Team</button>
    </div>
    <div class="${panelClass}" rdxTabsPanel value="account">
        Tabs activate as soon as they receive keyboard focus.
    </div>
    <div class="${panelClass}" rdxTabsPanel value="password">
        Change your password here. After saving, you'll be logged out.
    </div>
    <div class="${panelClass}" rdxTabsPanel value="team">Invite teammates and manage their roles.</div>
</div>
```
