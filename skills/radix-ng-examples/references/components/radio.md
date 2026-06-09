# Radio Group

#### A set of checkable buttons—known as radio buttons—where no more than one of the buttons can be checked at a time.

```typescript
import { Component } from '@angular/core';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { RdxRadioGroupDirective, RdxRadioIndicatorDirective, RdxRadioItemDirective } from '@radix-ng/primitives/radio';
import { demoRadio } from '../../storybook/styles';

@Component({
    selector: 'radio-default-example',
    template: `
        <form>
            <div [class]="r.group" rdxRadioRoot name="density" orientation="vertical" aria-label="View density">
                <label [class]="r.row" rdxLabel>
                    <span [class]="r.item" rdxRadioItem value="default">
                        <span [class]="r.indicator" rdxRadioIndicator></span>
                    </span>
                    <span [class]="r.label">Default</span>
                </label>
                <label [class]="r.row" rdxLabel>
                    <span [class]="r.item" rdxRadioItem value="comfortable">
                        <span [class]="r.indicator" rdxRadioIndicator></span>
                    </span>
                    <span [class]="r.label">Comfortable</span>
                </label>
                <label [class]="r.row" rdxLabel>
                    <span [class]="r.item" rdxRadioItem value="compact">
                        <span [class]="r.indicator" rdxRadioIndicator></span>
                    </span>
                    <span [class]="r.label">Compact</span>
                </label>
            </div>
        </form>
    `,
    imports: [RdxLabelDirective, RdxRadioItemDirective, RdxRadioIndicatorDirective, RdxRadioGroupDirective]
})
export class RadioDefaultComponent {
    protected readonly r = demoRadio;
}
```

## Features

- ✅ Full keyboard navigation.
- ✅ Supports horizontal/vertical orientation.
- ✅ Can be controlled or uncontrolled.

## Import

Get started with importing the directives:

```typescript
import {
    RdxRadioGroupDirective,
    RdxRadioIndicatorDirective,
    RdxRadioItemDirective
} from '@radix-ng/primitives/radio';
```

## Anatomy

```html
<div rdxRadioRoot name="density">
  <label>
    <span rdxRadioItem value="default">
      <span rdxRadioIndicator></span>
    </span>
    Default
  </label>
</div>
```

`RdxRadioItemDirective` creates the hidden native radio input next to the item, so form
submission, native validation, and labels work without rendering an `<input>` inside the button.

Use `nativeButton` only when you render the item as a standalone `<button>` and handle the label
outside of native label activation.

## Examples

### Default

A vertical radio group with sibling labels and native button items.

```typescript
import { Component } from '@angular/core';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { RdxRadioGroupDirective, RdxRadioIndicatorDirective, RdxRadioItemDirective } from '@radix-ng/primitives/radio';
import { demoRadio } from '../../storybook/styles';

@Component({
    selector: 'radio-default-example',
    template: `
        <form>
            <div [class]="r.group" rdxRadioRoot name="density" orientation="vertical" aria-label="View density">
                <label [class]="r.row" rdxLabel>
                    <span [class]="r.item" rdxRadioItem value="default">
                        <span [class]="r.indicator" rdxRadioIndicator></span>
                    </span>
                    <span [class]="r.label">Default</span>
                </label>
                <label [class]="r.row" rdxLabel>
                    <span [class]="r.item" rdxRadioItem value="comfortable">
                        <span [class]="r.indicator" rdxRadioIndicator></span>
                    </span>
                    <span [class]="r.label">Comfortable</span>
                </label>
                <label [class]="r.row" rdxLabel>
                    <span [class]="r.item" rdxRadioItem value="compact">
                        <span [class]="r.indicator" rdxRadioIndicator></span>
                    </span>
                    <span [class]="r.label">Compact</span>
                </label>
            </div>
        </form>
    `,
    imports: [RdxLabelDirective, RdxRadioItemDirective, RdxRadioIndicatorDirective, RdxRadioGroupDirective]
})
export class RadioDefaultComponent {
    protected readonly r = demoRadio;
}
```

### Disabled

A disabled radio group ignores user interaction and exposes disabled state attributes to all items.

```typescript
import { Component } from '@angular/core';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { RdxRadioGroupDirective, RdxRadioIndicatorDirective, RdxRadioItemDirective } from '@radix-ng/primitives/radio';
import { demoRadio } from '../../storybook/styles';

@Component({
    selector: 'radio-disabled-example',
    template: `
        <div
            [class]="r.group"
            [value]="'comfortable'"
            rdxRadioRoot
            name="density-disabled"
            disabled
            orientation="vertical"
            aria-label="View density"
        >
            <label [class]="r.row" rdxLabel>
                <span [class]="r.item" rdxRadioItem value="default">
                    <span [class]="r.indicator" rdxRadioIndicator></span>
                </span>
                <span [class]="r.label">Default</span>
            </label>
            <label [class]="r.row" rdxLabel>
                <span [class]="r.item" rdxRadioItem value="comfortable">
                    <span [class]="r.indicator" rdxRadioIndicator></span>
                </span>
                <span [class]="r.label">Comfortable</span>
            </label>
            <label [class]="r.row" rdxLabel>
                <span [class]="r.item" rdxRadioItem value="compact">
                    <span [class]="r.indicator" rdxRadioIndicator></span>
                </span>
                <span [class]="r.label">Compact</span>
            </label>
        </div>
    `,
    imports: [RdxLabelDirective, RdxRadioItemDirective, RdxRadioIndicatorDirective, RdxRadioGroupDirective]
})
export class RadioDisabledComponent {
    protected readonly r = demoRadio;
}
```

### Template-driven forms

Radio group works with `ngModel`, native form submission, and a submit button while still creating native inputs.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { RdxRadioGroupDirective, RdxRadioIndicatorDirective, RdxRadioItemDirective } from '@radix-ng/primitives/radio';
import { cn, demoButton, demoRadio } from '../../storybook/styles';

@Component({
    selector: 'radio-groups-forms-example',
    template: `
        <form class="flex w-72 flex-col gap-4" (ngSubmit)="submit()">
            <div
                [(ngModel)]="hotelRoom"
                [class]="r.group"
                name="hotelRoom"
                orientation="vertical"
                rdxRadioRoot
                required
                aria-label="Hotel room"
            >
                @for (room of rooms; track room) {
                    <label [class]="r.row" rdxLabel>
                        <span [class]="r.item" [value]="room" rdxRadioItem>
                            <span [class]="r.indicator" rdxRadioIndicator></span>
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
    imports: [FormsModule, RdxLabelDirective, RdxRadioItemDirective, RdxRadioIndicatorDirective, RdxRadioGroupDirective]
})
export class RadioGroupComponent {
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

`RdxRadioGroupDirective`

Owns the shared radio state and form metadata (`name`, `form`, `required`, `disabled`, and
`readonly`).

### RadioGroupItem

`RdxRadioItemDirective`

### RadioIndicator

`RdxRadioIndicatorDirective`

Renders only when its radio item is checked and exposes the same state attributes for styling. It has no public inputs.

## Accessibility

Adheres to the [Radio Group WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radiobutton)
and uses [roving tabindex](https://www.w3.org/TR/wai-aria-practices-1.2/examples/radio/radio.html) to manage focus movement among radio items.

### Keyboard Interactions

| Key          | Description                                                                        |
|--------------|------------------------------------------------------------------------------------|
| `Tab`        | Moves focus to either the checked radio item or the first radio item in the group. |
| `Space`      | When focus is on an unchecked radio item, checks it.                               |
| `ArrowDown`  | Moves focus and checks the next radio item in the group.                           |
| `ArrowRight` | Moves focus and checks the next radio item in the group.                           |
| `ArrowUp`    | Moves focus to the previous radio item in the group.                               |
| `ArrowLeft`  | Moves focus to the previous radio item in the group.                               |
