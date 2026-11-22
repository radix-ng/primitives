# Radio Group — Default

> One example from the [Radio Group](../components/radio.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

A radio group with labels, hidden native inputs and an animated indicator.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { injectId } from '@radix-ng/primitives/core';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import {
    RdxRadioGroupDirective,
    RdxRadioIndicatorDirective,
    RdxRadioIndicatorPresenceDirective,
    RdxRadioItemDirective,
    RdxRadioItemInputDirective
} from '@radix-ng/primitives/radio';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'radio-default-example',
    template: `
        <form>
            <div class="flex flex-col gap-2.5" rdxRadioRoot name="density" aria-label="View density">
                @for (option of options; track option.value) {
                    <label class="flex items-center gap-3" rdxLabel>
                        <span
                            class="demo-radio-item demo-focus flex size-6 items-center justify-center disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                            [value]="option.value"
                            [aria-labelledby]="labelId + '-' + option.value"
                            rdxRadioItem
                        >
                            <span
                                class="bg-primary size-2.5 rounded-full motion-safe:transition-[opacity,scale] motion-safe:duration-150 motion-safe:data-[ending-style]:scale-50 motion-safe:data-[ending-style]:opacity-0 motion-safe:data-[starting-style]:scale-50 motion-safe:data-[starting-style]:opacity-0 motion-safe:starting:scale-50 motion-safe:starting:opacity-0"
                                *rdxRadioIndicatorPresence
                                rdxRadioIndicator
                            ></span>
                            <input rdxRadioItemInput />
                        </span>
                        <span class="demo-label" [id]="labelId + '-' + option.value">{{ option.label }}</span>
                    </label>
                }
            </div>
        </form>
    `,
    imports: [
        RdxLabelDirective,
        RdxRadioItemDirective,
        RdxRadioItemInputDirective,
        RdxRadioIndicatorDirective,
        RdxRadioIndicatorPresenceDirective,
        RdxRadioGroupDirective
    ]
})
export class RadioDefaultComponent {
    protected readonly labelId = injectId('radio-density-label-');
    protected readonly options = [
        { value: 'default', label: 'Default' },
        { value: 'comfortable', label: 'Comfortable' },
        { value: 'compact', label: 'Compact' }
    ];
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
