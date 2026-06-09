# Visually Hidden

#### Hides content visually while keeping it available to assistive technology.

```html
<button
  class="border-border bg-background text-foreground hover:bg-muted focus-visible:ring-ring inline-flex size-10 items-center justify-center rounded-md border outline-none focus-visible:ring-2"
>
  <svg
    class="size-4"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"
    />
  </svg>
  <span rdxVisuallyHidden>Add to favorites</span>
</button>
```

## Features

- ✅ Hides content from the screen while preserving it for screen readers.
- ✅ `focusable` mode keeps the element in the tab order and accessibility tree.
- ✅ `fully-hidden` mode removes it from layout, the tab order and the accessibility tree.
- ✅ Companion directives mirror a value into a visually hidden `<input>` for form participation.

## Import

```typescript
import {
  RdxVisuallyHiddenDirective,
  RdxVisuallyHiddenInputDirective,
  RdxVisuallyHiddenInputBubbleDirective
} from '@radix-ng/primitives/visually-hidden';
```

## Anatomy

Most often you wrap a label that gives an icon-only control an accessible name:

```html
<button>
  <icon aria-hidden="true" />
  <span rdxVisuallyHidden>Add to favorites</span>
</button>
```

## API Reference

### VisuallyHidden

`RdxVisuallyHiddenDirective` — selector `[rdxVisuallyHidden]`.

Applies the visually-hidden style recipe to its host element.

It also exposes a `setFeature(feature)` method to switch the mode imperatively at runtime.

| Data Attribute  | Value                       |
| --------------- | --------------------------- |
| `[data-hidden]` | Present when `fully-hidden` |

#### Feature modes

- **`focusable`** (default) — the element stays in the accessibility tree and tab order; use it for screen-reader-only
  content that must remain reachable.
- **`fully-hidden`** — adds `aria-hidden`, `tabindex="-1"`, the `hidden` attribute and `display: none`, removing the
  element from layout, the tab order and the accessibility tree.

```html
<visually-hidden-feature-demo />
```

### VisuallyHiddenInput

`RdxVisuallyHiddenInputDirective` — selector `input[rdxVisuallyHiddenInput]`.

Apply it to a real `<input>` to mirror a control's value into a form while the field stays hidden. It carries a single
scalar value and re-dispatches `input`/`change` events so the value participates in form submission. Defaults the field
to `fully-hidden`.

```html
<form class="flex flex-col gap-4" (submit)="$event.preventDefault()">
  <div class="flex items-center gap-2">
    <label class="text-foreground text-sm font-medium" for="visibleInput">Visible field</label>
    <input
      class="border-border bg-background text-foreground focus:ring-ring h-9 w-52 rounded-md border px-2.5 text-sm focus:ring-2 focus:outline-none"
      id="visibleInput"
      type="text"
      name="visibleInput"
      value="Visible value"
    />
  </div>

  <input
    rdxVisuallyHiddenInput
    [feature]="'fully-hidden'"
    [name]="'hiddenInput'"
    [value]="'Hidden value'"
    [required]="true"
  />

  <p class="text-muted-foreground text-sm">
    The hidden input carries its value into the form while staying out of the visual and accessibility tree.
  </p>
</form>
```

### VisuallyHiddenInputBubble

`RdxVisuallyHiddenInputBubbleDirective` — selector `input[rdxVisuallyHiddenInputBubble]`.

The low-level building block behind `VisuallyHiddenInput`. It owns the `name`/`value`/`checked` attributes and keeps the
native input value in sync, re-emitting `input`/`change` events. Compose it via `hostDirectives` when building your own
form-aware primitive.

## Accessibility

Use visually hidden content as an alternative to `aria-label`/`aria-labelledby` when you need rendered text (for
example, an accessible name for an icon-only button) that should not be visible on screen. Keep the `focusable` default
for anything that must stay in the accessibility tree; reserve `fully-hidden` for elements that should be entirely
removed, such as form bubble inputs.
