# Select — Labels and control ids

> One example from the [Select](../components/select.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

Place `rdxSelectLabel` inside Root to name the trigger automatically. It supports both a native
`<label>` and ordinary markup such as `<div>`. Clicking label text focuses the trigger without
opening the popup; nested interactive elements keep their own behavior.

Set `id` on Root to identify the trigger. Root forwards it without duplicating it on a separate
root element, and `rdxSelectLabel` derives its id as `<root-id>-label`. Customize the label id through
Root, not a separate `id` on Label. An explicit Trigger `id` overrides the forwarded control id;
removing an override restores its fallback. Container roots (`ng-container`) and Root/Trigger on
the same button are supported.

`rdxFieldLabel` remains the native label for a surrounding Field. The most recently registered live
label in a Field supplies its accessible name; removing it restores the preceding label. Explicit
`aria-labelledby` on Trigger takes precedence. Select.Label also reflects Field's validation and
interaction attributes.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { RdxAutocompleteInput, RdxAutocompleteLabel, RdxAutocompleteRoot } from '@radix-ng/primitives/autocomplete';
import { RdxComboboxInput, RdxComboboxLabel, RdxComboboxRoot } from '@radix-ng/primitives/combobox';
import { RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import {
    RdxSelectItem,
    RdxSelectItemIndicator,
    RdxSelectItemText,
    RdxSelectLabel,
    RdxSelectList,
    RdxSelectPopup,
    RdxSelectPortal,
    RdxSelectPositioner,
    RdxSelectRoot,
    RdxSelectTrigger,
    RdxSelectValue
} from '@radix-ng/primitives/select';
import { SelectTypedControl } from './select-typed-control';

@Component({
    selector: 'select-labels',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RdxSelectRoot,
        RdxSelectPortal,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPopup,
        RdxSelectList,
        RdxSelectLabel,
        RdxSelectItemIndicator,
        RdxSelectItem,
        RdxSelectItemText,
        RdxSelectPositioner,
        LucideCheck,
        LucideChevronDown,
        SelectTypedControl,
        RdxFieldRoot,
        RdxFieldLabel,
        RdxComboboxRoot,
        RdxComboboxLabel,
        RdxComboboxInput,
        RdxAutocompleteRoot,
        RdxAutocompleteLabel,
        RdxAutocompleteInput
    ],
    template: `
        <div class="grid w-64 gap-6">
            <div class="grid gap-2" id="labelled-country" rdxSelectRoot>
                <div class="text-foreground flex items-center justify-between text-sm font-medium" rdxSelectLabel>
                    Country
                    <button class="text-muted-foreground text-xs underline" (click)="help.set(!help())" type="button">
                        Help
                    </button>
                </div>
                @if (help()) {
                    <p class="text-muted-foreground text-xs">Choose the country you live in.</p>
                }
                <button
                    class="demo-select-trigger data-[placeholder]:text-muted-foreground data-[invalid]:border-destructive data-[invalid]:aria-invalid:ring-destructive/30 demo-focus inline-flex min-h-9 w-full items-center justify-between gap-2 px-3 py-1.5 disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                    rdxSelectTrigger
                >
                    <span #display="rdxSelectedValue" rdxSelectValue placeholder="Choose a country">
                        {{ display.slotText() }}
                    </span>
                    <svg class="size-4 shrink-0" lucideChevronDown size="16" aria-hidden="true" />
                </button>
                <div class="z-[100]" *rdxSelectPortal [sideOffset]="4" rdxSelectPositioner>
                    <div
                        class="demo-select-popup min-w-[var(--anchor-width,10rem)] will-change-[opacity,transform]"
                        rdxSelectPopup
                    >
                        <div class="p-1" rdxSelectList>
                            @for (country of countries; track country) {
                                <div
                                    class="demo-select-item data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[disabled]:text-muted-foreground relative flex min-h-7 items-center gap-2 ps-6 pe-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                    [value]="country"
                                    rdxSelectItem
                                >
                                    <span
                                        class="absolute start-0 inline-flex w-6 items-center justify-center"
                                        rdxSelectItemIndicator
                                        aria-hidden="true"
                                    >
                                        <svg class="size-4 shrink-0" lucideCheck size="16" aria-hidden="true" />
                                    </span>
                                    <span rdxSelectItemText>{{ country }}</span>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div class="grid gap-2" rdxFieldRoot>
                <label class="text-foreground text-sm font-medium" rdxFieldLabel>Billing country</label>
                <example-select id="billing-country" [options]="countries" />
            </div>
            <div class="grid gap-2" rdxComboboxRoot>
                <div class="text-foreground text-sm font-medium" rdxComboboxLabel>City</div>
                <input class="demo-input h-9 w-full px-3" rdxComboboxInput placeholder="Search cities" />
            </div>
            <div class="grid gap-2" rdxAutocompleteRoot>
                <div class="text-foreground text-sm font-medium" rdxAutocompleteLabel>Search tags</div>
                <input class="demo-input h-9 w-full px-3" rdxAutocompleteInput placeholder="Type a tag" />
            </div>
        </div>
    `
})
export class SelectLabels {
    readonly help = signal(false);
    readonly countries = ['France', 'Japan', 'United Kingdom'];
}
```

Label registration and interaction behavior live in `core`, shared by Field, Select and Combobox;
Autocomplete inherits the Combobox label through directive composition. The example retains the
existing Angular support for labeling an outside Combobox/Autocomplete input. Current upstream's
Combobox.Label targets a trigger; sharing this helper does not establish complete Combobox part parity.

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

#### `./select-typed-control.ts`

```typescript
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import {
    provideRdxSelectRoot,
    RdxSelectItem,
    RdxSelectItemIndicator,
    RdxSelectItemText,
    RdxSelectList,
    RdxSelectPopup,
    RdxSelectPortal,
    RdxSelectPositioner,
    RdxSelectRoot,
    RdxSelectTrigger,
    RdxSelectValue
} from '@radix-ng/primitives/select';

/** Application-owned markup; all state, events and form bindings are inherited from the primitive. */
@Component({
    selector: 'example-select',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [provideRdxSelectRoot(SelectTypedControl)],
    imports: [
        LucideCheck,
        LucideChevronDown,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPortal,
        RdxSelectPositioner,
        RdxSelectPopup,
        RdxSelectList,
        RdxSelectItem,
        RdxSelectItemText,
        RdxSelectItemIndicator
    ],
    template: `
        <button
            class="demo-select-trigger data-[placeholder]:text-muted-foreground data-[invalid]:border-destructive data-[invalid]:aria-invalid:ring-destructive/30 demo-focus inline-flex min-h-9 w-64 items-center justify-between gap-2 px-3 py-1.5 disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
            rdxSelectTrigger
        >
            <span #display="rdxSelectedValue" [placeholder]="placeholder()" rdxSelectValue>
                {{ display.slotText() }}
            </span>
            <svg class="size-4 shrink-0" lucideChevronDown size="16" aria-hidden="true" />
        </button>
        <div class="z-[100]" *rdxSelectPortal [sideOffset]="4" align="start" rdxSelectPositioner>
            <div
                class="demo-select-popup min-w-[var(--anchor-width,10rem)] will-change-[opacity,transform]"
                rdxSelectPopup
            >
                <div class="p-1" rdxSelectList>
                    @for (option of options(); track option) {
                        <div
                            class="demo-select-item data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[disabled]:text-muted-foreground relative flex min-h-7 items-center gap-2 ps-6 pe-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                            [value]="option"
                            rdxSelectItem
                        >
                            <span
                                class="absolute start-0 inline-flex w-6 items-center justify-center"
                                aria-hidden="true"
                                rdxSelectItemIndicator
                            >
                                <svg class="size-4 shrink-0" lucideCheck size="16" aria-hidden="true" />
                            </span>
                            <span rdxSelectItemText>{{ itemToStringLabel()?.(option) ?? option }}</span>
                        </div>
                    }
                </div>
            </div>
        </div>
    `
})
export class SelectTypedControl<Value = unknown, Multiple extends boolean = false> extends RdxSelectRoot<
    Value,
    Multiple
> {
    readonly options = input.required<readonly Value[]>();
    readonly placeholder = input('Select an option');
}
```
