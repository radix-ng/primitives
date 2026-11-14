# Styling Radix NG Primitives

Primitives are headless. Put your design-system classes on the consumer elements and style the
attributes written by each directive. Read `styling-contract/<slug>.json` for the exact part and its
documented values; compare its `version` with the installed package before using it.

## Part-specific state

There is no library-wide state enum. For example:

| Part              | Hook                                                    |
| ----------------- | ------------------------------------------------------- |
| Select Popup      | `data-open`, `data-closed`                              |
| Accordion Trigger | `data-panel-open`                                       |
| Accordion Panel   | `data-open`, `data-starting-style`, `data-ending-style` |
| Tabs Tab          | `data-active`                                           |
| Tabs Panel        | `data-hidden`                                           |

Toast Root retains its documented `data-state` values. Use that attribute only where the part's
contract declares it. Likewise, check disabled, orientation, placement and selection hooks per part.
Presence attributes have an empty string value while active and are otherwise absent; use
`[data-disabled]`, not `[data-disabled="true"]`.

## Tailwind v4

```html
<button
  class="data-[panel-open]:bg-accent flex w-full justify-between rounded px-4 py-2 data-[disabled]:opacity-50 [&[data-panel-open]_svg]:rotate-180"
  rdxAccordionTrigger
>
  …
</button>
```

## Plain CSS

```css
[rdxAccordionTrigger][data-panel-open] {
  background: var(--color-accent);
}
[rdxAccordionTrigger][data-disabled] {
  opacity: 0.5;
}
```

## Animation and theme

Use transitions for elements that remain mounted, such as a trigger's chevron. For a popup with
documented `data-starting-style` / `data-ending-style` hooks, style those transition phases and let
the primitive complete its close lifecycle. Follow its example for portals, retained content and
deferred unmount; manually removing the popup can break focus restoration and cleanup.

Use only CSS variables documented for that part. Their names and available measurements vary.
Use your own semantic tokens and theme switch; primitives do not supply a visual theme.
