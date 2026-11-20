# Checkbox — Labeling

> One example from the [Checkbox](../components/checkbox.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

Always associate a checkbox with a label. Link a sibling `rdxLabel` to the button with `htmlFor` / `id`:

```html
<div rdxCheckboxRoot>
  <button id="terms" rdxCheckboxButton>
    <svg *rdxCheckboxIndicatorPresence rdxCheckboxIndicator lucideCheck />
  </button>
  <input rdxCheckboxInput />
</div>
<label rdxLabel htmlFor="terms">Accept terms and conditions</label>
```

Inside `rdxFieldRoot`, use `rdxFieldLabel` and `rdxFieldDescription`. The label associates with the
button's ID automatically. The checkbox inherits the Field's native name, disabled and required
state. Supply `aria-labelledby` or `aria-label` on the button to override its accessible name.

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
