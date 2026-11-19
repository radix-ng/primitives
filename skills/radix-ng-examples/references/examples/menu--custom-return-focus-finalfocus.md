# Menu — Custom return focus (`finalFocus`)

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

When the menu closes, focus returns to the trigger by default. Bind `finalFocus` on `rdxMenuPopup` to
send it elsewhere instead — an element to focus, `false` to suppress return-focus, or a callback
receiving the close interaction type. This maps to the floating focus manager's `returnFocus` policy.

A callback returning `null` selects the standard return target: the trigger, or a surviving owner
when a submenu's parent has also closed. That callback remains an explicit focus request, including
after an outside click moved focus. Returning `undefined` or `false` skips return focus; a callback
without a return statement therefore skips it too. Forward Tab keeps its native destination, and
Shift+Tab still performs the menu's explicit return-navigation action.

An explicit element that has been removed cannot receive focus and does not select a fallback.
For a target that may disappear, resolve the current element in a callback and return `null` when it
is absent. For example, with a signal query: `finalFocus = () => this.returnTarget()?.nativeElement ?? null`.

Removing the entire Root with `@if` destroys its portals and releases background interaction and
scroll locking, including retained views and unfinished exits. Removal emits no additional close
request or completion for an unfinished exit. If the trigger is also removed, use `finalFocus` to
return to a surviving control outside that conditional block.

```html
<div [finalFocus]="afterElement" rdxMenuPopup>…</div>
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
