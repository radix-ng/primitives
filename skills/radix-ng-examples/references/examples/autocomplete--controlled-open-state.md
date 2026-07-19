# Autocomplete — Controlled open state

> One example from the [Autocomplete](../components/autocomplete.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

When the app owns `open`, listen to `(onOpenChange)` instead of treating it like a plain boolean
output. Popup primitives emit a change object with `reason`, `event`, and cancellable
`eventDetails`.

```ts
protected readonly open = signal(false);

protected onOpenChange(change: { open: boolean; eventDetails: { cancel(): void } }) {
  if (!change.open && this.shouldStayOpenWhileLoading) {
    change.eventDetails.cancel();
    return;
  }

  this.open.set(change.open);
}
```
