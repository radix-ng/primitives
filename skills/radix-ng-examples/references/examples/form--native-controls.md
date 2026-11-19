# Form — Native controls

> One example from the [Form](../components/form.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

No `@angular/forms` at all — a valid submit serializes the form's `FormData` into a plain values object
(repeated names collapse into arrays).

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxFieldControl, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFormRoot, RdxFormSubmitEvent } from '@radix-ng/primitives/form';
import { formField, formInput, formLabel, formSubmit } from './form.shared';

/**
 * No `@angular/forms` at all — just native controls. On a valid submit the Form serializes the form's
 * `FormData` into a plain values object (repeated `name`s collapse into arrays).
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'form-native-controls-example',
    imports: [RdxFormRoot, RdxFieldRoot, RdxFieldLabel, RdxFieldControl],
    template: `
        <form class="flex w-80 flex-col gap-4" (onFormSubmit)="onSubmit($event)" rdxFormRoot>
            <div [class]="field" name="name" rdxFieldRoot>
                <label [class]="label" rdxFieldLabel>Name</label>
                <input [class]="input" name="name" rdxFieldControl value="Ada" />
            </div>
            <div [class]="field" name="role" rdxFieldRoot>
                <label [class]="label" rdxFieldLabel>Role</label>
                <input [class]="input" name="role" rdxFieldControl value="Engineer" />
            </div>

            <button [class]="submit" type="submit">Submit</button>
            @if (values()) {
                <pre class="bg-muted text-foreground rounded-md p-3 text-xs">{{ values() }}</pre>
            }
        </form>
    `
})
export class FormNativeControlsExample {
    protected readonly field = formField;
    protected readonly label = formLabel;
    protected readonly input = formInput;
    protected readonly submit = formSubmit;

    readonly values = signal<string | null>(null);

    onSubmit(event: RdxFormSubmitEvent): void {
        this.values.set(JSON.stringify(event.values, null, 2));
    }
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

#### `./form.shared.ts`

```typescript
export interface AccountFormValue {
    username: string;
    email: string;
}

export const initialAccountValue = (): AccountFormValue => ({ username: '', email: '' });
export const unavailableUsername = 'admin';
export const takenEmail = 'taken@example.com';
export const simulateFormRequest = (duration = 500): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, duration));

export const formField = 'flex flex-col gap-1.5';
export const formLabel = 'text-foreground text-sm font-medium';
export const formError = 'text-destructive text-sm';
export const formInput =
    'demo-input h-9 w-full px-3 data-[invalid]:border-destructive data-[invalid]:ring-destructive/30';
export const formSubmit = 'demo-button demo-button-primary h-9 px-4 self-start';
export const formReset = 'demo-button demo-button-outline h-9 px-4';
```
