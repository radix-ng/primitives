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

## Setup and shared files

These examples use Angular standalone components and Tailwind CSS v4. Install
`@radix-ng/primitives`. Copy the component from **Show code** and any shared files below,
preserving their relative import paths. Import the example component in its parent and use its selector.

Install `tailwindcss`, `@tailwindcss/postcss` and `postcss`. Configure the PostCSS plugin:

```json
{ "plugins": { "@tailwindcss/postcss": {} } }
```

Save the CSS below as `demo-styles.css` next to your global stylesheet. Import Tailwind first,
then the demo styles. Both Storybook and Playground use this same CSS through `main.css`.

```css
@import 'tailwindcss';
@import './demo-styles.css';
```

The shared file supplies theme values, light/dark tokens, common classes and animation keyframes.
Set `data-theme="dark"` on `<html>` for the dark theme; the default is light. The font stacks have
system fallbacks; Inter and JetBrains Mono can be self-hosted for the Storybook typography.

<details>
<summary>demo-styles.css</summary>

[Download demo-styles.css](../demo-styles.css)

</details>
