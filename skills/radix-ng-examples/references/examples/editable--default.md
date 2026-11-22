# Editable — Default

> One example from the [Editable](../components/editable.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

The preview above uses this standalone component. Copy the setup and shared files below as well.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxEditableArea,
    RdxEditableCancelTrigger,
    RdxEditableEditTrigger,
    RdxEditableInput,
    RdxEditablePreview,
    RdxEditableRoot,
    RdxEditableSubmitTrigger
} from '@radix-ng/primitives/editable';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'editable-default-example',
    imports: [
        RdxEditableRoot,
        RdxEditableArea,
        RdxEditablePreview,
        RdxEditableInput,
        RdxEditableEditTrigger,
        RdxEditableSubmitTrigger,
        RdxEditableCancelTrigger
    ],
    template: `
        <div
            class="flex w-[260px] flex-col gap-3"
            #root="rdxEditableRoot"
            rdxEditableRoot
            value="Click to edit"
            placeholder="Enter text…"
            submitMode="both"
        >
            <div rdxEditableArea>
                <span
                    class="demo-editable-preview data-[placeholder-shown]:text-muted-foreground demo-focus inline-block min-h-9 w-full px-3 py-1.5"
                    #preview="rdxEditablePreview"
                    rdxEditablePreview
                >
                    {{ root.value() || preview.placeholder() }}
                </span>
                <input class="demo-input h-9 w-full px-3" rdxEditableInput aria-label="Inline value" />
            </div>

            @if (!root.isEditing()) {
                <button class="demo-button demo-button-outline h-8 px-3 text-xs" rdxEditableEditTrigger>Edit</button>
            } @else {
                <div class="flex gap-2">
                    <button class="demo-button demo-button-primary h-8 px-3 text-xs" rdxEditableSubmitTrigger>
                        Save
                    </button>
                    <button class="demo-button demo-button-ghost h-8 px-3 text-xs" rdxEditableCancelTrigger>
                        Cancel
                    </button>
                </div>
            }
        </div>
    `
})
export class EditableDefaultExample {}
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
