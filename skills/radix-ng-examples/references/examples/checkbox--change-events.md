# Checkbox — Change events

> One example from the [Checkbox](../components/checkbox.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

`onCheckedChange` emits `{ checked, eventDetails }`; `rdxCheckboxGroup` emits `{ value, eventDetails }`.
A child or select-all checkbox emits first. The group receives the same event details if the child
accepts the request. Call `eventDetails.cancel()` in either handler to veto the edit.
Use `[controlledChecked]` or `[controlledValue]` when the parent decides which requests to apply.
Use `[(checked)]` or `[(value)]` for an editable Angular model. Angular form values and explicit
bindings take precedence over `defaultChecked` and `defaultValue`, which apply only at initialization.

```html
<div [controlledChecked]="checked()" (onCheckedChange)="setChecked($event)" rdxCheckboxRoot>
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

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
