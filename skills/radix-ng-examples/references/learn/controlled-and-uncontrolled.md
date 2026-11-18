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
import {
    RdxDialogBackdrop,
    RdxDialogClose,
    RdxDialogDescription,
    RdxDialogPopup,
    RdxDialogPortal,
    RdxDialogRoot,
    RdxDialogTitle,
    RdxDialogTrigger
} from '@radix-ng/primitives/dialog';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-dialog-default',
    imports: [
        RdxDialogRoot,
        RdxDialogTrigger,
        RdxDialogPortal,
        RdxDialogBackdrop,
        RdxDialogPopup,
        RdxDialogTitle,
        RdxDialogDescription,
        RdxDialogClose,
        LucideX
    ],
    template: `
        <div rdxDialogRoot>
            <button class="demo-button demo-button-primary h-9 px-4" rdxDialogTrigger>Edit profile</button>

            <ng-template rdxDialogPortal>
                <div
                    class="bg-foreground/50 data-[open]:animate-dialog-overlay-in data-[closed]:animate-dialog-overlay-out fixed inset-0 z-50"
                    rdxDialogBackdrop
                ></div>

                <div
                    class="demo-surface data-[open]:animate-dialog-popup-in data-[closed]:animate-dialog-popup-out fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 p-6 transition-[transform,scale] focus:outline-none data-[nested-dialog-open]:scale-[0.96]"
                    rdxDialogPopup
                >
                    <h2 class="demo-dialog-title" rdxDialogTitle>Edit profile</h2>
                    <p class="text-muted-foreground mt-1.5 text-sm" rdxDialogDescription>
                        Make changes to your profile here. Click save when you're done.
                    </p>

                    <label class="demo-label mt-4 grid gap-1.5">
                        Name
                        <input class="demo-input h-9 w-full px-3" value="Pedro Duarte" />
                    </label>
                    <label class="demo-label mt-4 grid gap-1.5">
                        Username
                        <input class="demo-input h-9 w-full px-3" value="@peduarte" />
                    </label>

                    <div class="mt-6 flex justify-end gap-2">
                        <button class="demo-button demo-button-outline h-8 px-3 text-xs" rdxDialogClose>Cancel</button>
                        <button class="demo-button demo-button-primary h-8 px-3 text-xs" rdxDialogClose>
                            Save changes
                        </button>
                    </div>

                    <button
                        class="demo-button demo-button-ghost absolute top-3 right-3 size-7 p-0"
                        aria-label="Close"
                        rdxDialogClose
                    >
                        <svg aria-hidden="true" lucideX size="16" />
                    </button>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDialogDefaultComponent {}
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
import {
    RdxDialogBackdrop,
    RdxDialogClose,
    RdxDialogDescription,
    RdxDialogPopup,
    RdxDialogPortal,
    RdxDialogRoot,
    RdxDialogTitle,
    RdxDialogTrigger
} from '@radix-ng/primitives/dialog';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-dialog-controlled',
    imports: [
        RdxDialogRoot,
        RdxDialogTrigger,
        RdxDialogPortal,
        RdxDialogBackdrop,
        RdxDialogPopup,
        RdxDialogTitle,
        RdxDialogDescription,
        RdxDialogClose,
        LucideX
    ],
    template: `
        <div class="flex flex-col items-center gap-4">
            <p class="text-muted-foreground text-xs">Dialog is {{ open() ? 'open' : 'closed' }}</p>

            <div class="flex gap-2">
                <button class="demo-button demo-button-outline h-8 px-3 text-xs" (click)="open.set(true)">
                    Open from outside
                </button>
            </div>

            <div [(open)]="open" rdxDialogRoot>
                <button class="demo-button demo-button-primary h-9 px-4" rdxDialogTrigger>Open dialog</button>

                <ng-template rdxDialogPortal>
                    <div
                        class="bg-foreground/50 data-[open]:animate-dialog-overlay-in data-[closed]:animate-dialog-overlay-out fixed inset-0 z-50"
                        rdxDialogBackdrop
                    ></div>

                    <div
                        class="demo-surface data-[open]:animate-dialog-popup-in data-[closed]:animate-dialog-popup-out fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 p-6 transition-[transform,scale] focus:outline-none data-[nested-dialog-open]:scale-[0.96]"
                        rdxDialogPopup
                    >
                        <h2 class="demo-dialog-title" rdxDialogTitle>Controlled dialog</h2>
                        <p class="text-muted-foreground mt-1.5 text-sm" rdxDialogDescription>
                            The open state is owned by the component and bound with
                            <code>[(open)]</code>
                            .
                        </p>

                        <div class="mt-6 flex justify-end gap-2">
                            <button class="demo-button demo-button-primary h-8 px-3 text-xs" (click)="open.set(false)">
                                Close from outside
                            </button>
                        </div>

                        <button
                            class="demo-button demo-button-ghost absolute top-3 right-3 size-7 p-0"
                            aria-label="Close"
                            rdxDialogClose
                        >
                            <svg aria-hidden="true" lucideX size="16" />
                        </button>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class RdxDialogControlledComponent {
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
