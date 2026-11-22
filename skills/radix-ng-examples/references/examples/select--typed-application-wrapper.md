# Select — Typed application wrapper

> One example from the [Select](../components/select.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

An application-owned component can extend `RdxSelectRoot<Value, Multiple>` and use
`provideRdxSelectRoot(YourSelect)` to rebind the primitive's context, floating-tree and form providers.
It inherits the inputs, cancellable events, CVA and Signal Forms contract; no second value store or
hand-written CVA is needed. Use `[multiple]="true"` or `[multiple]="false"` for precise mode inference.

The [wrapper source](https://github.com/radix-ng/primitives/blob/main/packages/primitives/select/stories/select-typed-control.ts)
owns only its rendering options, placeholder and Tailwind markup. This example uses it with typed
object values in Reactive Forms, Signal Forms and multiple selection, including reset.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';
import { RdxFieldLabel, RdxFieldRoot, RdxNgControlField } from '@radix-ng/primitives/field';
import { RdxSignalField } from '@radix-ng/primitives/signal-forms';
import { SelectTypedControl } from './select-typed-control';

export interface SelectCountry {
    code: string;
    name: string;
}

@Component({
    selector: 'select-typed-wrapper',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        SelectTypedControl,
        ReactiveFormsModule,
        FormField,
        RdxFieldRoot,
        RdxFieldLabel,
        RdxNgControlField,
        RdxSignalField
    ],
    template: `
        <form class="flex flex-col gap-6">
            <div class="flex flex-col gap-2" rdxFieldRoot>
                <label class="text-foreground text-sm font-medium" rdxFieldLabel>Reactive Forms country</label>
                <example-select
                    [options]="countries"
                    [formControl]="reactiveCountry"
                    [itemToStringLabel]="countryLabel"
                    [itemToStringValue]="countryCode"
                    [isItemEqualToValue]="sameCountry"
                    name="reactiveCountry"
                    rdxNgControlField
                />
                <output class="text-muted-foreground text-sm" data-testid="reactive-value">
                    {{ reactiveCountry.value?.code ?? 'none' }}
                </output>
            </div>
            <div class="flex flex-col gap-2" rdxFieldRoot>
                <label class="text-foreground text-sm font-medium" rdxFieldLabel>Signal Forms country</label>
                <example-select
                    [options]="countries"
                    [formField]="profileForm.country"
                    [itemToStringLabel]="countryLabel"
                    [itemToStringValue]="countryCode"
                    [isItemEqualToValue]="sameCountry"
                    rdxSignalField
                />
                <output class="text-muted-foreground text-sm" data-testid="signal-value">
                    {{ profile().country?.code ?? 'none' }}
                </output>
            </div>
            <div class="flex flex-col gap-2" rdxFieldRoot>
                <label class="text-foreground text-sm font-medium" rdxFieldLabel>Multiple countries</label>
                <example-select
                    [(value)]="selectedCountries"
                    [options]="countries"
                    [multiple]="true"
                    [itemToStringLabel]="countryLabel"
                    [itemToStringValue]="countryCode"
                    [isItemEqualToValue]="sameCountry"
                />
                <output class="text-muted-foreground text-sm" data-testid="multiple-value">
                    {{ selectedCodes() }}
                </output>
            </div>
            <button
                class="border-border text-foreground rounded-md border px-3 py-2 text-sm"
                (click)="reset()"
                type="button"
            >
                Reset countries
            </button>
        </form>
    `
})
export class SelectTypedWrapper {
    readonly countries: SelectCountry[] = [
        { code: 'fr', name: 'France' },
        { code: 'de', name: 'Germany' },
        { code: 'jp', name: 'Japan' }
    ];
    readonly countryLabel = (country: SelectCountry) => country.name;
    readonly countryCode = (country: SelectCountry) => country.code;
    readonly sameCountry = (a: SelectCountry, b: SelectCountry) => a.code === b.code;
    readonly reactiveCountry = new FormControl<SelectCountry | null>(this.countries[0]);
    readonly profile = signal<{ country: SelectCountry | null }>({ country: this.countries[0] });
    readonly profileForm = form(this.profile);
    readonly selectedCountries = signal<SelectCountry[] | undefined>([]);
    readonly selectedCodes = () => this.selectedCountries()?.map(this.countryCode).join(', ') || 'none';

    reset(): void {
        this.reactiveCountry.reset(this.countries[0]);
        this.profileForm().reset({ country: this.countries[0] });
        this.selectedCountries.set([]);
    }
}
```

The strict Angular AOT fixtures in `tools/typecheck/select` check both valid consumers and invalid
value, mode, label, event and Signal Forms bindings. Classic CVA bindings retain Angular's runtime
interface; `formControl` does not by itself infer or validate a custom control's generic value type.
Angular DI also does not connect an independently declared Item's generic to its parent Root. The
wrapper's `options: readonly Value[]` ties the collection to the public selection/callback types.
Internal part communication uses `unknown`; no `any` fallback is required. See
[ADR 0028](https://github.com/radix-ng/primitives/blob/main/docs/adr/0028-select-arbitrary-value-contract.md).

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
