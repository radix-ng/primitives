# Accordion

#### A vertically stacked set of interactive headings that each reveal an associated section of content.

```html
<div [class]="cn(a.root, 'w-[300px]')" [defaultValue]="'item-1'" ${argsToTemplate(args)} rdxAccordionRoot>
    <div [class]="a.item" [value]="'item-1'" rdxAccordionItem>
        <h3 [class]="a.header" rdxAccordionHeader>
            <button [class]="a.trigger" type="button" rdxAccordionTrigger>Is it accessible?</button>
        </h3>
        <div [class]="a.content" rdxAccordionPanel>
            <div [class]="a.contentText">Yes. It adheres to the WAI-ARIA design pattern.</div>
        </div>
    </div>
    <div [class]="a.item" [value]="'item-2'" rdxAccordionItem>
        <h3 [class]="a.header" rdxAccordionHeader>
            <button [class]="a.trigger" type="button" rdxAccordionTrigger>Is it unstyled?</button>
        </h3>
        <div [class]="a.content" rdxAccordionPanel>
            <div [class]="a.contentText">
                Yes. It's unstyled by default, giving you freedom over the look and feel.
            </div>
        </div>
    </div>
    <div [class]="a.item" [value]="'item-3'" rdxAccordionItem>
        <h3 [class]="a.header" rdxAccordionHeader>
            <button [class]="a.trigger" type="button" rdxAccordionTrigger>Can it be animated?</button>
        </h3>
        <div [class]="a.content" rdxAccordionPanel>
            <div [class]="a.contentText">Yes! You can animate the Accordion with CSS or JavaScript.</div>
        </div>
    </div>
</div>
```

## Features

- ✅ Native button keyboard interaction (`Space` / `Enter`) with browser tab order.
- ✅ Base UI state hooks: `data-open` / `data-panel-open` plus enter/leave `data-starting-style` / `data-ending-style`.
- ✅ Exposes horizontal/vertical orientation state for styling.
- ✅ Expand a single item or multiple items at once (`multiple`).
- ✅ Can be controlled or uncontrolled.
- ✅ Cancelable `onValueChange` (root) and `onOpenChange` (item) events carry an `eventDetails` payload.
- ✅ Exposes the panel size as `--accordion-panel-height` / `--accordion-panel-width` for animations.
- ✅ Keep collapsed panels mounted (`keepMounted`) or findable by browser search (`hiddenUntilFound`).

## Import

Get started with importing the directives:

```typescript
import {
  RdxAccordionRootDirective,
  RdxAccordionItemDirective,
  RdxAccordionHeaderDirective,
  RdxAccordionTriggerDirective,
  RdxAccordionPanelDirective
} from '@radix-ng/primitives/accordion';
```

## Anatomy

```html
<div rdxAccordionRoot>
  <div rdxAccordionItem>
    <div rdxAccordionHeader>
      <button rdxAccordionTrigger></button>
    </div>
    <div rdxAccordionPanel></div>
  </div>
</div>
```

## Examples

### Disabled

Disable the whole accordion via `disabled` on the root, or a single item via `disabled` on the item.

```typescript
import { cn, demoAccordion } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionPanelDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'accordion-disabled-example',
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective
    ],
    template: `
        <div rdxAccordionRoot [class]="cn(a.root, 'w-[300px]')" [defaultValue]="'item-1'">
            <div rdxAccordionItem [class]="a.item" [value]="'item-1'">
                <h3 rdxAccordionHeader [class]="a.header">
                    <button type="button" rdxAccordionTrigger [class]="a.trigger">Is it accessible?</button>
                </h3>
                <div rdxAccordionPanel [class]="a.content">
                    <div [class]="a.contentText">Yes. It adheres to the WAI-ARIA design pattern.</div>
                </div>
            </div>

            <div disabled rdxAccordionItem [class]="a.item" [value]="'item-2'">
                <h3 rdxAccordionHeader [class]="a.header">
                    <button type="button" rdxAccordionTrigger [class]="a.trigger">Is it unstyled?</button>
                </h3>
                <div rdxAccordionPanel [class]="a.content">
                    <div [class]="a.contentText">
                        Yes. It's unstyled by default, giving you freedom over the look and feel.
                    </div>
                </div>
            </div>

            <div rdxAccordionItem [class]="a.item" [value]="'item-3'">
                <h3 rdxAccordionHeader [class]="a.header">
                    <button type="button" rdxAccordionTrigger [class]="a.trigger">Can it be animated?</button>
                </h3>
                <div rdxAccordionPanel [class]="a.content">
                    <div [class]="a.contentText">Yes! You can animate the Accordion with CSS or JavaScript.</div>
                </div>
            </div>
        </div>
    `
})
export class AccordionDisabledExample {
    protected readonly cn = cn;
    protected readonly a = demoAccordion;
}
```

### Multiple

Set `multiple` to let several items stay open at once.

```typescript
import { cn, demoAccordion } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionPanelDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'accordion-multiple-example',
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective
    ],
    template: `
        <div multiple rdxAccordionRoot [class]="cn(a.root, 'w-[300px]')" [value]="['item-2', 'item-3']">
            <div rdxAccordionItem [class]="a.item" [value]="'item-1'">
                <h3 rdxAccordionHeader [class]="a.header">
                    <button type="button" rdxAccordionTrigger [class]="a.trigger">Is it accessible?</button>
                </h3>
                <div rdxAccordionPanel [class]="a.content">
                    <div [class]="a.contentText">Yes. It adheres to the WAI-ARIA design pattern.</div>
                </div>
            </div>

            <div rdxAccordionItem [class]="a.item" [value]="'item-2'">
                <h3 rdxAccordionHeader [class]="a.header">
                    <button type="button" rdxAccordionTrigger [class]="a.trigger">Is it unstyled?</button>
                </h3>
                <div rdxAccordionPanel [class]="a.content">
                    <div [class]="a.contentText">
                        Yes. It's unstyled by default, giving you freedom over the look and feel.
                    </div>
                </div>
            </div>

            <div rdxAccordionItem [class]="a.item" [value]="'item-3'">
                <h3 rdxAccordionHeader [class]="a.header">
                    <button type="button" rdxAccordionTrigger [class]="a.trigger">Can it be animated?</button>
                </h3>
                <div rdxAccordionPanel [class]="a.content">
                    <div [class]="a.contentText">
                        Yes. It's unstyled by default, giving you freedom over the look and feel.
                    </div>
                </div>
            </div>
        </div>
    `
})
export class AccordionMultipleExample {
    protected readonly cn = cn;
    protected readonly a = demoAccordion;
}
```

### Collapsible

In single mode the open item can always be closed by clicking its trigger again (Base UI parity —
there is no separate `collapsible` input).

```typescript
import { cn, demoAccordion } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionPanelDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'accordion-collapsible-example',
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective
    ],
    template: `
        <div rdxAccordionRoot [class]="cn(a.root, 'w-[300px]')" [defaultValue]="'item-1'">
            <div rdxAccordionItem [class]="a.item" [value]="'item-1'">
                <h3 rdxAccordionHeader [class]="a.header">
                    <button type="button" rdxAccordionTrigger [class]="a.trigger">Is it accessible?</button>
                </h3>
                <div rdxAccordionPanel [class]="a.content">
                    <div [class]="a.contentText">Yes. It adheres to the WAI-ARIA design pattern.</div>
                </div>
            </div>

            <div rdxAccordionItem [class]="a.item" [value]="'item-2'">
                <h3 rdxAccordionHeader [class]="a.header">
                    <button type="button" rdxAccordionTrigger [class]="a.trigger">Is it unstyled?</button>
                </h3>
                <div rdxAccordionPanel [class]="a.content">
                    <div [class]="a.contentText">
                        Yes. It's unstyled by default, giving you freedom over the look and feel.
                    </div>
                </div>
            </div>

            <div rdxAccordionItem [class]="a.item" [value]="'item-3'">
                <h3 rdxAccordionHeader [class]="a.header">
                    <button type="button" rdxAccordionTrigger [class]="a.trigger">Can it be animated?</button>
                </h3>
                <div rdxAccordionPanel [class]="a.content">
                    <div [class]="a.contentText">Yes! You can animate the Accordion with CSS or JavaScript.</div>
                </div>
            </div>
        </div>
    `
})
export class AccordionCollapsibleExample {
    protected readonly cn = cn;
    protected readonly a = demoAccordion;
}
```

### Horizontal

Set `orientation="horizontal"` to expose horizontal state for styling. Following the APG guidance update adopted by Base UI, orientation no longer changes keyboard focus behavior.

```typescript
import { cn, demoAccordion } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionPanelDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'accordion-horizontal-example',
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective
    ],
    template: `
        <div
            rdxAccordionRoot
            [class]="cn(a.root, 'flex h-[300px] flex-row')"
            [defaultValue]="'item-1'"
            [orientation]="'horizontal'"
        >
            <div rdxAccordionItem [class]="cn(a.item, a.itemH)" [value]="'item-1'">
                <div rdxAccordionHeader [class]="a.header">
                    <button type="button" rdxAccordionTrigger [class]="cn(a.trigger, a.triggerH)">
                        Is it accessible?
                    </button>
                </div>
                <div rdxAccordionPanel [class]="a.content">
                    <div [class]="a.contentText">Yes. It adheres to the WAI-ARIA design pattern.</div>
                </div>
            </div>

            <div rdxAccordionItem [class]="cn(a.item, a.itemH)" [value]="'item-2'" [disabled]="true">
                <div rdxAccordionHeader [class]="a.header">
                    <button type="button" rdxAccordionTrigger [class]="cn(a.trigger, a.triggerH)">
                        Is it unstyled?
                    </button>
                </div>
                <div rdxAccordionPanel [class]="a.content">
                    <div [class]="a.contentText">
                        Yes. It's unstyled by default, giving you freedom over the look and feel.
                    </div>
                </div>
            </div>

            <div rdxAccordionItem [class]="cn(a.item, a.itemH)" [value]="'item-3'">
                <div rdxAccordionHeader [class]="a.header">
                    <button type="button" rdxAccordionTrigger [class]="cn(a.trigger, a.triggerH)">
                        Can it be animated?
                    </button>
                </div>
                <div rdxAccordionPanel [class]="a.content">
                    <div [class]="a.contentText">Yes! You can animate the Accordion with CSS or JavaScript.</div>
                </div>
            </div>
        </div>
    `
})
export class AccordionHorizontalExample {
    protected readonly cn = cn;
    protected readonly a = demoAccordion;
}
```

### Events

Each item emits `onOpenChange` with `{ open, eventDetails }` whenever it expands or collapses; the
root emits `onValueChange` with `{ value, eventDetails }`. Call `eventDetails.cancel()` to reject a
change before it commits.

```typescript
import { cn, demoAccordion } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionPanelDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'accordion-events-example',
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective
    ],
    template: `
        <div class="flex w-[300px] flex-col gap-3">
            <div rdxAccordionRoot [class]="a.root" [defaultValue]="'item-1'">
                <div rdxAccordionItem [class]="a.item" [value]="'item-1'" (onOpenChange)="log('Accessibility', $event)">
                    <h3 rdxAccordionHeader [class]="a.header">
                        <button type="button" rdxAccordionTrigger [class]="a.trigger">Is it accessible?</button>
                    </h3>
                    <div rdxAccordionPanel [class]="a.content">
                        <div [class]="a.contentText">Yes. It adheres to the WAI-ARIA design pattern.</div>
                    </div>
                </div>

                <div rdxAccordionItem [class]="a.item" [value]="'item-2'" (onOpenChange)="log('Styling', $event)">
                    <h3 rdxAccordionHeader [class]="a.header">
                        <button type="button" rdxAccordionTrigger [class]="a.trigger">Is it unstyled?</button>
                    </h3>
                    <div rdxAccordionPanel [class]="a.content">
                        <div [class]="a.contentText">Yes. It's unstyled by default.</div>
                    </div>
                </div>
            </div>

            <p class="text-muted-foreground text-sm">Last event: {{ status() }}</p>
        </div>
    `
})
export class AccordionEventsExample {
    protected readonly cn = cn;
    protected readonly a = demoAccordion;

    readonly status = signal('—');

    log(title: string, event: { open: boolean }): void {
        this.status.set(`${title} ${event.open ? 'opened' : 'closed'}`);
    }
}
```

### Keep mounted

With `keepMounted`, collapsed panels keep their element in the DOM while hidden — useful to preserve
form state. Use `hiddenUntilFound` instead to keep collapsed content discoverable by the browser's
find-in-page (it renders `hidden="until-found"`).

```typescript
import { cn, demoAccordion, demoInput } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionPanelDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';

/**
 * With `keepMounted`, collapsed panels keep their element in the DOM while hidden.
 * Type something below, collapse the panel, and reopen it — the value is retained.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'accordion-keep-mounted-example',
    imports: [
        FormsModule,
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective
    ],
    template: `
        <div keepMounted rdxAccordionRoot [class]="cn(a.root, 'w-[300px]')" [defaultValue]="'item-1'">
            <div rdxAccordionItem [class]="a.item" [value]="'item-1'">
                <h3 rdxAccordionHeader [class]="a.header">
                    <button type="button" rdxAccordionTrigger [class]="a.trigger">Shipping address</button>
                </h3>
                <div rdxAccordionPanel [class]="a.content">
                    <div [class]="a.contentText">
                        <input placeholder="Type, then collapse & reopen" [class]="input" [(ngModel)]="address" />
                    </div>
                </div>
            </div>

            <div rdxAccordionItem [class]="a.item" [value]="'item-2'">
                <h3 rdxAccordionHeader [class]="a.header">
                    <button type="button" rdxAccordionTrigger [class]="a.trigger">Billing address</button>
                </h3>
                <div rdxAccordionPanel [class]="a.content">
                    <div [class]="a.contentText">Same as shipping.</div>
                </div>
            </div>
        </div>
    `
})
export class AccordionKeepMountedExample {
    protected readonly cn = cn;
    protected readonly a = demoAccordion;
    protected readonly input = demoInput;

    address = '';
}
```

## Accessibility

### Keyboard Interactions

| Key                        | Description                                                                            |
| -------------------------- | -------------------------------------------------------------------------------------- |
| `Space` / `Enter`          | Toggles the focused item (in single non-collapsible mode an open item stays open).     |

Focus moves through accordion triggers using the browser's normal tab order. `Arrow*`, `Home`, and `End` are not handled by Accordion.

`loopFocus` and focus behavior from `orientation` are deprecated for Base UI parity and no longer affect keyboard focus.

## API Reference

### Root

`RdxAccordionRootDirective` — groups all parts and owns the expanded value. Apply to a container element (typically a `<div>`).

**Data attributes**

| Attribute          | Present when                                |
| ------------------ | ------------------------------------------- |
| `data-orientation` | Always — `"horizontal"` \| `"vertical"`.    |
| `data-disabled`    | The accordion is disabled.                  |

### Item

`RdxAccordionItemDirective` — groups a header with its panel. Apply to a container element (typically a `<div>`).

**Data attributes**

| Attribute       | Present when                            |
| --------------- | --------------------------------------- |
| `data-open`     | The item is open.                       |
| `data-disabled` | The item is disabled.                   |
| `data-index`    | Always — the item's zero-based index.   |

### Header

`RdxAccordionHeaderDirective` — the heading that labels the panel. Reads everything from context, so it takes no inputs. Apply to a heading element (typically an `<h3>`).

**Data attributes**

| Attribute       | Present when                            |
| --------------- | --------------------------------------- |
| `data-open`     | The item is open.                       |
| `data-disabled` | The item is disabled.                   |
| `data-index`    | Always — the item's zero-based index.   |

### Trigger

`RdxAccordionTriggerDirective` — the button that toggles the panel. Reads everything from context, so it takes no inputs. Apply to a native `<button>` element. It wires `aria-expanded` and (while open) `aria-controls` to its panel; disabled triggers stay focusable via `aria-disabled`.

**Data attributes**

| Attribute         | Present when                |
| ----------------- | --------------------------- |
| `data-panel-open` | The item's panel is open.   |
| `data-disabled`   | The item is disabled.       |

### Panel

`RdxAccordionPanelDirective` — the collapsible content. Apply to a container element (typically a `<div>`).

**Data attributes**

| Attribute             | Present when                            |
| --------------------- | --------------------------------------- |
| `data-open`           | The panel is open.                      |
| `data-orientation`    | Always — `"horizontal"` \| `"vertical"`.|
| `data-disabled`       | The item is disabled.                   |
| `data-index`          | Always — the item's zero-based index.   |
| `data-starting-style` | The panel is animating in.              |
| `data-ending-style`   | The panel is animating out.             |

**CSS variables**

| Variable                     | Description                                         |
| ---------------------------- | --------------------------------------------------- |
| `--accordion-panel-height`   | The panel's measured height, for height animations. |
| `--accordion-panel-width`    | The panel's measured width, for width animations.   |
