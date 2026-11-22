# Editable — Auto-resize

> One example from the [Editable](../components/editable.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

With `autoResize`, the preview and input overlay in a single grid cell, so the field grows to fit its
content. The parts carry `[data-auto-resize]` for styling.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxEditableArea, RdxEditableInput, RdxEditablePreview, RdxEditableRoot } from '@radix-ng/primitives/editable';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'editable-auto-resize-example',
    imports: [RdxEditableRoot, RdxEditableArea, RdxEditablePreview, RdxEditableInput],
    template: `
        <div
            #root="rdxEditableRoot"
            rdxEditableRoot
            value="Type to grow"
            placeholder="Enter text…"
            autoResize
            submitMode="both"
        >
            <div [class]="area" rdxEditableArea>
                <span #preview="rdxEditablePreview" rdxEditablePreview>
                    {{ root.value() || preview.placeholder() }}
                </span>
                <input rdxEditableInput aria-label="Inline value" />
            </div>
        </div>
    `
})
export class EditableAutoResizeExample {
    // Auto-resize strips the input's native chrome, so the frame lives on the area.
    protected readonly area = [
        'rounded-md border border-border px-3 py-1.5 text-sm text-foreground',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background'
    ].join(' ');
}
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
