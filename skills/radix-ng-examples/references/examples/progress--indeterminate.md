# Progress — Indeterminate

> One example from the [Progress](../components/progress.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

Use `null` when progress is active but the current value is unknown.

```html
<div [value]="null" [class]="c.root" rdxProgressRoot>
    <div [class]="c.header">
        <span [class]="c.label" rdxProgressLabel>Preparing upload</span>
        <span [class]="c.value" rdxProgressValue></span>
    </div>

    <div [class]="c.track" rdxProgressTrack>
        <div [class]="cn(c.indicator, 'w-1/3')" rdxProgressIndicator></div>
    </div>
</div>
```
