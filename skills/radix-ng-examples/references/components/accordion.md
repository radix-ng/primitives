# Accordion

#### A vertically stacked set of interactive headings that each reveal an associated section of content.

```html
<div [class]="cn(a.root, 'w-[300px]')" [defaultValue]="'item-1'" ${argsToTemplate(args)} rdxAccordionRoot>
    <div [class]="a.item" [value]="'item-1'" rdxAccordionItem>
        <h3 [class]="a.header" rdxAccordionHeader>
            <button [class]="a.trigger" type="button" rdxAccordionTrigger>Is it accessible?</button>
        </h3>
        <div [class]="a.content" rdxAccordionContent>
            <div [class]="a.contentText">Yes. It adheres to the WAI-ARIA design pattern.</div>
        </div>
    </div>
    <div [class]="a.item" [value]="'item-2'" rdxAccordionItem>
        <h3 [class]="a.header" rdxAccordionHeader>
            <button [class]="a.trigger" type="button" rdxAccordionTrigger>Is it unstyled?</button>
        </h3>
        <div [class]="a.content" rdxAccordionContent>
            <div [class]="a.contentText">
                Yes. It's unstyled by default, giving you freedom over the look and feel.
            </div>
        </div>
    </div>
    <div [class]="a.item" [value]="'item-3'" rdxAccordionItem>
        <h3 [class]="a.header" rdxAccordionHeader>
            <button [class]="a.trigger" type="button" rdxAccordionTrigger>Can it be animated?</button>
        </h3>
        <div [class]="a.content" rdxAccordionContent>
            <div [class]="a.contentText">Yes! You can animate the Accordion with CSS or JavaScript.</div>
        </div>
    </div>
</div>
```

## Features

- ✅ Full keyboard navigation, with optional focus looping (`loopFocus`).
- ✅ Supports horizontal/vertical orientation.
- ✅ Supports Right to Left direction.
- ✅ Expand a single item or multiple items at once.
- ✅ Can be controlled or uncontrolled.
- ✅ Emits an event per item when its panel opens or closes (`onOpenChange`).
- ✅ Can keep collapsed panels mounted in the DOM (`keepMounted`).

## Import

Get started with importing the directives:

```typescript
import {
  RdxAccordionRootDirective,
  RdxAccordionItemDirective,
  RdxAccordionHeaderDirective,
  RdxAccordionTriggerDirective,
  RdxAccordionContentDirective
} from '@radix-ng/primitives/accordion';
```

## Anatomy

```html
<div rdxAccordionRoot>
  <div rdxAccordionItem>
    <div rdxAccordionHeader>
      <button rdxAccordionTrigger></button>
    </div>
    <div rdxAccordionContent></div>
  </div>
</div>
```

## Examples

### Disabled

Disable the whole accordion via `disabled` on the root, or a single item via `disabled` on the item.

```typescript
import { Component } from '@angular/core';
import {
    RdxAccordionContentDirective,
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';
import { cn, demoAccordion } from '../../storybook/styles';

@Component({
    selector: 'accordion-disabled-example',
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionContentDirective
    ],
    template: `
        <div [class]="cn(a.root, 'w-[300px]')" [defaultValue]="'item-1'" rdxAccordionRoot>
            <div [class]="a.item" [value]="'item-1'" rdxAccordionItem>
                <h3 [class]="a.header" rdxAccordionHeader>
                    <button [class]="a.trigger" type="button" rdxAccordionTrigger>Is it accessible?</button>
                </h3>
                <div [class]="a.content" rdxAccordionContent>
                    <div [class]="a.contentText">Yes. It adheres to the WAI-ARIA design pattern.</div>
                </div>
            </div>

            <div [class]="a.item" [value]="'item-2'" disabled rdxAccordionItem>
                <h3 [class]="a.header" rdxAccordionHeader>
                    <button [class]="a.trigger" type="button" rdxAccordionTrigger>Is it unstyled?</button>
                </h3>
                <div [class]="a.content" rdxAccordionContent>
                    <div [class]="a.contentText">
                        Yes. It's unstyled by default, giving you freedom over the look and feel.
                    </div>
                </div>
            </div>

            <div [class]="a.item" [value]="'item-3'" rdxAccordionItem>
                <h3 [class]="a.header" rdxAccordionHeader>
                    <button [class]="a.trigger" type="button" rdxAccordionTrigger>Can it be animated?</button>
                </h3>
                <div [class]="a.content" rdxAccordionContent>
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

Set `multiple` (or `type="multiple"`) to let several items stay open at once.

```typescript
import { Component } from '@angular/core';
import {
    RdxAccordionContentDirective,
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';
import { cn, demoAccordion } from '../../storybook/styles';

@Component({
    selector: 'accordion-multiple-example',
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionContentDirective
    ],
    template: `
        <div [class]="cn(a.root, 'w-[300px]')" [value]="['item-2', 'item-3']" type="multiple" rdxAccordionRoot>
            <div [class]="a.item" [value]="'item-1'" rdxAccordionItem>
                <h3 [class]="a.header" rdxAccordionHeader>
                    <button [class]="a.trigger" type="button" rdxAccordionTrigger>Is it accessible?</button>
                </h3>
                <div [class]="a.content" rdxAccordionContent>
                    <div [class]="a.contentText">Yes. It adheres to the WAI-ARIA design pattern.</div>
                </div>
            </div>

            <div [class]="a.item" [value]="'item-2'" rdxAccordionItem>
                <h3 [class]="a.header" rdxAccordionHeader>
                    <button [class]="a.trigger" type="button" rdxAccordionTrigger>Is it unstyled?</button>
                </h3>
                <div [class]="a.content" rdxAccordionContent>
                    <div [class]="a.contentText">
                        Yes. It's unstyled by default, giving you freedom over the look and feel.
                    </div>
                </div>
            </div>

            <div [class]="a.item" [value]="'item-3'" rdxAccordionItem>
                <h3 [class]="a.header" rdxAccordionHeader>
                    <button [class]="a.trigger" type="button" rdxAccordionTrigger>Can it be animated?</button>
                </h3>
                <div [class]="a.content" rdxAccordionContent>
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

In single mode, `collapsible` lets the user close the currently open item.

```typescript
import { Component } from '@angular/core';
import {
    RdxAccordionContentDirective,
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';
import { cn, demoAccordion } from '../../storybook/styles';

@Component({
    selector: 'accordion-collapsible-example',
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionContentDirective
    ],
    template: `
        <div [class]="cn(a.root, 'w-[300px]')" [defaultValue]="'item-1'" collapsible rdxAccordionRoot>
            <div [class]="a.item" [value]="'item-1'" rdxAccordionItem>
                <h3 [class]="a.header" rdxAccordionHeader>
                    <button [class]="a.trigger" type="button" rdxAccordionTrigger>Is it accessible?</button>
                </h3>
                <div [class]="a.content" rdxAccordionContent>
                    <div [class]="a.contentText">Yes. It adheres to the WAI-ARIA design pattern.</div>
                </div>
            </div>

            <div [class]="a.item" [value]="'item-2'" rdxAccordionItem>
                <h3 [class]="a.header" rdxAccordionHeader>
                    <button [class]="a.trigger" type="button" rdxAccordionTrigger>Is it unstyled?</button>
                </h3>
                <div [class]="a.content" rdxAccordionContent>
                    <div [class]="a.contentText">
                        Yes. It's unstyled by default, giving you freedom over the look and feel.
                    </div>
                </div>
            </div>

            <div [class]="a.item" [value]="'item-3'" rdxAccordionItem>
                <h3 [class]="a.header" rdxAccordionHeader>
                    <button [class]="a.trigger" type="button" rdxAccordionTrigger>Can it be animated?</button>
                </h3>
                <div [class]="a.content" rdxAccordionContent>
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

Set `orientation="horizontal"` to lay items out in a row; arrow-key navigation follows the orientation.

```typescript
import { Component } from '@angular/core';
import {
    RdxAccordionContentDirective,
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';
import { cn, demoAccordion } from '../../storybook/styles';

@Component({
    selector: 'accordion-horizontal-example',
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionContentDirective
    ],
    template: `
        <div
            [class]="cn(a.root, 'flex h-[300px] flex-row')"
            [defaultValue]="'item-1'"
            [orientation]="'horizontal'"
            rdxAccordionRoot
        >
            <div [class]="cn(a.item, a.itemH)" [value]="'item-1'" rdxAccordionItem>
                <div [class]="a.header" rdxAccordionHeader>
                    <button [class]="cn(a.trigger, a.triggerH)" type="button" rdxAccordionTrigger>
                        Is it accessible?
                    </button>
                </div>
                <div [class]="a.content" rdxAccordionContent>
                    <div [class]="a.contentText">Yes. It adheres to the WAI-ARIA design pattern.</div>
                </div>
            </div>

            <div [class]="cn(a.item, a.itemH)" [value]="'item-2'" [disabled]="true" rdxAccordionItem>
                <div [class]="a.header" rdxAccordionHeader>
                    <button [class]="cn(a.trigger, a.triggerH)" type="button" rdxAccordionTrigger>
                        Is it unstyled?
                    </button>
                </div>
                <div [class]="a.content" rdxAccordionContent>
                    <div [class]="a.contentText">
                        Yes. It's unstyled by default, giving you freedom over the look and feel.
                    </div>
                </div>
            </div>

            <div [class]="cn(a.item, a.itemH)" [value]="'item-3'" rdxAccordionItem>
                <div [class]="a.header" rdxAccordionHeader>
                    <button [class]="cn(a.trigger, a.triggerH)" type="button" rdxAccordionTrigger>
                        Can it be animated?
                    </button>
                </div>
                <div [class]="a.content" rdxAccordionContent>
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

Each item emits `onOpenChange` with its new open state whenever it expands or collapses.

```typescript
import { Component, signal } from '@angular/core';
import {
    RdxAccordionContentDirective,
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';
import { cn, demoAccordion } from '../../storybook/styles';

@Component({
    selector: 'accordion-events-example',
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionContentDirective
    ],
    template: `
        <div class="flex w-[300px] flex-col gap-3">
            <div [class]="a.root" [defaultValue]="'item-1'" collapsible rdxAccordionRoot>
                <div [class]="a.item" [value]="'item-1'" (onOpenChange)="log('Accessibility', $event)" rdxAccordionItem>
                    <h3 [class]="a.header" rdxAccordionHeader>
                        <button [class]="a.trigger" type="button" rdxAccordionTrigger>Is it accessible?</button>
                    </h3>
                    <div [class]="a.content" rdxAccordionContent>
                        <div [class]="a.contentText">Yes. It adheres to the WAI-ARIA design pattern.</div>
                    </div>
                </div>

                <div [class]="a.item" [value]="'item-2'" (onOpenChange)="log('Styling', $event)" rdxAccordionItem>
                    <h3 [class]="a.header" rdxAccordionHeader>
                        <button [class]="a.trigger" type="button" rdxAccordionTrigger>Is it unstyled?</button>
                    </h3>
                    <div [class]="a.content" rdxAccordionContent>
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

    log(title: string, open: boolean): void {
        this.status.set(`${title} ${open ? 'opened' : 'closed'}`);
    }
}
```

### Keep mounted

With `keepMounted`, collapsed panels keep their element in the DOM instead of receiving a `hidden`
attribute — useful to preserve form state and keep content reachable by the browser's find-in-page.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    RdxAccordionContentDirective,
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';
import { cn, demoAccordion, demoInput } from '../../storybook/styles';

/**
 * With `keepMounted`, collapsed panels keep their element in the DOM (no `hidden`
 * attribute) instead of being hidden from assistive tech and find-in-page. Type
 * something below, collapse the panel, and reopen it — the value is retained and
 * the field stays reachable by the browser's Ctrl/Cmd+F search.
 */
@Component({
    selector: 'accordion-keep-mounted-example',
    imports: [
        FormsModule,
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionContentDirective
    ],
    template: `
        <div [class]="cn(a.root, 'w-[300px]')" [defaultValue]="'item-1'" keepMounted collapsible rdxAccordionRoot>
            <div [class]="a.item" [value]="'item-1'" rdxAccordionItem>
                <h3 [class]="a.header" rdxAccordionHeader>
                    <button [class]="a.trigger" type="button" rdxAccordionTrigger>Shipping address</button>
                </h3>
                <div [class]="a.content" rdxAccordionContent>
                    <div [class]="a.contentText">
                        <input [(ngModel)]="address" [class]="input" placeholder="Type, then collapse & reopen" />
                    </div>
                </div>
            </div>

            <div [class]="a.item" [value]="'item-2'" rdxAccordionItem>
                <h3 [class]="a.header" rdxAccordionHeader>
                    <button [class]="a.trigger" type="button" rdxAccordionTrigger>Billing address</button>
                </h3>
                <div [class]="a.content" rdxAccordionContent>
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

## Keyboard interactions

| Key                        | Description                                                                          |
| -------------------------- | ----------------------------------------------------------------------------------- |
| `Space` / `Enter`          | Toggles the focused item (in single non-collapsible mode an open item stays open).   |
| `ArrowDown` / `ArrowRight` | Moves focus to the next trigger, wrapping to the first when `loopFocus` is enabled.  |
| `ArrowUp` / `ArrowLeft`    | Moves focus to the previous trigger, wrapping to the last when `loopFocus` is enabled. |
| `Home`                     | Moves focus to the first trigger.                                                    |
| `End`                      | Moves focus to the last trigger.                                                     |

Arrow keys follow `orientation`: Up/Down for vertical accordions, Left/Right for horizontal ones.

## Data attributes

State is exposed through `data-*` attributes for styling:

| Attribute         | Parts                          | Values                                                       |
| ----------------- | ------------------------------ | ----------------------------------------------------------- |
| `data-state`      | item, header, trigger, content | `"open"` \| `"closed"`                                       |
| `data-disabled`   | root, item, header, content    | Present when disabled                                        |
| `data-orientation`| root, item, header, trigger, content | `"horizontal"` \| `"vertical"`                        |
| `data-index`      | item, header, trigger, content | Zero-based position of the item                              |
| `data-panel-open` | trigger                        | Present while the trigger's panel is open (e.g. rotate a chevron) |

## API Reference

### RdxAccordionRootDirective

### RdxAccordionItemDirective

### RdxAccordionTriggerDirective

### RdxAccordionContentDirective
