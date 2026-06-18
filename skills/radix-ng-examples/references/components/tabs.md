# Tabs

#### A set of layered sections of content—known as tab panels—that are displayed one at a time.

```html
<div class="${rootClass}" rdxTabsRoot defaultValue="account">
    <div class="${listClass}" rdxTabsList>
        <button class="${tabClass}" rdxTabsTab value="account">Account</button>
        <button class="${tabClass}" rdxTabsTab value="password">Password</button>
    </div>
    <div class="${panelClass}" rdxTabsPanel value="account">
        Make changes to your account here. Click save when you're done.
    </div>
    <div class="${panelClass}" rdxTabsPanel value="password">
        Change your password here. After saving, you'll be logged out.
    </div>
</div>
```

## Features

- ✅ Can be controlled or uncontrolled.
- ✅ Supports horizontal and vertical orientation.
- ✅ Supports automatic (on focus) and manual activation.
- ✅ Full keyboard navigation with roving focus.
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

## Change events

`onValueChange` emits `{ value, eventDetails }`. Use `eventDetails.cancel()` to reject a tab
activation before the selected value changes.

```html
<div [value]="value()" (onValueChange)="setValue($event)" rdxTabsRoot>
    ...
</div>
```

```ts
setValue(change: RdxTabsValueChangeEvent) {
    if (this.hasUnsavedChanges()) {
        change.eventDetails.cancel();
        return;
    }

    this.value.set(change.value);
}
```

## Examples

### Activate on focus

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

### Vertical

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

### Disabled

A tab with the `disabled` attribute cannot be focused or activated.

```html
<div class="${rootClass}" rdxTabsRoot defaultValue="account">
    <div class="${listClass}" rdxTabsList>
        <button class="${tabClass}" rdxTabsTab value="account">Account</button>
        <button class="${tabClass}" rdxTabsTab value="password" disabled>Password</button>
        <button class="${tabClass}" rdxTabsTab value="team">Team</button>
    </div>
    <div class="${panelClass}" rdxTabsPanel value="account">
        The Password tab is disabled and cannot be focused or activated.
    </div>
    <div class="${panelClass}" rdxTabsPanel value="password">
        Change your password here. After saving, you'll be logged out.
    </div>
    <div class="${panelClass}" rdxTabsPanel value="team">Invite teammates and manage their roles.</div>
</div>
```

### Indicator

`RdxTabsIndicator` exposes the active tab's geometry as CSS variables, so a single element can animate to
follow the selected tab.

```typescript
import { Component } from '@angular/core';
import { RdxTabsIndicator, RdxTabsList, RdxTabsPanel, RdxTabsRoot, RdxTabsTab } from '@radix-ng/primitives/tabs';

@Component({
    selector: 'tabs-indicator-example',
    imports: [RdxTabsRoot, RdxTabsList, RdxTabsTab, RdxTabsPanel, RdxTabsIndicator],
    template: `
        <div
            class="border-border bg-background text-foreground w-[460px] overflow-hidden rounded-xl border shadow-sm"
            rdxTabsRoot
            defaultValue="overview"
        >
            <div class="border-border bg-muted/30 relative flex border-b" rdxTabsList>
                <button
                    class="text-muted-foreground hover:text-foreground data-[active]:text-foreground focus-visible:ring-ring relative inline-flex h-11 items-center justify-center px-5 text-sm font-medium transition-colors outline-none focus-visible:ring-2"
                    rdxTabsTab
                    value="overview"
                >
                    Overview
                </button>
                <button
                    class="text-muted-foreground hover:text-foreground data-[active]:text-foreground focus-visible:ring-ring relative inline-flex h-11 items-center justify-center px-5 text-sm font-medium transition-colors outline-none focus-visible:ring-2"
                    rdxTabsTab
                    value="activity"
                >
                    Activity
                </button>
                <button
                    class="text-muted-foreground hover:text-foreground data-[active]:text-foreground focus-visible:ring-ring relative inline-flex h-11 items-center justify-center px-5 text-sm font-medium transition-colors outline-none focus-visible:ring-2"
                    rdxTabsTab
                    value="settings"
                >
                    Settings
                </button>
                <span
                    class="bg-primary absolute bottom-0 left-[var(--active-tab-left)] h-0.5 w-[var(--active-tab-width)] transition-all duration-300 ease-out"
                    rdxTabsIndicator
                ></span>
            </div>
            <div class="bg-background text-foreground p-6 text-sm leading-6 outline-none" rdxTabsPanel value="overview">
                A high-level summary of your workspace and recent highlights.
            </div>
            <div class="bg-background text-foreground p-6 text-sm leading-6 outline-none" rdxTabsPanel value="activity">
                Everything that happened recently, in reverse chronological order.
            </div>
            <div class="bg-background text-foreground p-6 text-sm leading-6 outline-none" rdxTabsPanel value="settings">
                Configure preferences, members, and integrations for this workspace.
            </div>
        </div>
    `
})
export class TabsIndicatorExample {}
```

### Animated panels

Panels stay mounted by default, so you can cross-fade them with the `data-starting-style`,
`data-ending-style` and `data-hidden` attributes — the panel keeps itself visible until the transition
finishes.

```typescript
import { Component } from '@angular/core';
import { RdxTabsList, RdxTabsPanel, RdxTabsRoot, RdxTabsTab } from '@radix-ng/primitives/tabs';

@Component({
    selector: 'tabs-animated-example',
    imports: [RdxTabsRoot, RdxTabsList, RdxTabsTab, RdxTabsPanel],
    // Panels stay mounted and cross-fade using the transition-status data attributes:
    // `data-starting-style` (enter), `data-ending-style` (exit) and `data-hidden` drive the opacity,
    // while the panel keeps itself visible until the transition finishes.
    template: `
        <div
            class="border-border bg-background text-foreground w-[420px] overflow-hidden rounded-xl border shadow-sm"
            rdxTabsRoot
            defaultValue="account"
        >
            <div class="border-border bg-muted/30 flex border-b" rdxTabsList>
                <button
                    class="text-muted-foreground hover:text-foreground data-[active]:text-foreground data-[active]:bg-background focus-visible:ring-ring inline-flex h-10 items-center justify-center px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-2 data-[active]:shadow-[inset_0_-2px_0_0_var(--primary)]"
                    rdxTabsTab
                    value="account"
                >
                    Account
                </button>
                <button
                    class="text-muted-foreground hover:text-foreground data-[active]:text-foreground data-[active]:bg-background focus-visible:ring-ring inline-flex h-10 items-center justify-center px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-2 data-[active]:shadow-[inset_0_-2px_0_0_var(--primary)]"
                    rdxTabsTab
                    value="password"
                >
                    Password
                </button>
            </div>
            <div class="grid">
                <div
                    class="bg-background text-foreground col-start-1 row-start-1 p-6 text-sm leading-6 opacity-100 transition-opacity duration-300 ease-out outline-none data-[ending-style]:opacity-0 data-[hidden]:opacity-0 data-[starting-style]:opacity-0"
                    rdxTabsPanel
                    value="account"
                >
                    Make changes to your account here. Click save when you're done.
                </div>
                <div
                    class="bg-background text-foreground col-start-1 row-start-1 p-6 text-sm leading-6 opacity-100 transition-opacity duration-300 ease-out outline-none data-[ending-style]:opacity-0 data-[hidden]:opacity-0 data-[starting-style]:opacity-0"
                    rdxTabsPanel
                    value="password"
                >
                    Change your password here. After saving, you'll be logged out.
                </div>
            </div>
        </div>
    `
})
export class TabsAnimatedExample {}
```

### Mounting & unmounting

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

### Unmount with `@keyframes`

With `*rdxTabsPanelPresence`, the presence directive waits for the contents' exit **animation**
(`@keyframes`, detected via `animationend`) before removing them. Mark the panel as a `group` so the
inner element can react to the parent's `data-hidden` and run the exit keyframes — the contents leave
the DOM once the animation finishes.

```typescript
import { Component } from '@angular/core';
import { RdxTabsList, RdxTabsPanel, RdxTabsPanelPresence, RdxTabsRoot, RdxTabsTab } from '@radix-ng/primitives/tabs';

@Component({
    selector: 'tabs-keyframes-example',
    imports: [RdxTabsRoot, RdxTabsList, RdxTabsTab, RdxTabsPanel, RdxTabsPanelPresence],
    // The panel contents are mounted only while the tab is active (`*rdxTabsPanelPresence`).
    // On enter the inner element plays `tabs-panel-in`; when the tab is left, the parent panel gets
    // `data-hidden`, so `group-data-[hidden]:animate-tabs-panel-out` runs the exit `@keyframes` and
    // the presence directive waits for `animationend` before unmounting.
    template: `
        <div
            class="border-border bg-background text-foreground w-[420px] overflow-hidden rounded-xl border shadow-sm"
            rdxTabsRoot
            defaultValue="account"
        >
            <div class="border-border bg-muted/30 flex border-b" rdxTabsList>
                <button
                    class="text-muted-foreground hover:text-foreground data-[active]:text-foreground data-[active]:bg-background focus-visible:ring-ring inline-flex h-10 items-center justify-center px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-2 data-[active]:shadow-[inset_0_-2px_0_0_var(--primary)]"
                    rdxTabsTab
                    value="account"
                >
                    Account
                </button>
                <button
                    class="text-muted-foreground hover:text-foreground data-[active]:text-foreground data-[active]:bg-background focus-visible:ring-ring inline-flex h-10 items-center justify-center px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-2 data-[active]:shadow-[inset_0_-2px_0_0_var(--primary)]"
                    rdxTabsTab
                    value="password"
                >
                    Password
                </button>
            </div>
            <div class="grid">
                <div class="group col-start-1 row-start-1" rdxTabsPanel value="account">
                    <div
                        class="bg-background text-foreground animate-tabs-panel-in group-data-[hidden]:animate-tabs-panel-out p-6 text-sm leading-6 outline-none"
                        *rdxTabsPanelPresence
                    >
                        Make changes to your account here. Click save when you're done.
                    </div>
                </div>
                <div class="group col-start-1 row-start-1" rdxTabsPanel value="password">
                    <div
                        class="bg-background text-foreground animate-tabs-panel-in group-data-[hidden]:animate-tabs-panel-out p-6 text-sm leading-6 outline-none"
                        *rdxTabsPanelPresence
                    >
                        Change your password here. After saving, you'll be logged out.
                    </div>
                </div>
            </div>
        </div>
    `
})
export class TabsKeyframesExample {}
```

## API Reference

### TabsRoot

`RdxTabsRoot` — groups the tabs and their panels.

| Data attribute              | Value                                           |
| --------------------------- | ----------------------------------------------- |
| `[data-orientation]`        | `"horizontal" \| "vertical"`                    |
| `[data-activation-direction]` | `"left" \| "right" \| "up" \| "down" \| "none"` |

### TabsList

`RdxTabsList` — groups the tab buttons and owns roving keyboard focus.

| Data attribute                | Value                                           |
| ----------------------------- | ----------------------------------------------- |
| `[data-orientation]`          | `"horizontal" \| "vertical"`                    |
| `[data-activation-direction]` | `"left" \| "right" \| "up" \| "down" \| "none"` |

### TabsTab

`RdxTabsTab` — an interactive button that activates its panel.

| Data attribute                | Value                                           |
| ----------------------------- | ----------------------------------------------- |
| `[data-active]`               | Present when the tab is active.                 |
| `[data-disabled]`             | Present when the tab is disabled.               |
| `[data-orientation]`          | `"horizontal" \| "vertical"`                    |
| `[data-activation-direction]` | `"left" \| "right" \| "up" \| "down" \| "none"` |

### TabsPanel

`RdxTabsPanel` — content shown when its tab is active.

| Data attribute                | Value                                           |
| ----------------------------- | ----------------------------------------------- |
| `[data-hidden]`               | Present when the panel is inactive.             |
| `[data-index]`                | Numeric index of the panel.                     |
| `[data-starting-style]`       | Present while the enter transition runs.        |
| `[data-ending-style]`         | Present while the exit transition runs.         |
| `[data-orientation]`          | `"horizontal" \| "vertical"`                    |
| `[data-activation-direction]` | `"left" \| "right" \| "up" \| "down" \| "none"` |

### TabsPanelPresence

`*rdxTabsPanelPresence` — a structural directive placed inside an `rdxTabsPanel` that mounts the panel
contents only while active and unmounts them after the exit animation. It has no inputs; mount state is
read from the parent panel.

### TabsIndicator

`RdxTabsIndicator` — reads everything from context; it has no inputs. It exposes the following CSS
variables on its host element:

| CSS variable           | Description                          |
| ---------------------- | ------------------------------------ |
| `--active-tab-top`     | Distance from the top of the list.   |
| `--active-tab-right`   | Distance from the right of the list. |
| `--active-tab-bottom`  | Distance from the bottom of the list.|
| `--active-tab-left`    | Distance from the left of the list.  |
| `--active-tab-width`   | Width of the active tab.             |
| `--active-tab-height`  | Height of the active tab.            |

## Accessibility

Adheres to the [Tabs WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs).

### Keyboard Interactions

| Key          | Description                                                                                          |
| ------------ | --------------------------------------------------------------------------------------------------- |
| `Tab`        | Moves focus onto the active tab. From a tab, moves focus to the active panel.                        |
| `ArrowDown`  | (Vertical) Moves focus to the next tab.                                                              |
| `ArrowRight` | (Horizontal) Moves focus to the next tab.                                                            |
| `ArrowUp`    | (Vertical) Moves focus to the previous tab.                                                          |
| `ArrowLeft`  | (Horizontal) Moves focus to the previous tab.                                                        |
| `Home`       | Moves focus to the first tab.                                                                        |
| `End`        | Moves focus to the last tab.                                                                         |
| `Enter` / `Space` | Activates the focused tab (always, and the only way to activate when `activateOnFocus` is off). |
