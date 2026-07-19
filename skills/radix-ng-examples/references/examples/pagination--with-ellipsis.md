# Pagination — With ellipsis

> One example from the [Pagination](../components/pagination.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

You can add `rdxPaginationEllipsis` as a visual cue for more previous and after items.

```html
<div rdxPaginationRoot>
    <div rdxPaginationList #list="rdxPaginationList">

        @for (item of list.transformedRange(); track item) {
            @if (item.type == 'page') {
                <button rdxPaginationListItem [value]="item.value">{{ item.value }}</button>
            } @else {
                <div rdxPaginationEllipsis>&#8230;</div>
            }
        }

    </div>
</div>
```
