# Checkbox

#### A control that allows the user to toggle between checked and not checked.

```html
<div class="flex items-center gap-3">
    <div rdxCheckboxRoot ${argsToTemplate(args)} [checked]="true">
        <button id="checkbox-1" [class]="c.button" rdxCheckboxButton>
            <svg [class]="c.indicator" rdxCheckboxIndicator size="16" lucideCheck />
        </button>
        <input rdxCheckboxInput />
    </div>
    <label class="text-foreground flex items-center text-sm font-medium" rdxLabel htmlFor="checkbox-1">
        Accept terms and conditions.
    </label>
</div>
```

## Features

- ✅ Full keyboard navigation.
- ✅ Supports indeterminate state.
- ✅ Can be controlled or uncontrolled.
- ✅ Native form submission with an optional native input for constraint validation.
- ✅ Base UI state hooks: `data-checked`, `data-unchecked`, and `data-indeterminate`.

## Import

```typescript
import {
  RdxCheckboxRootDirective,
  RdxCheckboxButtonDirective,
  RdxCheckboxIndicatorDirective,
  RdxCheckboxInputDirective
} from '@radix-ng/primitives/checkbox';
```

## Anatomy

Assemble the root, button trigger, and indicator. The native input is optional.

```html
<div rdxCheckboxRoot>
  <button rdxCheckboxButton>
    <svg rdxCheckboxIndicator lucideCheck />
  </button>
  <input rdxCheckboxInput />
</div>
```

A named root participates in `FormData` even without `[rdxCheckboxInput]`. Include the input when you
also need native constraint validation or mirrored native input/change events.

## Examples

### Labeling

Always associate a checkbox with a label. Link a sibling `rdxLabel` to the button with `htmlFor` / `id`:

```html
<div rdxCheckboxRoot>
  <button id="terms" rdxCheckboxButton>
    <svg rdxCheckboxIndicator lucideCheck />
  </button>
  <input rdxCheckboxInput />
</div>
<label rdxLabel htmlFor="terms">Accept terms and conditions</label>
```

Inside a `rdxFieldRoot`, use `rdxFieldLabel` instead — it wires the association and the shared
invalid / disabled / required state automatically (see the form examples below).

### Change events

`onCheckedChange` emits `{ checked, eventDetails }`; `rdxCheckboxGroup` emits `{ value, eventDetails }`.
Call `eventDetails.cancel()` before updating controlled state to reject a change.

```html
<div [checked]="checked()" (onCheckedChange)="setChecked($event)" rdxCheckboxRoot>
  ...
</div>
```

```ts
setChecked(change: RdxCheckboxCheckedChangeEvent) {
  if (this.readOnlyPolicy()) {
    change.eventDetails.cancel();
    return;
  }

  this.checked.set(change.checked);
}
```

### Indeterminate

The third "mixed" state. Clicking a checkbox in the indeterminate state resolves it to checked.

```typescript
import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, model } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { RdxCheckboxButtonDirective } from '@radix-ng/primitives/checkbox';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { cn, demoButton, demoCheckbox } from '../../storybook/styles';
import { RdxCheckboxIndicatorDirective } from '../src/checkbox-indicator';
import { RdxCheckboxInputDirective } from '../src/checkbox-input';
import { RdxCheckboxRootDirective } from '../src/checkbox-root';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'checkbox-indeterminate-example',
    imports: [
        RdxLabelDirective,
        RdxCheckboxRootDirective,
        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        LucideDynamicIcon,
        RdxCheckboxInputDirective,
        JsonPipe
    ],
    template: `
        <div class="flex items-center gap-3">
            <div
                [checked]="checked()"
                [indeterminate]="indeterminate()"
                (onCheckedChange)="checked.set($event.checked); indeterminate.set(false)"
                rdxCheckboxRoot
            >
                <button id="r1" [class]="c.button" rdxCheckboxButton>
                    <svg [class]="c.indicator" [lucideIcon]="iconName()" rdxCheckboxIndicator size="16" />
                </button>
                <input rdxCheckboxInput />
            </div>
            <label class="text-foreground flex items-center text-sm font-medium" rdxLabel htmlFor="r1">
                I'm a checkbox
            </label>
        </div>

        <section class="text-muted-foreground mt-3 text-sm">
            <p>checked:&nbsp;{{ checked() | json }}</p>
            <p>indeterminate:&nbsp;{{ indeterminate() | json }}</p>
        </section>

        <button [class]="cn(b.base, b.primary, b.size.md, 'mt-3')" (click)="toggleIndeterminate()" type="button">
            Toggle Indeterminate state
        </button>
    `
})
export class CheckboxIndeterminate {
    readonly checked = model<boolean>(false);
    readonly indeterminate = model<boolean>(false);

    // `checked` and `indeterminate` are orthogonal; the mixed state takes visual priority.
    readonly iconName = computed(() => (this.indeterminate() ? 'minus' : 'check'));

    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly c = demoCheckbox;

    toggleIndeterminate() {
        this.indeterminate.update((value) => !value);
    }
}
```

### Keep mounted

The indicator is removed from layout when unchecked. Add `keepMounted` to keep it in the DOM for
CSS transitions or measurement, matching Base UI's `Checkbox.Indicator keepMounted` prop.

```typescript
import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { LucideCheck as Check, LucideDynamicIcon } from '@lucide/angular';
import { RdxCheckboxButtonDirective } from '@radix-ng/primitives/checkbox';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { demoCheckbox } from '../../storybook/styles';
import { RdxCheckboxIndicatorDirective } from '../src/checkbox-indicator';
import { RdxCheckboxInputDirective } from '../src/checkbox-input';
import { RdxCheckboxRootDirective } from '../src/checkbox-root';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'checkbox-keep-mounted-example',
    imports: [
        RdxLabelDirective,
        RdxCheckboxRootDirective,
        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        RdxCheckboxInputDirective,
        LucideDynamicIcon,
        JsonPipe
    ],
    template: `
        <div class="flex items-center gap-3">
            <div [checked]="checked()" (onCheckedChange)="checked.set($event.checked)" rdxCheckboxRoot>
                <button id="r1" [class]="c.button" rdxCheckboxButton>
                    <svg [class]="c.indicator" [lucideIcon]="Check" keepMounted rdxCheckboxIndicator size="16" />
                </button>
                <input rdxCheckboxInput />
            </div>
            <label class="text-foreground flex items-center text-sm font-medium" rdxLabel htmlFor="r1">
                I'm a checkbox
            </label>
        </div>

        <section class="text-muted-foreground mt-3 text-sm">
            <p>checked state:&nbsp;{{ checked() | json }}</p>
        </section>
    `
})
export class CheckboxKeepMountedExample {
    readonly checked = model<boolean>(false);
    protected readonly Check = Check;
    protected readonly c = demoCheckbox;
}
```

### Template-driven forms

Two-way bind the root with `[(ngModel)]`.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideCheck } from '@lucide/angular';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { demoCheckbox } from '../../storybook/styles';
import { RdxCheckboxButtonDirective } from '../src/checkbox-button';
import { RdxCheckboxIndicatorDirective } from '../src/checkbox-indicator';
import { RdxCheckboxInputDirective } from '../src/checkbox-input';
import { RdxCheckboxRootDirective } from '../src/checkbox-root';

/**
 * Template-driven forms: two-way bind the root with `[(ngModel)]`.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'checkbox-ngmodel-example',
    imports: [
        FormsModule,
        RdxLabelDirective,
        RdxCheckboxRootDirective,
        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        RdxCheckboxInputDirective,
        LucideCheck
    ],
    template: `
        <div class="flex items-center gap-3">
            <div [(ngModel)]="subscribed" rdxCheckboxRoot>
                <button id="sub" [class]="c.button" rdxCheckboxButton>
                    <svg [class]="c.indicator" rdxCheckboxIndicator size="16" lucideCheck />
                </button>
                <input rdxCheckboxInput />
            </div>
            <label class="text-foreground text-sm font-medium" rdxLabel htmlFor="sub">
                Subscribe to the newsletter
            </label>
        </div>

        <p class="text-muted-foreground mt-3 text-sm">subscribed: {{ subscribed }}</p>
    `
})
export class CheckboxNgModelExample {
    protected readonly c = demoCheckbox;

    subscribed = false;
}
```

### Reactive forms

Bind the root with `formControlName`; `disabled` reacts to the control's enable/disable state.

```typescript
import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LucideCheck } from '@lucide/angular';
import { RdxCheckboxButtonDirective } from '@radix-ng/primitives/checkbox';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { cn, demoButton, demoCheckbox } from '../../storybook/styles';
import { RdxCheckboxIndicatorDirective } from '../src/checkbox-indicator';
import { RdxCheckboxInputDirective } from '../src/checkbox-input';
import { RdxCheckboxRootDirective } from '../src/checkbox-root';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'checkbox-groups-forms-example',
    template: `
        <section [formGroup]="personality">
            <div class="flex items-center gap-3 pb-3">
                <div rdxCheckboxRoot formControlName="fun">
                    <button id="r1" [class]="c.button" rdxCheckboxButton>
                        <svg [class]="c.indicator" rdxCheckboxIndicator size="16" lucideCheck />
                    </button>
                    <input rdxCheckboxInput />
                </div>
                <label class="text-foreground flex items-center text-sm font-medium" rdxLabel htmlFor="r1">Fun</label>
            </div>

            <div class="flex items-center gap-3 pb-3">
                <div rdxCheckboxRoot formControlName="serious">
                    <button id="r2" [class]="c.button" rdxCheckboxButton>
                        <svg [class]="c.indicator" rdxCheckboxIndicator size="16" lucideCheck />
                    </button>
                    <input rdxCheckboxInput />
                </div>
                <label class="text-foreground flex items-center text-sm font-medium" rdxLabel htmlFor="r2">
                    Serious
                </label>
            </div>

            <div class="flex items-center gap-3 pb-3">
                <div rdxCheckboxRoot formControlName="smart" form="smart">
                    <button id="r3" [class]="c.button" rdxCheckboxButton>
                        <svg [class]="c.indicator" rdxCheckboxIndicator size="16" lucideCheck />
                    </button>
                    <input rdxCheckboxInput />
                </div>
                <label class="text-foreground flex items-center text-sm font-medium" rdxLabel htmlFor="r3">Smart</label>
            </div>
        </section>

        <section class="text-muted-foreground mb-3 flex items-center text-sm" [formGroup]="personality">
            <h4 class="font-medium">You chose:&nbsp;</h4>
            {{ personality.value | json }}
        </section>

        <button [class]="cn(b.base, b.primary, b.size.md)" (click)="toggleDisable()" type="button">
            Toggle disabled state
        </button>
    `,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        JsonPipe,
        RdxLabelDirective,
        RdxCheckboxRootDirective,
        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        LucideCheck,
        RdxCheckboxInputDirective
    ]
})
export class CheckboxReactiveFormsExampleComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly c = demoCheckbox;

    private readonly formBuilder = inject(FormBuilder);

    personality = this.formBuilder.group({
        fun: false,
        serious: false,
        smart: false
    });

    toggleDisable() {
        const checkbox = this.personality.get('serious');
        if (checkbox != null) {
            checkbox.disabled ? checkbox.enable() : checkbox.disable();
        }
    }
}
```

### Validation

`Validators.requiredTrue` enforces acceptance; the error shows once the field is touched and submit is guarded.

```typescript
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideCheck } from '@lucide/angular';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { cn, demoButton, demoCheckbox } from '../../storybook/styles';
import { RdxCheckboxButtonDirective } from '../src/checkbox-button';
import { RdxCheckboxIndicatorDirective } from '../src/checkbox-indicator';
import { RdxCheckboxInputDirective } from '../src/checkbox-input';
import { RdxCheckboxRootDirective } from '../src/checkbox-root';

/**
 * Reactive forms with validation: `Validators.requiredTrue` forces the box to be
 * ticked, the error shows after the field is touched, and submit is guarded.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'checkbox-validation-example',
    imports: [
        ReactiveFormsModule,
        RdxLabelDirective,
        RdxCheckboxRootDirective,
        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        RdxCheckboxInputDirective,
        LucideCheck
    ],
    template: `
        <form class="flex flex-col gap-3" [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="flex items-center gap-3">
                <div rdxCheckboxRoot formControlName="terms">
                    <button id="terms" [class]="c.button" rdxCheckboxButton>
                        <svg [class]="c.indicator" rdxCheckboxIndicator size="16" lucideCheck />
                    </button>
                    <input rdxCheckboxInput />
                </div>
                <label class="text-foreground text-sm font-medium" rdxLabel htmlFor="terms">
                    I accept the terms and conditions
                </label>
            </div>

            @if (form.controls.terms.invalid && form.controls.terms.touched) {
                <p class="text-destructive text-sm">You must accept the terms to continue.</p>
            }

            <button [class]="cn(b.base, b.primary, b.size.md, 'self-start')" type="submit">Submit</button>

            @if (submitted()) {
                <p class="text-muted-foreground text-sm">Submitted ✓</p>
            }
        </form>
    `
})
export class CheckboxValidationExample {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly c = demoCheckbox;

    private readonly formBuilder = inject(FormBuilder);

    readonly form = this.formBuilder.group({
        terms: this.formBuilder.control(false, Validators.requiredTrue)
    });

    readonly submitted = signal(false);

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.controls.terms.markAsTouched();
            return;
        }
        this.submitted.set(true);
    }
}
```

There are two ways to build a "select all" parent. Pick by how much you want to own:

|                                  | **Select all** (below)                | **Checkbox group**                                                  |
| -------------------------------- | ------------------------------------- | ------------------------------------------------------------------- |
| Source of truth                  | your own model (one boolean per item) | the group's `string[]` value (the checked child values)            |
| Parent / indeterminate logic     | written by hand in the component      | built in (`parent` + `allValues`)                                   |
| Parent click                     | flat toggle: all ↔ none               | remembers the partial selection: partial → all → none → partial     |
| Disabled child during select-all | you handle it                         | preserved automatically                                             |
| Forms integration                | wire each control yourself            | the group is one control (`[(value)]` / `ngModel` / reactive forms) |

Reach for **Select all** when you already manage the items yourself and just need the derived parent
state. Reach for the **Checkbox group** when you want the array value and the Base UI parent behavior
for free.

### Select all

A parent checkbox derived from its children — `indeterminate` when only some are checked. Here the
parent/child logic (and the flat all ↔ none toggle) is wired **by hand** in the component.

```typescript
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { LucideCheck, LucideDynamicIcon } from '@lucide/angular';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { demoCheckbox } from '../../storybook/styles';
import { RdxCheckboxButtonDirective } from '../src/checkbox-button';
import { RdxCheckboxIndicatorDirective } from '../src/checkbox-indicator';
import { RdxCheckboxInputDirective } from '../src/checkbox-input';
import { CheckedState, RdxCheckboxRootDirective } from '../src/checkbox-root';

interface Item {
    id: string;
    label: string;
    checked: boolean;
}

/**
 * A "select all" parent whose state is derived from its children: checked when
 * all are ticked, `indeterminate` when only some are, unchecked otherwise.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'checkbox-select-all-example',
    imports: [
        RdxLabelDirective,
        RdxCheckboxRootDirective,
        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        RdxCheckboxInputDirective,
        LucideDynamicIcon,
        LucideCheck
    ],
    template: `
        <div class="flex flex-col gap-3">
            <div class="flex items-center gap-3">
                <div
                    [checked]="parentState() === true"
                    [indeterminate]="parentState() === 'indeterminate'"
                    (onCheckedChange)="toggleAll($event)"
                    rdxCheckboxRoot
                >
                    <button id="all" [class]="c.button" rdxCheckboxButton>
                        <svg
                            [class]="c.indicator"
                            [lucideIcon]="parentState() === 'indeterminate' ? 'minus' : 'check'"
                            rdxCheckboxIndicator
                            size="16"
                        />
                    </button>
                    <input rdxCheckboxInput />
                </div>
                <label class="text-foreground text-sm font-medium" rdxLabel htmlFor="all">Select all</label>
            </div>

            <div class="ml-6 flex flex-col gap-3">
                @for (item of items(); track item.id) {
                    <div class="flex items-center gap-3">
                        <div [checked]="item.checked" (onCheckedChange)="toggleItem(item.id, $event)" rdxCheckboxRoot>
                            <button [class]="c.button" [id]="item.id" rdxCheckboxButton>
                                <svg [class]="c.indicator" rdxCheckboxIndicator size="16" lucideCheck />
                            </button>
                            <input rdxCheckboxInput />
                        </div>
                        <label class="text-foreground text-sm font-medium" [htmlFor]="item.id" rdxLabel>
                            {{ item.label }}
                        </label>
                    </div>
                }
            </div>
        </div>
    `
})
export class CheckboxSelectAllExample {
    protected readonly c = demoCheckbox;

    readonly items = signal<Item[]>([
        { id: 'apples', label: 'Apples', checked: true },
        { id: 'bananas', label: 'Bananas', checked: false },
        { id: 'cherries', label: 'Cherries', checked: false }
    ]);

    protected readonly parentState = computed<CheckedState>(() => {
        const items = this.items();
        if (items.every((item) => item.checked)) {
            return true;
        }
        return items.some((item) => item.checked) ? 'indeterminate' : false;
    });

    protected toggleAll(change: { checked: boolean }): void {
        // Clicking the parent resolves indeterminate -> checked (tick all),
        // or checked -> unchecked (clear all).
        this.items.update((items) => items.map((item) => ({ ...item, checked: change.checked })));
    }

    protected toggleItem(id: string, change: { checked: boolean }): void {
        this.items.update((items) =>
            items.map((item) => (item.id === id ? { ...item, checked: change.checked } : item))
        );
    }
}
```

### Checkbox group

The same UI, but `rdxCheckboxGroup` owns it. It manages a single array value — the `value`s of the
checked checkboxes — and a child marked `parent` becomes the "select all", with its state derived
from `allValues`. Clicking the parent **remembers the partial selection** (partial → all → none →
back to the partial), disabled-but-checked children are preserved, and the group is itself a form
control, so `[(value)]`, `ngModel`, and reactive forms bind to the `string[]` value. For native forms,
put `name` on the group; selected children become repeated entries under that name. A child `name`
still works as a compatibility fallback when its `value` is omitted.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideDynamicIcon } from '@lucide/angular';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { demoCheckbox } from '../../storybook/styles';
import { RdxCheckboxButtonDirective } from '../src/checkbox-button';
import { RdxCheckboxGroupDirective } from '../src/checkbox-group';
import { RdxCheckboxIndicatorDirective } from '../src/checkbox-indicator';
import { RdxCheckboxRootDirective } from '../src/checkbox-root';

/**
 * `rdxCheckboxGroup` holds the array of checked values. Each child participates by its `value`, and
 * the checkbox marked `parent` becomes a "select all" whose state (checked / indeterminate /
 * unchecked) is derived from `allValues` — no manual wiring.
 *
 * Try the parent from a partial selection: it cycles partial → all → none → back to your partial
 * selection, instead of a flat all/none toggle.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'checkbox-group-example',
    imports: [
        RdxLabelDirective,
        RdxCheckboxGroupDirective,
        RdxCheckboxRootDirective,
        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        LucideDynamicIcon,
        LucideCheck
    ],
    template: `
        <div class="flex flex-col gap-3" #group="rdxCheckboxGroup" [(value)]="value" [allValues]="all" rdxCheckboxGroup>
            <div class="flex items-center gap-3">
                <div parent rdxCheckboxRoot>
                    <button id="all" [class]="c.button" rdxCheckboxButton>
                        <svg
                            [class]="c.indicator"
                            [lucideIcon]="group.parentState() === 'indeterminate' ? 'minus' : 'check'"
                            rdxCheckboxIndicator
                            size="16"
                        />
                    </button>
                </div>
                <label class="text-foreground text-sm font-medium" rdxLabel htmlFor="all">Select all</label>
            </div>

            <div class="ml-6 flex flex-col gap-3">
                @for (item of items; track item.value) {
                    <div class="flex items-center gap-3">
                        <div [value]="item.value" rdxCheckboxRoot>
                            <button [class]="c.button" [id]="item.value" rdxCheckboxButton>
                                <svg [class]="c.indicator" rdxCheckboxIndicator size="16" lucideCheck />
                            </button>
                        </div>
                        <label class="text-foreground text-sm font-medium" [htmlFor]="item.value" rdxLabel>
                            {{ item.label }}
                        </label>
                    </div>
                }
            </div>
        </div>
    `
})
export class CheckboxGroupExample {
    protected readonly c = demoCheckbox;

    protected readonly items = [
        { value: 'apples', label: 'Apples' },
        { value: 'bananas', label: 'Bananas' },
        { value: 'cherries', label: 'Cherries' }
    ];

    protected readonly all = this.items.map((item) => item.value);

    value = signal<string[]>(['apples']);
}
```

## API Reference

### Root

`RdxCheckboxRootDirective` — groups the parts and owns the checked / indeterminate state and form wiring. Apply to a container element (typically a `<div>`).

**Data attributes**

| Attribute            | Present when                        |
| -------------------- | ----------------------------------- |
| `data-checked`       | The checkbox is checked.            |
| `data-unchecked`     | The checkbox is unchecked.          |
| `data-indeterminate` | The checkbox is in the mixed state. |
| `data-disabled`      | The checkbox is disabled.           |
| `data-readonly`      | The checkbox is read-only.          |
| `data-required`      | The checkbox is required.           |

### Button

`RdxCheckboxButtonDirective` — the toggle control; reads everything from the root context, so it takes no inputs. Apply to a native `<button>` element (the selector requires `button`).

**Data attributes**

| Attribute            | Present when                        |
| -------------------- | ----------------------------------- |
| `data-checked`       | The checkbox is checked.            |
| `data-unchecked`     | The checkbox is unchecked.          |
| `data-indeterminate` | The checkbox is in the mixed state. |
| `data-disabled`      | The checkbox is disabled.           |
| `data-readonly`      | The checkbox is read-only.          |
| `data-required`      | The checkbox is required.           |

### Indicator

`RdxCheckboxIndicatorDirective` — renders the check / indeterminate mark; removed from the DOM when unchecked unless `keepMounted`. Apply to the indicator element (the Anatomy uses an `<svg>` icon).

**Data attributes**

| Attribute             | Present when                             |
| --------------------- | ---------------------------------------- |
| `data-checked`        | The checkbox is checked.                 |
| `data-unchecked`      | The checkbox is unchecked.               |
| `data-indeterminate`  | The checkbox is in the mixed state.      |
| `data-disabled`       | The checkbox is disabled.                |
| `data-readonly`       | The checkbox is read-only.               |
| `data-required`       | The checkbox is required.                |
| `data-starting-style` | The indicator is visible (enter motion). |
| `data-ending-style`   | The indicator is hidden (exit motion).   |

### Input

`RdxCheckboxInputDirective` — an optional hidden native input for constraint validation and mirrored
native input/change events. FormData serialization works from a named root without it. The directive
reads everything from the root context and takes no inputs.

### Checkbox Group

`RdxCheckboxGroupDirective` (`rdxCheckboxGroup`) — a `role="group"` container holding the array of
checked child values. Mark a child checkbox `parent` to make it select/deselect every value in
`allValues`. A named group serializes selected values as repeated native form entries.

**Data attributes**

| Attribute       | Present when           |
| --------------- | ---------------------- |
| `data-disabled` | The group is disabled. |

## Accessibility

Adheres to the [tri-state Checkbox WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox).

### Keyboard Interactions

| Key     | Description                   |
| ------- | ----------------------------- |
| `Space` | Checks/unchecks the checkbox. |
