# Pagination

Displays data in paged format and provides navigation between pages.

> Index — full source of each example is one click away in `../examples/pagination--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

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

## Examples

- [With ellipsis](../examples/pagination--with-ellipsis.md)
- [With first/last button](../examples/pagination--with-first-last-button.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/pagination.json`
- Styling (parts + `data-*`): `references/styling-contract/pagination.json`
