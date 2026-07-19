# Meter — Custom range

> One example from the [Meter](../components/meter.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

Use `min`, `max`, and `format` when the measured value is not a simple 0-100 range.

```html
<div
    [value]="value"
    [min]="min"
    [max]="max"
    [format]="format"
    [getAriaValueText]="getAriaValueText"
    [class]="c.root"
    rdxMeterRoot
>
    <div [class]="c.header">
        <span [class]="c.label" rdxMeterLabel>Fuel level</span>
        <span [class]="c.value" rdxMeterValue></span>
    </div>

    <div [class]="c.track" rdxMeterTrack>
        <div [class]="cn(c.indicator, 'w-[44%]')" rdxMeterIndicator></div>
    </div>
</div>
```
