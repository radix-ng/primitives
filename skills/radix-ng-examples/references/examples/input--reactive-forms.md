# Input — Reactive Forms

> One example from the [Input](../components/input.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Uses Angular reactive forms while Field reflects validation state.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
    RdxFieldDescription,
    RdxFieldError,
    RdxFieldLabel,
    RdxFieldRoot,
    RdxNgControlField
} from '@radix-ng/primitives/field';
import { RdxInputDirective } from '@radix-ng/primitives/input';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'input-reactive-forms-example',
    imports: [
        ReactiveFormsModule,
        RdxFieldRoot,
        RdxFieldLabel,
        RdxFieldDescription,
        RdxFieldError,
        RdxNgControlField,
        RdxInputDirective
    ],
    template: `
        <div class="flex w-80 flex-col gap-2" rdxFieldRoot required>
            <label class="text-foreground text-sm font-medium" rdxFieldLabel>Email</label>
            <input
                class="demo-input h-9 w-full px-3"
                [formControl]="email"
                rdxInput
                rdxNgControlField
                type="email"
                placeholder="name@example.com"
            />
            <p class="text-muted-foreground text-sm" rdxFieldDescription>Use the email connected to your account.</p>
            <p class="text-destructive text-sm" match="required" rdxFieldError>Email is required.</p>
            <p class="text-destructive text-sm" match="email" rdxFieldError>Enter a valid email address.</p>
        </div>
    `
})
export class InputReactiveFormsExample {
    readonly email = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] });
}
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
