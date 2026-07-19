# Meter — Aria value text

> One example from the [Meter](../components/meter.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

Use `aria-valuetext` when the numeric value needs a more descriptive text alternative.

```html
<div [value]="value" [aria-valuetext]="ariaValueText" [class]="c.root" rdxMeterRoot>
    <div [class]="c.header">
        <span [class]="c.label" rdxMeterLabel>Memory pressure</span>
        <span [class]="c.value" rdxMeterValue></span>
    </div>

    <div [class]="c.track" rdxMeterTrack>
        <div [class]="cn(c.indicator, 'w-[88%]', 'bg-destructive')" rdxMeterIndicator></div>
    </div>
</div>
```
