# {{ NgDocPage.title }}

{{ NgDocActions.demo("AccordionExampleComponent", { expanded: false}) }}

## Installation

### Update tailwind.config.js

```js {5-18} name="tailwind.config.js"
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  }
};
```

## Usage

```ts
import {
  ShAccordionComponent,
  ShAccordionContentComponent,
  ShAccordionItemComponent,
  ShAccordionTriggerComponent
} from '@radix-ng/shadcn/accordion';
```

```html
<shAccordion>
  <shAccordionItem value="item-1">
    <shAccordionTrigger>Is it accessible?</shAccordionTrigger>
    <div shAccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</div>
  </shAccordionItem>
</shAccordion>
```
