# Combobox

A filterable select: a text input that filters a list of options, with the highlighted option tracked via `aria-activedescendant`.

> Index — full source of each example is one click away in `../examples/combobox--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Controlled / uncontrolled selection via `[(value)]` and input text via `[(inputValue)]`.
- ✅ Single and multiple selection (`multiple`) with chips.
- ✅ Built-in locale-aware filtering, a custom `filter` function, or `[filter]="null"` for external/async lists.
- ✅ `autoHighlight`: `'input-change'` (first match while typing) or `'always'` (keep first highlighted).
- ✅ `selectionMode="none"` for filter-only / command-palette UIs (no committed value).
- ✅ Full keyboard support: ArrowDown / ArrowUp (loop via `loopFocus`), Home / End, Enter, Escape, Tab, Backspace.
- ✅ WAI-ARIA `combobox` / `listbox` semantics with `aria-activedescendant` (focus never leaves the input).
- ✅ `RdxComboboxValue` renders the selection in a trigger; `onItemHighlighted` reports the active item.
- ✅ Optional `modal` mode: locks page scroll and makes outside content inert, with a `Backdrop` part.
- ✅ `onOpenChange` is cancellable and emits `{ open, reason, event, trigger, eventDetails }`; a controlled combobox can reject a close or keep the popup mounted during exit.
- ✅ `submitOnItemClick` to submit the form on selection; `onOpenChangeComplete` fires after the transition.
- ✅ `limit` caps how many matches show; arrow-key navigation never fights a resting mouse cursor.
- ✅ Hover behavior: `highlightItemOnHover` (default `true`) and `keepHighlight` (keep the highlight when the pointer leaves the list).
- ✅ External virtualization: `virtualized` + `[items]` drives index navigation and exposes `filteredItems()` for any virtualizer.
- ✅ Forms: `ControlValueAccessor` on the root, Field integration on the input, and native `name` / `form`
  serialization (including repeated entries and `itemToStringValue` for object selections).
- ✅ Headless — state via `data-popup-open`, `data-list-empty`, `data-placeholder`, `data-selected`, `data-highlighted`.

## Import

```typescript
import {
  RdxComboboxAnchor,
  RdxComboboxArrow,
  RdxComboboxBackdrop,
  RdxComboboxChip,
  RdxComboboxChipRemove,
  RdxComboboxChips,
  RdxComboboxClear,
  RdxComboboxEmpty,
  RdxComboboxGroup,
  RdxComboboxGroupLabel,
  RdxComboboxIcon,
  RdxComboboxInput,
  RdxComboboxItem,
  RdxComboboxItemIndicator,
  RdxComboboxLabel,
  RdxComboboxList,
  RdxComboboxPopup,
  RdxComboboxPortal,
  RdxComboboxPositioner,
  RdxComboboxRoot,
  RdxComboboxStatus,
  RdxComboboxTrigger,
  RdxComboboxValue
} from '@radix-ng/primitives/combobox';
```

## Anatomy

The input is the popper anchor and keeps focus; options live in a portalled popup and are filtered in
place (non-matching items are hidden, not destroyed).

```html
<div rdxComboboxRoot>
  <input rdxComboboxInput placeholder="Search…" />
  <button rdxComboboxClear><!-- clear icon --></button>
  <button rdxComboboxTrigger><!-- chevron icon --></button>

  <div *rdxComboboxPortal rdxComboboxPositioner>
    <div rdxComboboxPopup>
      <div rdxComboboxList>
        <div rdxComboboxGroup>
          <div rdxComboboxGroupLabel>Group</div>
          <div value="apple" rdxComboboxItem>
            <span rdxComboboxItemIndicator><!-- check icon --></span>
            Apple
          </div>
        </div>
      </div>
      <div rdxComboboxEmpty>No results.</div>
    </div>
  </div>
</div>
```

By default the **input is the popup anchor**, which is ideal when the input fills the control. When
the control wraps more than the input — e.g. chips in `multiple` mode — put `rdxComboboxAnchor` on
the wrapping element so the popup aligns to the whole control instead of the inline input:

```html
<div rdxComboboxAnchor>
  <div rdxComboboxChips>
    <span value="apple" rdxComboboxChip>
      Apple
      <button rdxComboboxChipRemove><!-- × --></button>
    </span>
  </div>
  <input rdxComboboxInput />
</div>
```

## Examples

- [Default](../examples/combobox--default.md)
- [Disabled](../examples/combobox--disabled.md)
- [Grouped](../examples/combobox--grouped.md)
- [Grid](../examples/combobox--grid.md)
- [Multiple](../examples/combobox--multiple.md)
- [Async / external filtering](../examples/combobox--async-external-filtering.md)
- [Async with multiple selection](../examples/combobox--async-with-multiple-selection.md)
- [Creatable](../examples/combobox--creatable.md)
- [Input inside the popup](../examples/combobox--input-inside-the-popup.md)
- [Command palette](../examples/combobox--command-palette.md)
- [Modal](../examples/combobox--modal.md)
- [Controlled open state](../examples/combobox--controlled-open-state.md)
- [Reactive forms](../examples/combobox--reactive-forms.md)
- [Validation](../examples/combobox--validation.md)
- [Empty state](../examples/combobox--empty-state.md)
- [Virtualized](../examples/combobox--virtualized.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/combobox.json`
- Styling (parts + `data-*`): `references/styling-contract/combobox.json`
