# Progress — Custom range

> One example from the [Progress](../components/progress.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

Use `min`, `max`, and `valueLabel` when progress is not a simple 0-100 percentage.

```html
<div [value]="value" [min]="min" [max]="max" [valueLabel]="valueLabel" [class]="c.root" rdxProgressRoot>
    <div [class]="c.header">
        <span [class]="c.label" rdxProgressLabel>Transfer</span>
        <span [class]="c.value" rdxProgressValue></span>
    </div>

    <div [class]="c.track" rdxProgressTrack>
        <div [class]="cn(c.indicator, 'w-1/2')" rdxProgressIndicator></div>
    </div>
</div>
```
