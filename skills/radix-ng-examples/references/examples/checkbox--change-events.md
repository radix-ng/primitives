# Checkbox — Change events

> One example from the [Checkbox](../components/checkbox.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

`onCheckedChange` emits `{ checked, eventDetails }`; `rdxCheckboxGroup` emits `{ value, eventDetails }`.
Call `eventDetails.cancel()` before updating controlled state to reject a change.

```html
<div [checked]="checked()" (onCheckedChange)="setChecked($event)" rdxCheckboxRoot>
  ...
</div>
```

```ts
setChecked(change: RdxCheckboxCheckedChangeEvent) {
  if (this.readOnlyPolicy()) {
    change.eventDetails.cancel();
    return;
  }

  this.checked.set(change.checked);
}
```
