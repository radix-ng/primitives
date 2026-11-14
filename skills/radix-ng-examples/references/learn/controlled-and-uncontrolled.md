# Controlled & uncontrolled

#### Why primitives just work out of the box, and when to take the wheel.

Every stateful primitive can run in two modes. Knowing which one you're in — and that
**uncontrolled is the default** — saves a lot of "why isn't this opening?" confusion.

## Uncontrolled: the primitive owns the state

By default you place the parts and the primitive manages everything itself. No signal, no handler,
no binding:

```html
<div rdxDialogRoot>
  <button rdxDialogTrigger>Open</button>

  <ng-template rdxDialogPortal>
    <div rdxDialogBackdrop></div>
    <div rdxDialogPopup>
      <h2 rdxDialogTitle>Edit profile</h2>
      <button rdxDialogClose>Close</button>
    </div>
  </ng-template>
</div>
```

The trigger opens it, the close button and Escape close it, focus is trapped and restored — all
handled. Try it:

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog, demoInput } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-dialog-default',
    imports: [...dialogImports, LucideX],
    template: `
        <div rdxDialogRoot>
            <button [class]="cn(b.base, b.primary, b.size.md)" rdxDialogTrigger>Edit profile</button>

            <ng-template rdxDialogPortal>
                <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxDialogBackdrop></div>

                <div [class]="cn(d.popup, d.popupAnimated)" rdxDialogPopup>
                    <h2 [class]="d.title" rdxDialogTitle>Edit profile</h2>
                    <p [class]="d.description" rdxDialogDescription>
                        Make changes to your profile here. Click save when you're done.
                    </p>

                    <label [class]="d.field">
                        Name
                        <input [class]="input" value="Pedro Duarte" />
                    </label>
                    <label [class]="d.field">
                        Username
                        <input [class]="input" value="@peduarte" />
                    </label>

                    <div [class]="d.footer">
                        <button [class]="cn(b.base, b.outline, b.size.sm)" rdxDialogClose>Cancel</button>
                        <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDialogClose>Save changes</button>
                    </div>

                    <button [class]="d.close" aria-label="Close" rdxDialogClose>
                        <svg aria-hidden="true" lucideX size="16" />
                    </button>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDialogDefaultComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
    protected readonly input = demoInput;
}
```

Need it to start open? Seed the **initial** state with the `default*` input and still stay
uncontrolled:

```html
<div rdxDialogRoot defaultOpen>…</div>
```

`defaultOpen` is read once to set the starting value; after that the primitive owns it.

## Controlled: your application owns the state

Reach for controlled mode only when the app needs to **drive or observe** the state — open a dialog
from elsewhere, persist it, or veto a change. Stateful primitives expose the value as an Angular
`model()`, so you bind your own signal and listen to the change output:

```ts
@Component({
  template: `
    <button (click)="open.set(true)">Edit from anywhere</button>

    <div [open]="open()" (onOpenChange)="onOpenChange($event)" rdxDialogRoot>
      …
    </div>
  `
})
export class Profile {
  protected readonly open = signal(false);

  protected onOpenChange(change: { open: boolean; eventDetails: { cancel(): void } }) {
    if (!change.open && this.hasUnsavedChanges) {
      change.eventDetails.cancel();
      return;
    }

    this.open.set(change.open);
  }
}
```

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-dialog-controlled',
    imports: [...dialogImports, LucideX],
    template: `
        <div class="flex flex-col items-center gap-4">
            <p class="text-muted-foreground text-xs">Dialog is {{ open() ? 'open' : 'closed' }}</p>

            <div class="flex gap-2">
                <button [class]="cn(b.base, b.outline, b.size.sm)" (click)="open.set(true)">Open from outside</button>
            </div>

            <div [(open)]="open" rdxDialogRoot>
                <button [class]="cn(b.base, b.primary, b.size.md)" rdxDialogTrigger>Open dialog</button>

                <ng-template rdxDialogPortal>
                    <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxDialogBackdrop></div>

                    <div [class]="cn(d.popup, d.popupAnimated)" rdxDialogPopup>
                        <h2 [class]="d.title" rdxDialogTitle>Controlled dialog</h2>
                        <p [class]="d.description" rdxDialogDescription>
                            The open state is owned by the component and bound with
                            <code>[(open)]</code>
                            .
                        </p>

                        <div [class]="d.footer">
                            <button [class]="cn(b.base, b.primary, b.size.sm)" (click)="open.set(false)">
                                Close from outside
                            </button>
                        </div>

                        <button [class]="d.close" aria-label="Close" rdxDialogClose>
                            <svg aria-hidden="true" lucideX size="16" />
                        </button>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class RdxDialogControlledComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
    protected readonly open = signal(false);
}
```

Because it's a `model()`, two-way binding works too when every change should be accepted as-is:

```html
<div [(open)]="open" rdxDialogRoot>…</div>
```

Use the long form (`[open]` + `(onOpenChange)`) when you want to **inspect or reject** a change
before applying it. Base UI-aligned outputs emit a change object with `eventDetails.cancel()`.
Use `[(open)]` when you simply want your signal kept in sync.

## The mental rule

> Bind state **only** when something outside the primitive needs to read or change it. Otherwise
> leave it uncontrolled — you get the full accessible behavior for free, and there's less of your own
> code to keep correct.

A common mistake is binding `[open]="open()"` but forgetting `(onOpenChange)`. Now the primitive
asks to open, your signal never updates, and it snaps shut — a half-controlled component. If you
bind the value, you must also handle its change (or use `[(open)]`).

## Next

→ **Composition** — you've used primitives as-is. Next: building your own components _on top_ of
them with `hostDirectives` and the Root context.
