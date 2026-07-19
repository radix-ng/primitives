# Tabs — Vertical

> One example from the [Tabs](../components/tabs.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

Set `orientation="vertical"` on the root to lay the tabs out vertically and switch arrow-key navigation
to `ArrowUp` / `ArrowDown`.

```html
<div class="${rootClass} flex w-[520px]" rdxTabsRoot defaultValue="account" orientation="vertical">
    <div class="border-border bg-muted/30 flex w-40 shrink-0 flex-col border-r" rdxTabsList>
        <button class="${tabClass} justify-start" rdxTabsTab value="account">Account</button>
        <button class="${tabClass} justify-start" rdxTabsTab value="password">Password</button>
        <button class="${tabClass} justify-start" rdxTabsTab value="team">Team</button>
    </div>
    <div class="${panelClass} flex-1" rdxTabsPanel value="account">
        Make changes to your account here. Click save when you're done.
    </div>
    <div class="${panelClass} flex-1" rdxTabsPanel value="password">
        Change your password here. After saving, you'll be logged out.
    </div>
    <div class="${panelClass} flex-1" rdxTabsPanel value="team">
        Invite teammates and manage their roles.
    </div>
</div>
```
