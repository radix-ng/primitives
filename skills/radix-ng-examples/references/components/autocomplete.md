# Autocomplete

A text input with a list of suggestions: free-form text whose value **is** the input string, with the active option tracked via `aria-activedescendant`.

> Index — full source of each example is one click away in `../examples/autocomplete--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ The value **is** the input string — `[(value)]`, `defaultValue`, and `onValueChange` (with a `reason`: `input-change` / `item-press` / `input-clear`).
- ✅ Four `mode`s: `list` (filter), `both` (filter + inline complete), `inline` (static + inline complete), `none` (static).
- ✅ Inline autocompletion: the active item's label fills the input with the completed suffix selected.
- ✅ Built-in locale-aware filtering, a custom `filter` function, or `[filter]="null"` for external/async lists.
- ✅ `autoHighlight`: `true` (first match while typing) or `'always'` (keep first highlighted).
- ✅ Hover behavior: `highlightItemOnHover` (default `true`) and `keepHighlight` (keep the highlight when the pointer leaves the list).
- ✅ Full keyboard support: ArrowDown / ArrowUp (loop via `loopFocus`), Enter, Escape, Tab.
- ✅ Grid layout (`grid` + `rdxAutocompleteRow`) with 2D arrow navigation (Up/Down by row, Left/Right within a row).
- ✅ Inline list (command palette): render `List` directly without `Portal` / `Positioner` / `Popup` for an always-open list.
- ✅ WAI-ARIA `combobox` / `listbox` semantics with `aria-activedescendant` (focus never leaves the input).
- ✅ Optional `modal` mode: locks page scroll and makes outside content inert, with a `Backdrop` part.
- ✅ `onOpenChange` is cancellable and emits `{ open, reason, event, trigger, eventDetails }`; controlled autocomplete can inspect or reject close/open requests.
- ✅ `limit` caps how many matches show; arrow-key navigation never fights a resting mouse cursor.
- ✅ External virtualization: `virtualized` + `[items]` drives index navigation and exposes `filteredItems()`.
- ✅ Forms: `ControlValueAccessor` on the root (value = input string), Field integration, and native
  `name` / `form` serialization through the visible input.
- ✅ Headless — state via `data-popup-open`, `data-list-empty`, `data-highlighted`, `data-disabled` (no `data-selected` — autocomplete does not commit a selection).

## Import

```typescript
import {
  RdxAutocompleteAnchor,
  RdxAutocompleteArrow,
  RdxAutocompleteBackdrop,
  RdxAutocompleteClear,
  RdxAutocompleteEmpty,
  RdxAutocompleteGroup,
  RdxAutocompleteGroupLabel,
  RdxAutocompleteIcon,
  RdxAutocompleteInput,
  RdxAutocompleteInputGroup,
  RdxAutocompleteItem,
  RdxAutocompleteItemIndicator,
  RdxAutocompleteLabel,
  RdxAutocompleteList,
  RdxAutocompletePopup,
  RdxAutocompletePortal,
  RdxAutocompletePositioner,
  RdxAutocompleteRoot,
  RdxAutocompleteRow,
  RdxAutocompleteStatus,
  RdxAutocompleteTrigger,
  RdxAutocompleteValue
} from '@radix-ng/primitives/autocomplete';
```

## Anatomy

The input is the popper anchor and keeps focus; suggestions live in a portalled popup and are filtered
in place (non-matching items are hidden, not destroyed).

```html
<div rdxAutocompleteRoot>
  <div rdxAutocompleteInputGroup>
    <input rdxAutocompleteInput />
    <button rdxAutocompleteClear></button>
  </div>

  <div *rdxAutocompletePortal rdxAutocompletePositioner>
    <div rdxAutocompletePopup>
      <div rdxAutocompleteList>
        <div rdxAutocompleteGroup>
          <div rdxAutocompleteGroupLabel></div>
          <div rdxAutocompleteItem>
            <span rdxAutocompleteItemIndicator></span>
          </div>
        </div>
      </div>
      <div rdxAutocompleteEmpty></div>
    </div>
  </div>
</div>
```

## Examples

- [Default](../examples/autocomplete--default.md)
- [Inline autocompletion](../examples/autocomplete--inline-autocompletion.md)
- [Auto highlight](../examples/autocomplete--auto-highlight.md)
- [Grouped](../examples/autocomplete--grouped.md)
- [Limit](../examples/autocomplete--limit.md)
- [Fuzzy matching](../examples/autocomplete--fuzzy-matching.md)
- [Localization](../examples/autocomplete--localization.md)
- [Async](../examples/autocomplete--async.md)
- [Command palette](../examples/autocomplete--command-palette.md)
- [Grid](../examples/autocomplete--grid.md)
- [Controlled open state](../examples/autocomplete--controlled-open-state.md)
- [Virtualized](../examples/autocomplete--virtualized.md)
- [Reactive forms](../examples/autocomplete--reactive-forms.md)
- [Template-driven forms](../examples/autocomplete--template-driven-forms.md)
- [Validation](../examples/autocomplete--validation.md)
- [Disabled](../examples/autocomplete--disabled.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/autocomplete.json`
- Styling (parts + `data-*`): `references/styling-contract/autocomplete.json`
