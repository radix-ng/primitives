# Menu — Radio items

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

A radio group selects exactly one option. Selecting an item keeps the menu open (`closeOnClick`
defaults to `false` for radio items). Bind `[(value)]` for controlled state or use `defaultValue` for
uncontrolled state. Values may be strings, numbers, objects, or other types and are compared by identity.
Set `disabled` on the group to disable all of its radio items. A nested `rdxMenuGroupLabel`
automatically labels the group through `aria-labelledby`.

`defaultValue` is an initial fallback only when `value` is `undefined`. Explicit values, including
`null`, `false` and `0`, take precedence. Later default changes are ignored even when the group
started without a default; they do not replace a user's selection. Use `[(value)]` for asynchronous
or live application values. Both models retain Angular's normal writable and two-way binding behavior.

```html
<menu-radio-items-story />
```

## Setup and shared files

These examples use Angular standalone components and Tailwind CSS v4. Install
`@radix-ng/primitives` and `@lucide/angular`. Copy the component from **Show code** and any shared files below,
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
