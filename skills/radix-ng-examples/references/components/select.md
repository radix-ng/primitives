# Select

A control that presents a list of options for the user to pick from, triggered by a button.

> Index — full source of each example is one click away in `../examples/select--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Controlled and uncontrolled value via `[(value)]`, with `defaultValue` / `defaultOpen` seeds.
- ✅ `readOnly` and `required` state, reflected on the trigger as `aria-readonly` / `aria-required`.
- ✅ Single and multiple selection with the `multiple` input.
- ✅ Angular forms integration through `ControlValueAccessor`: Reactive Forms, `formControlName`, and `ngModel`.
- ✅ Cancelable `onOpenChange` and `onValueChange` outputs with reason-aware `eventDetails`.
- ✅ Two positioning modes: Popper (Floating UI) and Item-aligned (native-like).
- ✅ Scroll buttons appear automatically when the list overflows the viewport.
- ✅ Typeahead: type a character to jump to matching items.
- ✅ Custom comparison (`isItemEqualToValue`), labels (`itemToStringLabel`), and native form serialization
  (`itemToStringValue`) for object values.
- ✅ Highlight-model navigation (`aria-activedescendant`) — focus stays on the listbox, not the items.
- ✅ Full keyboard navigation: ArrowDown / ArrowUp, Home, End, Enter / Space, Escape.
- ✅ Public interaction state via `openMethod`, `openInteractionType`, and `closeInteractionType`.
- ✅ `modal` (default) locks page scroll and makes outside content inert, with an optional `Backdrop`.
- ✅ Field integration on the trigger (invalid / disabled / required / focused state + `aria-describedby`).
- ✅ WAI-ARIA `combobox` / `listbox` semantics with `aria-selected` and `aria-disabled`.
- ✅ Headless — state via `data-selected`, `data-highlighted`, `data-popup-open`, `data-placeholder`, `data-disabled`.

## Import

```typescript
import {
  RdxSelectPopup,
  RdxSelectGroup,
  RdxSelectItem,
  RdxSelectItemIndicator,
  RdxSelectItemText,
  RdxSelectGroupLabel,
  RdxSelectPositioner,
  RdxSelectPortal,
  RdxSelectRoot,
  RdxSelectScrollDownButton,
  RdxSelectScrollUpButton,
  RdxSelectTrigger,
  RdxSelectValue,
  RdxSelectList
} from '@radix-ng/primitives/select';
```

## Anatomy

### Popper positioning (Floating UI)

The popup is anchored to the trigger and positioned with Floating UI — the same approach used by
Dropdown Menu and Popover. Use `rdxSelectPositioner` to configure side, align, and
offsets.

```html
<ng-container rdxSelectRoot>
  <button rdxSelectTrigger>
    <span #v="rdxSelectedValue" rdxSelectValue placeholder="Pick one…">{{ v.slotText() }}</span>
    <!-- chevron icon -->
  </button>

  <div *rdxSelectPortal sideOffset="4" align="start" rdxSelectPositioner>
    <div rdxSelectPopup>
      <!-- optional scroll-up button -->
      <div rdxSelectScrollUpButton><!-- up icon --></div>

      <div rdxSelectList>
        <div rdxSelectGroupLabel>Group label</div>
        <div rdxSelectGroup>
          <div value="apple" rdxSelectItem>
            <span rdxSelectItemIndicator><!-- check icon --></span>
            <span rdxSelectItemText>Apple</span>
          </div>
        </div>
      </div>

      <!-- optional scroll-down button -->
      <div rdxSelectScrollDownButton><!-- down icon --></div>
    </div>
  </div>
</ng-container>
```

### Item-aligned positioning (native-like)

The popup overlaps the trigger, with the selected item aligned to the trigger's position — matching
the behavior of a native `<select>`. Use `rdxSelectItemAlignedPosition` and
`rdxSelectItemAlignedPositionContent` instead of the Popper wrappers.

```html
<ng-container rdxSelectRoot>
  <button rdxSelectTrigger>
    <span #v="rdxSelectedValue" rdxSelectValue>{{ v.slotText() }}</span>
  </button>

  <div *rdxSelectPortal rdxSelectItemAlignedPosition>
    <div rdxSelectPopup>
      <div rdxSelectItemAlignedPositionContent>
        <div rdxSelectList>
          <div value="apple" rdxSelectItem>
            <span rdxSelectItemIndicator><!-- check icon --></span>
            <span rdxSelectItemText>Apple</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</ng-container>
```

## Examples

- [Default](../examples/select--default.md)
- [Multiple](../examples/select--multiple.md)
- [Change details and interaction state](../examples/select--change-details-and-interaction-state.md)
- [Object values](../examples/select--object-values.md)
- [Reactive Forms](../examples/select--reactive-forms.md)
- [Template-driven Forms](../examples/select--template-driven-forms.md)
- [With scroll buttons](../examples/select--with-scroll-buttons.md)
- [Item-aligned positioning](../examples/select--item-aligned-positioning.md)
- [Item-aligned with scroll](../examples/select--item-aligned-with-scroll.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/select.json`
- Styling (parts + `data-*`): `references/styling-contract/select.json`
