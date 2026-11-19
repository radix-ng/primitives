# Fieldset — Default

> One example from the [Fieldset](../components/fieldset.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

A fieldset groups related Field and Input primitives under one native legend.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RdxFieldDescription, RdxFieldError, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFieldsetLegend, RdxFieldsetRoot } from '@radix-ng/primitives/fieldset';
import { RdxInputDirective } from '@radix-ng/primitives/input';

@Component({
    host: { class: 'contents' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'rdx-fieldset-default-example',
    imports: [
        ReactiveFormsModule,
        RdxFieldDescription,
        RdxFieldError,
        RdxFieldLabel,
        RdxFieldRoot,
        RdxInputDirective,
        RdxFieldsetLegend,
        RdxFieldsetRoot
    ],
    template: `
        <fieldset class="border-border w-80 space-y-4 rounded-md border p-4" rdxFieldsetRoot>
            <legend class="text-foreground px-1 text-sm font-semibold" rdxFieldsetLegend>Shipping address</legend>

            <div class="space-y-2" rdxFieldRoot required>
                <label class="text-foreground text-sm font-medium" rdxFieldLabel>Street address</label>
                <input class="demo-input h-9 w-full px-3" rdxInput autocomplete="shipping street-address" />
                <p class="text-muted-foreground text-sm" rdxFieldDescription>Used to calculate delivery options.</p>
                <p class="text-destructive text-sm" rdxFieldError>Street address is required.</p>
            </div>

            <div class="space-y-2" rdxFieldRoot>
                <label class="text-foreground text-sm font-medium" rdxFieldLabel>Apartment</label>
                <input class="demo-input h-9 w-full px-3" rdxInput autocomplete="shipping address-line2" />
            </div>
        </fieldset>
    `
})
export class FieldsetDefaultStory {}
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
