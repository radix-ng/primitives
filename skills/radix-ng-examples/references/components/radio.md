# Radio Group

#### A set of checkable buttons—known as radio buttons—where no more than one of the buttons can be checked at a time.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import {
    RdxRadioGroupDirective,
    RdxRadioIndicatorDirective,
    RdxRadioItemDirective,
    RdxRadioItemInputDirective
} from '@radix-ng/primitives/radio';
import { demoRadio } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'radio-default-example',
    template: `
        <form>
            <div [class]="r.group" rdxRadioRoot name="density" aria-label="View density">
                <label [class]="r.row" rdxLabel>
                    <span [class]="r.item" rdxRadioItem value="default">
                        <span [class]="r.indicator" rdxRadioIndicator></span>
                        <input rdxRadioItemInput />
                    </span>
                    <span [class]="r.label">Default</span>
                </label>
                <label [class]="r.row" rdxLabel>
                    <span [class]="r.item" rdxRadioItem value="comfortable">
                        <span [class]="r.indicator" rdxRadioIndicator></span>
                        <input rdxRadioItemInput />
                    </span>
                    <span [class]="r.label">Comfortable</span>
                </label>
                <label [class]="r.row" rdxLabel>
                    <span [class]="r.item" rdxRadioItem value="compact">
                        <span [class]="r.indicator" rdxRadioIndicator></span>
                        <input rdxRadioItemInput />
                    </span>
                    <span [class]="r.label">Compact</span>
                </label>
            </div>
        </form>
    `,
    imports: [
        RdxLabelDirective,
        RdxRadioItemDirective,
        RdxRadioItemInputDirective,
        RdxRadioIndicatorDirective,
        RdxRadioGroupDirective
    ]
})
export class RadioDefaultComponent {
    protected readonly r = demoRadio;
}
```

## Features

- ✅ Full keyboard navigation.
- ✅ Can be controlled or uncontrolled.

## Import

Get started with importing the directives:

```typescript
import {
    RdxRadioGroupDirective,
    RdxRadioIndicatorDirective,
    RdxRadioItemDirective,
    RdxRadioItemInputDirective
} from '@radix-ng/primitives/radio';
```

## Anatomy

```html
<div rdxRadioRoot name="density">
  <label>
    <span rdxRadioItem value="default">
      <span rdxRadioIndicator></span>
      <input rdxRadioItemInput />
    </span>
    Default
  </label>
</div>
```

A named group participates in native `FormData` without item inputs. Add the optional
`input[rdxRadioItemInput]` part inside each item when you also need native constraint validation,
`<label>` activation, or native input/change events. Selection through the group (click, keyboard,
`ngModel`/reactive forms) works with or without it.

The item can attach to any element. When the host is a native `<button>` it is detected automatically:
`type="button"` and the native `disabled` attribute are applied for you — there is no `nativeButton`
input to set.

## Change events

`onValueChange` emits `{ value, eventDetails }`. The details include the `reason`, originating DOM
event, and trigger element; call `eventDetails.cancel()` to keep the previous selection.

```html
<div [value]="value()" (onValueChange)="setValue($event)" rdxRadioRoot>
    ...
</div>
```

```ts
setValue(change: RdxRadioValueChangeEvent) {
    if (this.preventSelection(change.value)) {
        change.eventDetails.cancel();
        return;
    }

    this.value.set(change.value);
}
```

## Examples

### Default

A radio group with sibling labels and hidden native inputs.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import {
    RdxRadioGroupDirective,
    RdxRadioIndicatorDirective,
    RdxRadioItemDirective,
    RdxRadioItemInputDirective
} from '@radix-ng/primitives/radio';
import { demoRadio } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'radio-default-example',
    template: `
        <form>
            <div [class]="r.group" rdxRadioRoot name="density" aria-label="View density">
                <label [class]="r.row" rdxLabel>
                    <span [class]="r.item" rdxRadioItem value="default">
                        <span [class]="r.indicator" rdxRadioIndicator></span>
                        <input rdxRadioItemInput />
                    </span>
                    <span [class]="r.label">Default</span>
                </label>
                <label [class]="r.row" rdxLabel>
                    <span [class]="r.item" rdxRadioItem value="comfortable">
                        <span [class]="r.indicator" rdxRadioIndicator></span>
                        <input rdxRadioItemInput />
                    </span>
                    <span [class]="r.label">Comfortable</span>
                </label>
                <label [class]="r.row" rdxLabel>
                    <span [class]="r.item" rdxRadioItem value="compact">
                        <span [class]="r.indicator" rdxRadioIndicator></span>
                        <input rdxRadioItemInput />
                    </span>
                    <span [class]="r.label">Compact</span>
                </label>
            </div>
        </form>
    `,
    imports: [
        RdxLabelDirective,
        RdxRadioItemDirective,
        RdxRadioItemInputDirective,
        RdxRadioIndicatorDirective,
        RdxRadioGroupDirective
    ]
})
export class RadioDefaultComponent {
    protected readonly r = demoRadio;
}
```

### Disabled

A disabled radio group ignores user interaction and exposes disabled state attributes to all items.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import {
    RdxRadioGroupDirective,
    RdxRadioIndicatorDirective,
    RdxRadioItemDirective,
    RdxRadioItemInputDirective
} from '@radix-ng/primitives/radio';
import { demoRadio } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'radio-disabled-example',
    template: `
        <div
            [class]="r.group"
            [value]="'comfortable'"
            rdxRadioRoot
            name="density-disabled"
            disabled
            aria-label="View density"
        >
            <label [class]="r.row" rdxLabel>
                <span [class]="r.item" rdxRadioItem value="default">
                    <span [class]="r.indicator" rdxRadioIndicator></span>
                    <input rdxRadioItemInput />
                </span>
                <span [class]="r.label">Default</span>
            </label>
            <label [class]="r.row" rdxLabel>
                <span [class]="r.item" rdxRadioItem value="comfortable">
                    <span [class]="r.indicator" rdxRadioIndicator></span>
                    <input rdxRadioItemInput />
                </span>
                <span [class]="r.label">Comfortable</span>
            </label>
            <label [class]="r.row" rdxLabel>
                <span [class]="r.item" rdxRadioItem value="compact">
                    <span [class]="r.indicator" rdxRadioIndicator></span>
                    <input rdxRadioItemInput />
                </span>
                <span [class]="r.label">Compact</span>
            </label>
        </div>
    `,
    imports: [
        RdxLabelDirective,
        RdxRadioItemDirective,
        RdxRadioItemInputDirective,
        RdxRadioIndicatorDirective,
        RdxRadioGroupDirective
    ]
})
export class RadioDisabledComponent {
    protected readonly r = demoRadio;
}
```

### Template-driven forms

Radio group works with `ngModel`, native form submission, and a submit button. This example keeps
`rdxRadioItemInput` for native `required` validation and label activation.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import {
    RdxRadioGroupDirective,
    RdxRadioIndicatorDirective,
    RdxRadioItemDirective,
    RdxRadioItemInputDirective
} from '@radix-ng/primitives/radio';
import { cn, demoButton, demoRadio } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'radio-template-driven-forms-example',
    template: `
        <form class="flex w-72 flex-col gap-4" (ngSubmit)="submit()">
            <div
                [(ngModel)]="hotelRoom"
                [class]="r.group"
                name="hotelRoom"
                rdxRadioRoot
                required
                aria-label="Hotel room"
            >
                @for (room of rooms; track room) {
                    <label [class]="r.row" rdxLabel>
                        <span [class]="r.item" [value]="room" rdxRadioItem>
                            <span [class]="r.indicator" rdxRadioIndicator></span>
                            <input rdxRadioItemInput />
                        </span>
                        <span [class]="r.label">
                            {{ room }}
                        </span>
                    </label>
                }
            </div>

            <button [class]="cn(b.base, b.primary, b.size.md)" type="submit">Submit</button>

            @if (submittedRoom) {
                <p class="text-muted-foreground text-sm">
                    <span>
                        Submitted room:
                        {{ submittedRoom }}
                    </span>
                </p>
            }
        </form>
    `,
    imports: [
        FormsModule,
        RdxLabelDirective,
        RdxRadioItemDirective,
        RdxRadioItemInputDirective,
        RdxRadioIndicatorDirective,
        RdxRadioGroupDirective
    ]
})
export class RadioTemplateDrivenFormsComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly r = demoRadio;

    hotelRoom: string | undefined;
    submittedRoom: string | undefined;
    rooms = ['Default', 'Comfortable'];

    submit(): void {
        this.submittedRoom = this.hotelRoom;
    }
}
```

## API Reference

### RadioGroup

`RdxRadioGroupDirective` — owns the shared radio state and form metadata. Apply to a container element
(typically a `<div>`). Exposes `role="radiogroup"` and mirrors `aria-required` / `aria-disabled` /
`aria-readonly`.

**Data attributes**

| Attribute       | Present when           |
| --------------- | ---------------------- |
| `data-disabled` | the group is disabled. |

### RadioGroupItem

`RdxRadioItemDirective` — one radio button. Apply to an element that represents the button: a `<span>`,
or a native `<button>` (detected automatically, which applies `type="button"` and native `disabled`).
Exposes `role="radio"` and `aria-checked`.

**Data attributes**

| Attribute        | Present when                          |
| ---------------- | ------------------------------------- |
| `data-checked`   | the radio is selected.                |
| `data-unchecked` | the radio is not selected.            |
| `data-disabled`  | the radio or its group is disabled.   |
| `data-readonly`  | the radio or its group is read-only.  |
| `data-required`  | the radio or its group is required.   |
| `data-composite-item-active` | the radio is the active (selected) composite item. |

### RadioGroupItemInput

`RdxRadioItemInputDirective` — optional hidden native radio input for constraint validation,
`<label>` activation, and native input/change events. FormData serialization works from the named
group without it. Apply it inside an item; it has no public inputs or `data-*` attributes.

### RadioIndicator

`RdxRadioIndicatorDirective` — visual marker shown when the radio is selected. Apply to an element
inside an item (typically a `<span>`). By default it is hidden while unchecked; set `keepMounted` to
keep it in the DOM so CSS enter/exit animations can play.

**Data attributes**

| Attribute             | Present when                                            |
| --------------------- | ------------------------------------------------------ |
| `data-checked`        | the radio is selected.                                 |
| `data-unchecked`      | the radio is not selected.                             |
| `data-disabled`       | the radio or its group is disabled.                    |
| `data-readonly`       | the radio or its group is read-only.                   |
| `data-required`       | the radio or its group is required.                    |
| `data-starting-style` | the indicator just mounted (use to animate it in).     |
| `data-ending-style`   | the indicator is unchecked (use to animate it out).    |

## Accessibility

Adheres to the [Radio Group WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radiobutton)
and uses composite roving tabindex to manage focus movement among radio items.

### Keyboard Interactions

| Key          | Description                                                                        |
|--------------|------------------------------------------------------------------------------------|
| `Tab`        | Moves focus to either the checked radio item or the first radio item in the group. |
| `Space`      | When focus is on an unchecked radio item, checks it.                               |
| `ArrowDown`  | Moves focus and checks the next radio item in the group.                           |
| `ArrowRight` | Moves focus and checks the next radio item in the group.                           |
| `ArrowUp`    | Moves focus and checks the previous radio item in the group.                       |
| `ArrowLeft`  | Moves focus and checks the previous radio item in the group.                       |
