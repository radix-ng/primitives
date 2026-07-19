# Pagination — With first/last button

> One example from the [Pagination](../components/pagination.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

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
