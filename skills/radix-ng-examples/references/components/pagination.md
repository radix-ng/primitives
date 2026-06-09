# Pagination

#### Displays data in paged format and provides navigation between pages.

```html
<div rdxPaginationRoot total="100" siblingCount="1" defaultPage="2" showEdges itemsPerPage="10">
  <div class="text-foreground flex items-center gap-1" rdxPaginationList #list="rdxPaginationList">
    <button
      class="bg-background text-foreground border-border hover:bg-muted focus-visible:ring-ring flex size-9 items-center justify-center rounded-md border shadow-sm transition-colors outline-none focus-visible:ring-2 disabled:opacity-50"
      rdxPaginationFirst
    >
      <svg lucideChevronsLeft size="16" strokeWidth="2" />
    </button>
    <button
      class="bg-background text-foreground border-border hover:bg-muted focus-visible:ring-ring mr-4 flex size-9 items-center justify-center rounded-md border shadow-sm transition-colors outline-none focus-visible:ring-2 disabled:opacity-50"
      rdxPaginationPrev
    >
      <svg lucideChevronLeft size="16" strokeWidth="2" />
    </button>

    @for (item of list.transformedRange(); track item) { @if (item.type == 'page') {
    <button
      class="bg-background text-foreground border-border hover:bg-muted data-[selected]:bg-primary data-[selected]:text-primary-foreground focus-visible:ring-ring flex size-9 items-center justify-center rounded-md border shadow-sm transition-colors outline-none focus-visible:ring-2 disabled:opacity-50"
      rdxPaginationListItem
      [value]="item.value"
    >
      {{ item.value }}
    </button>
    } @else {
    <div class="text-muted-foreground flex size-9 items-center justify-center" rdxPaginationEllipsis>&#8230;</div>
    } }

    <button
      class="bg-background text-foreground border-border hover:bg-muted focus-visible:ring-ring ml-4 flex size-9 items-center justify-center rounded-md border shadow-sm transition-colors outline-none focus-visible:ring-2 disabled:opacity-50"
      rdxPaginationNext
    >
      <svg lucideChevronRight size="16" strokeWidth="2" />
    </button>
    <button
      class="bg-background text-foreground border-border hover:bg-muted focus-visible:ring-ring flex size-9 items-center justify-center rounded-md border shadow-sm transition-colors outline-none focus-visible:ring-2 disabled:opacity-50"
      rdxPaginationLast
    >
      <svg lucideChevronsRight size="16" strokeWidth="2" />
    </button>
  </div>
</div>
```

## Features

- ✅ Enable quick access to first, or last page.
- ✅ Enable to show edges constantly, or not.

## Import

Get started with importing the directives:

```typescript
import { RdxPaginationModule } from '@radix-ng/primitives/pagination';
```

## Anatomy

```html
<div rdxPaginationRoot>
  <div rdxPaginationList #list="rdxPaginationList">
    <button rdxPaginationFirst></button>
    <button rdxPaginationPrev></button>

    @for (item of list.transformedRange(); track item) {
    <button rdxPaginationListItem [value]="item.value">{{ item.value }}</button>
    }

    <button rdxPaginationNext></button>
    <button rdxPaginationLast></button>
  </div>
</div>
```

## API Reference

### Root

`RdxPaginationRootDirective`

### List

`RdxPaginationListDirective`

Used to show the list of pages. It also makes pagination accessible to assistive technologies.

### Item

`RdxPaginationListItemDirective`

Used to render the button that changes the current page.

| Data Attribute  | Value        |
| --------------- | ------------ |
| [data-selected] | `true` or `` |
| [data-type]     | "page"       |

### Ellipsis

`RdxPaginationEllipsisDirective`

Placeholder element when the list is long, and only a small amount of `siblingCount` was set and `showEdges` was set to `true`.

| Data Attribute | Value      |
| -------------- | ---------- |
| [data-type]    | `ellipsis` |

## Accessibility

### Keyboard Interactions

| Key     | Description                                                                |
| ------- | -------------------------------------------------------------------------- |
| `Tab`   | Moves focus to the next focusable element.                                 |
| `Space` | When focus is on a any trigger, trigger selected page or arrow navigation. |
| `Enter` | When focus is on a any trigger, trigger selected page or arrow navigation. |

## Examples

### With ellipsis

You can add `rdxPaginationEllipsis` as a visual cue for more previous and after items.

```html
<div rdxPaginationRoot>
  <div rdxPaginationList #list="rdxPaginationList">
    @for (item of list.transformedRange(); track item) { @if (item.type == 'page') {
    <button rdxPaginationListItem [value]="item.value">{{ item.value }}</button>
    } @else {
    <div rdxPaginationEllipsis>&#8230;</div>
    } }
  </div>
</div>
```

### With first/last button

You can add `rdxPaginationFirst` to allow user to navigate to first page, or `rdxPaginationLast` to navigate to last page.

```html
<div rdxPaginationRoot>
  <div rdxPaginationList #list="rdxPaginationList">
    <button rdxPaginationFirst></button>
    ...
    <button rdxPaginationLast></button>
  </div>
</div>
```
