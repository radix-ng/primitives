# Field — Default

> One example from the [Field](../components/field.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

The root owns the relationships between the field parts.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxFieldControl,
    RdxFieldDescription,
    RdxFieldError,
    RdxFieldLabel,
    RdxFieldRoot
} from '@radix-ng/primitives/field';

import { fieldDescription, fieldError, fieldLabel } from './field.shared';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'field-default-example',
    imports: [RdxFieldRoot, RdxFieldLabel, RdxFieldControl, RdxFieldDescription, RdxFieldError],
    template: `
        <div class="flex w-80 flex-col gap-2" rdxFieldRoot required>
            <label [class]="labelClass" rdxFieldLabel>Email</label>
            <input
                class="border-border bg-background text-foreground placeholder:text-muted-foreground h-9 w-full rounded-md border px-3 text-sm outline-none"
                rdxFieldControl
                type="email"
                placeholder="name@example.com"
            />
            <p [class]="descriptionClass" rdxFieldDescription>Used for account notifications.</p>
            <p [class]="errorClass" rdxFieldError>Enter a valid email address.</p>
        </div>
    `
})
export class FieldDefaultExample {
    protected readonly labelClass = fieldLabel;
    protected readonly descriptionClass = fieldDescription;
    protected readonly errorClass = fieldError;
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

#### `./field.shared.ts`

```typescript
export const fieldLabel = 'text-foreground text-sm font-medium data-[disabled]:opacity-50';
export const fieldDescription = 'text-muted-foreground text-sm';
export const fieldError = 'text-destructive text-sm';

export const fieldInputInvalid =
    'demo-input h-9 w-full px-3 data-[invalid]:border-destructive data-[invalid]:ring-destructive/20';

export const fieldCustomTrigger =
    'demo-input h-9 w-full px-3 inline-flex items-center text-left data-[filled]:text-foreground data-[focused]:ring-2 data-[focused]:ring-ring';

export const fieldSubmitButton = 'demo-button demo-button-primary h-9 px-4 self-start';
```
