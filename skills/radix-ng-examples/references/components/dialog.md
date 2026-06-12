# Dialog

#### A window overlaid on the page, rendering the content underneath inert.

Dialog composes the shared Portal, Presence, Dismissable Layer, and Focus Scope primitives.
It stays headless: styles and native CSS animations belong to the consumer.

```typescript
import { Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog, demoInput } from '../../storybook/styles';

@Component({
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

## Features

- ✅ Opens and closes from a native button trigger.
- ✅ Supports uncontrolled state, `defaultOpen`, and Angular two-way binding with `[(open)]`.
- ✅ Supports modal, non-modal, and focus-trapping-only behavior.
- ✅ Locks document scrolling and disables outside pointer events while modal.
- ✅ Closes on Escape, outside pointer interaction, or an explicit close button.
- ✅ Keeps the dialog open on outside clicks with `disablePointerDismissal`.
- ✅ Traps and restores focus through the shared Focus Scope behavior.
- ✅ Exposes state and transition attributes (`data-state`, `data-starting-style`, `data-ending-style`) for styling.
- ✅ Keeps portal content mounted while CSS exit keyframes finish.
- ✅ Links the popup to optional title and description parts for accessible labeling.
- ✅ Supports multiple triggers, controlled `triggerId`, and detached triggers through a shared handle.
- ✅ Supports nested dialogs with `data-nested` / `data-nested-dialog-open` styling hooks.
- ✅ Provides an optional scrollable `Viewport` for outside-scroll dialogs.

## Import

```typescript
import {
    createRdxDialogHandle,
    RdxDialogBackdrop,
    RdxDialogClose,
    RdxDialogDescription,
    RdxDialogPopup,
    RdxDialogPortal,
    RdxDialogRoot,
    RdxDialogTitle,
    RdxDialogTrigger,
    RdxDialogViewport
} from '@radix-ng/primitives/dialog';
```

Or import all parts through the module:

```typescript
import { RdxDialogModule } from '@radix-ng/primitives/dialog';
```

The `dialogImports` array re-exports every part for standalone `imports`.

## Anatomy

Apply the parts to your own markup. `rdxDialogPortal` is a **structural** directive: it teleports the
backdrop and popup into `document.body` while the dialog is open and keeps them mounted until the
closed-state CSS exit keyframes on every root element finish. Because the dialog has two root nodes
(backdrop + popup), use the explicit `<ng-template rdxDialogPortal>` form (pass `[container]` for a
custom portal target).

```html
<div rdxDialogRoot>
    <button rdxDialogTrigger>Open</button>

    <ng-template rdxDialogPortal>
        <div rdxDialogBackdrop></div>
        <div rdxDialogPopup>
            <h2 rdxDialogTitle>Edit profile</h2>
            <p rdxDialogDescription>Make changes to your profile.</p>
            <button rdxDialogClose>Close</button>
        </div>
    </ng-template>
</div>
```

## Examples

### Default

A modal dialog with an accessible title and description, form fields, and close buttons.

```typescript
import { Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog, demoInput } from '../../storybook/styles';

@Component({
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

### Controlled

Bind `[(open)]` when application state should open or close the dialog programmatically.

```typescript
import { Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
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

### Non-modal

Set `[modal]="false"` to keep document scrolling and outside pointer interactions available. There is
no backdrop in this mode.

```typescript
import { Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    selector: 'rdx-dialog-non-modal',
    imports: [...dialogImports, LucideX],
    template: `
        <div class="flex flex-col items-center gap-4">
            <p class="text-muted-foreground max-w-96 text-center text-xs leading-5">
                Non-modal: page scrolling and outside pointer interactions stay enabled while the dialog is open.
            </p>

            <div [modal]="false" rdxDialogRoot>
                <button [class]="cn(b.base, b.primary, b.size.md)" rdxDialogTrigger>Open non-modal dialog</button>

                <ng-template rdxDialogPortal>
                    <div [class]="cn(d.popup, d.popupAnimated)" rdxDialogPopup>
                        <h2 [class]="d.title" rdxDialogTitle>Non-modal dialog</h2>
                        <p [class]="d.description" rdxDialogDescription>
                            There is no backdrop, so you can keep interacting with the rest of the page.
                        </p>

                        <button [class]="d.close" aria-label="Close" rdxDialogClose>
                            <svg aria-hidden="true" lucideX size="16" />
                        </button>
                    </div>
                </ng-template>
            </div>

            <button [class]="cn(b.base, b.secondary, b.size.sm)" (click)="outsideClicks.update((count) => count + 1)">
                Outside interaction target: {{ outsideClicks() }}
            </button>
        </div>
    `
})
export class RdxDialogNonModalComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
    protected readonly outsideClicks = signal(0);
}
```

### Trap focus only

Use `modal="trap-focus"` to keep keyboard focus inside the dialog while leaving document scrolling and
outside pointer interactions enabled.

```typescript
import { Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog, demoInput } from '../../storybook/styles';

@Component({
    selector: 'rdx-dialog-trap-focus',
    imports: [...dialogImports, LucideX],
    template: `
        <div class="flex flex-col items-center gap-4">
            <p class="text-muted-foreground max-w-96 text-center text-xs leading-5">
                Trap focus: keyboard focus stays inside the dialog (Tab cycles its controls), while page scrolling and
                outside pointer interactions remain available.
            </p>

            <div modal="trap-focus" rdxDialogRoot>
                <button [class]="cn(b.base, b.primary, b.size.md)" rdxDialogTrigger>Open dialog</button>

                <ng-template rdxDialogPortal>
                    <div [class]="cn(d.popup, d.popupAnimated)" rdxDialogPopup>
                        <h2 [class]="d.title" rdxDialogTitle>Focus is trapped</h2>
                        <p [class]="d.description" rdxDialogDescription>
                            Press Tab and notice focus never leaves the dialog.
                        </p>

                        <label [class]="d.field">
                            First field
                            <input [class]="input" placeholder="Focused when opened" />
                        </label>
                        <label [class]="d.field">
                            Second field
                            <input [class]="input" placeholder="Tab to reach me" />
                        </label>

                        <div [class]="d.footer">
                            <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDialogClose>Done</button>
                        </div>

                        <button [class]="d.close" aria-label="Close" rdxDialogClose>
                            <svg aria-hidden="true" lucideX size="16" />
                        </button>
                    </div>
                </ng-template>
            </div>

            <button [class]="cn(b.base, b.secondary, b.size.sm)" (click)="outsideClicks.update((count) => count + 1)">
                Outside interaction target: {{ outsideClicks() }}
            </button>
        </div>
    `
})
export class RdxDialogTrapFocusComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
    protected readonly input = demoInput;
    protected readonly outsideClicks = signal(0);
}
```

### Without pointer dismissal

Set `disablePointerDismissal` so clicking the backdrop no longer closes the dialog. Escape and explicit
close buttons still close it.

```typescript
import { Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    selector: 'rdx-dialog-without-dismiss',
    imports: [...dialogImports, LucideX],
    template: `
        <div [disablePointerDismissal]="true" rdxDialogRoot>
            <button [class]="cn(b.base, b.primary, b.size.md)" rdxDialogTrigger>Open dialog</button>

            <ng-template rdxDialogPortal>
                <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxDialogBackdrop></div>

                <div [class]="cn(d.popup, d.popupAnimated)" rdxDialogPopup>
                    <h2 [class]="d.title" rdxDialogTitle>Confirm your choice</h2>
                    <p [class]="d.description" rdxDialogDescription>
                        Clicking the backdrop will not close this dialog. Use a button or press Escape instead.
                    </p>

                    <div [class]="d.footer">
                        <button [class]="cn(b.base, b.outline, b.size.sm)" rdxDialogClose>Cancel</button>
                        <button [class]="cn(b.base, b.destructive, b.size.sm)" rdxDialogClose>Delete</button>
                    </div>

                    <button [class]="d.close" aria-label="Close" rdxDialogClose>
                        <svg aria-hidden="true" lucideX size="16" />
                    </button>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDialogWithoutDismissComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
}
```

### Multiple triggers

Several `rdxDialogTrigger` buttons can open the same dialog. The active trigger and its `payload` are
exposed on the root so the content can adapt.

```typescript
import { Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    selector: 'rdx-dialog-multiple-triggers',
    imports: [...dialogImports, LucideX],
    template: `
        <div #root="rdxDialogRoot" rdxDialogRoot>
            <div class="flex gap-2">
                <button [class]="cn(b.base, b.outline, b.size.md)" payload="Lemon" rdxDialogTrigger>Lemon</button>
                <button [class]="cn(b.base, b.outline, b.size.md)" payload="Lime" rdxDialogTrigger>Lime</button>
                <button [class]="cn(b.base, b.outline, b.size.md)" payload="Orange" rdxDialogTrigger>Orange</button>
            </div>

            <ng-template rdxDialogPortal>
                <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxDialogBackdrop></div>
                <div [class]="cn(d.popup, d.popupAnimated)" rdxDialogPopup>
                    <h2 [class]="d.title" rdxDialogTitle>{{ root.payload() || 'Fruit' }}</h2>
                    <p [class]="d.description" rdxDialogDescription>
                        Every trigger opens the same dialog; the active trigger's
                        <code>payload</code>
                        is shown here.
                    </p>
                    <div [class]="d.footer">
                        <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDialogClose>Close</button>
                    </div>
                    <button [class]="d.close" aria-label="Close" rdxDialogClose>
                        <svg aria-hidden="true" lucideX size="16" />
                    </button>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDialogMultipleTriggersComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
}
```

### Controlled mode with multiple triggers

Bind both `[(open)]` and `[(triggerId)]` to choose which trigger is active from component state.

```typescript
import { Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    selector: 'rdx-dialog-controlled-multiple',
    imports: [...dialogImports, LucideX],
    template: `
        <div class="flex flex-col items-center gap-3">
            <p class="text-muted-foreground text-xs">open: {{ open() }} · triggerId: {{ triggerId() ?? '—' }}</p>

            <div #root="rdxDialogRoot" [(open)]="open" [(triggerId)]="triggerId" rdxDialogRoot>
                <div class="flex gap-2">
                    <button id="account" [class]="cn(b.base, b.outline, b.size.md)" rdxDialogTrigger>Account</button>
                    <button id="billing" [class]="cn(b.base, b.outline, b.size.md)" rdxDialogTrigger>Billing</button>
                </div>

                <ng-template rdxDialogPortal>
                    <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxDialogBackdrop></div>
                    <div [class]="cn(d.popup, d.popupAnimated)" rdxDialogPopup>
                        <h2 [class]="d.title" rdxDialogTitle>
                            {{ triggerId() === 'billing' ? 'Billing' : 'Account' }}
                        </h2>
                        <p [class]="d.description" rdxDialogDescription>
                            Both
                            <code>open</code>
                            and
                            <code>triggerId</code>
                            are bound, so the active panel is driven from component state.
                        </p>
                        <div [class]="d.footer">
                            <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDialogClose>Close</button>
                        </div>
                        <button [class]="d.close" aria-label="Close" rdxDialogClose>
                            <svg aria-hidden="true" lucideX size="16" />
                        </button>
                    </div>
                </ng-template>
            </div>

            <button [class]="cn(b.base, b.secondary, b.size.sm)" (click)="openBilling()">
                Open billing externally
            </button>
        </div>
    `
})
export class RdxDialogControlledMultipleComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
    protected readonly open = signal(false);
    protected readonly triggerId = signal<string | null>(null);

    protected openBilling() {
        this.triggerId.set('billing');
        this.open.set(true);
    }
}
```

### Detached triggers

Create a shared handle with `createRdxDialogHandle()` when triggers live outside `rdxDialogRoot`. The
handle also supports imperative `open(id)`, `toggle(id)`, and `close()`.

```typescript
import { Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { createRdxDialogHandle, dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    selector: 'rdx-dialog-detached',
    imports: [...dialogImports, LucideX],
    template: `
        <div class="flex flex-col items-center gap-3">
            <!-- Triggers live outside the root and are linked through a shared handle. -->
            <div class="flex gap-2">
                <button id="settings" [class]="cn(b.base, b.outline, b.size.md)" [handle]="handle" rdxDialogTrigger>
                    Settings
                </button>
                <button id="profile" [class]="cn(b.base, b.outline, b.size.md)" [handle]="handle" rdxDialogTrigger>
                    Profile
                </button>
            </div>

            <button [class]="cn(b.base, b.secondary, b.size.sm)" (click)="handle.open('profile')">
                Open profile imperatively
            </button>

            <div [handle]="handle" rdxDialogRoot>
                <ng-template rdxDialogPortal>
                    <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxDialogBackdrop></div>
                    <div [class]="cn(d.popup, d.popupAnimated)" rdxDialogPopup>
                        <h2 [class]="d.title" rdxDialogTitle>Detached triggers</h2>
                        <p [class]="d.description" rdxDialogDescription>
                            The triggers and this dialog are connected with
                            <code>createRdxDialogHandle()</code>
                            rather than DOM nesting.
                        </p>
                        <div [class]="d.footer">
                            <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDialogClose>Close</button>
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
export class RdxDialogDetachedComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
    protected readonly handle = createRdxDialogHandle();
}
```

### Nested dialogs

Dialogs can be nested. The parent popup gains `data-nested-dialog-open` and the child popup gains
`data-nested`, which the demo uses to scale the parent back.

```typescript
import { Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    selector: 'rdx-dialog-nested',
    imports: [...dialogImports, LucideX],
    template: `
        <div rdxDialogRoot>
            <button [class]="cn(b.base, b.primary, b.size.md)" rdxDialogTrigger>Open dialog</button>

            <ng-template rdxDialogPortal>
                <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxDialogBackdrop></div>

                <div [class]="cn(d.popup, d.popupAnimated)" rdxDialogPopup>
                    <h2 [class]="d.title" rdxDialogTitle>Parent dialog</h2>
                    <p [class]="d.description" rdxDialogDescription>
                        Opening the nested dialog scales this popup back via
                        <code>[data-nested-dialog-open]</code>
                        .
                    </p>

                    <div [class]="d.footer">
                        <button [class]="cn(b.base, b.outline, b.size.sm)" rdxDialogClose>Close</button>

                        <div rdxDialogRoot>
                            <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDialogTrigger>Open nested</button>

                            <ng-template rdxDialogPortal>
                                <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxDialogBackdrop></div>
                                <div [class]="cn(d.popup, d.popupAnimated)" rdxDialogPopup>
                                    <h2 [class]="d.title" rdxDialogTitle>Nested dialog</h2>
                                    <p [class]="d.description" rdxDialogDescription>
                                        Escape or the backdrop closes this one first, then the parent.
                                    </p>
                                    <div [class]="d.footer">
                                        <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDialogClose>Done</button>
                                    </div>
                                    <button [class]="d.close" aria-label="Close" rdxDialogClose>
                                        <svg aria-hidden="true" lucideX size="16" />
                                    </button>
                                </div>
                            </ng-template>
                        </div>
                    </div>

                    <button [class]="d.close" aria-label="Close" rdxDialogClose>
                        <svg aria-hidden="true" lucideX size="16" />
                    </button>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDialogNestedComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
}
```

### Close confirmation

Drive the dialog with `[(open)]` and listen to `onOpenChange` to intercept a close request and show a
confirmation dialog when there are unsaved changes.

```typescript
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideX } from '@lucide/angular';
import { dialogImports, RdxDialogOpenChange } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog, demoInput } from '../../storybook/styles';

@Component({
    selector: 'rdx-dialog-close-confirmation',
    imports: [...dialogImports, FormsModule, LucideX],
    template: `
        <!-- The editor dialog is controlled so a close request can be intercepted. -->
        <div [(open)]="editorOpen" (onOpenChange)="onEditorOpenChange($event)" rdxDialogRoot>
            <button [class]="cn(b.base, b.primary, b.size.md)" rdxDialogTrigger>Edit description</button>

            <ng-template rdxDialogPortal>
                <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxDialogBackdrop></div>

                <div [class]="cn(d.popup, d.popupAnimated)" rdxDialogPopup>
                    <h2 [class]="d.title" rdxDialogTitle>Edit description</h2>
                    <p [class]="d.description" rdxDialogDescription>
                        Closing with unsaved changes asks for confirmation.
                    </p>

                    <label [class]="d.field">
                        Description
                        <input [(ngModel)]="text" [class]="input" placeholder="Type to create changes" />
                    </label>

                    <div [class]="d.footer">
                        <button [class]="cn(b.base, b.outline, b.size.sm)" (click)="requestClose()">Cancel</button>
                        <button [class]="cn(b.base, b.primary, b.size.sm)" (click)="save()">Save</button>
                    </div>

                    <button [class]="d.close" (click)="requestClose()" aria-label="Close">
                        <svg aria-hidden="true" lucideX size="16" />
                    </button>
                </div>
            </ng-template>
        </div>

        <!-- Confirmation dialog, controlled separately. -->
        <div [(open)]="confirmOpen" rdxDialogRoot>
            <ng-template rdxDialogPortal>
                <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxDialogBackdrop></div>
                <div [class]="cn(d.popup, d.popupAnimated)" rdxDialogPopup>
                    <h2 [class]="d.title" rdxDialogTitle>Discard changes?</h2>
                    <p [class]="d.description" rdxDialogDescription>Your edits will be lost.</p>
                    <div [class]="d.footer">
                        <button [class]="cn(b.base, b.outline, b.size.sm)" (click)="confirmOpen.set(false)">
                            Keep editing
                        </button>
                        <button [class]="cn(b.base, b.destructive, b.size.sm)" (click)="discard()">Discard</button>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDialogCloseConfirmationComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
    protected readonly input = demoInput;

    protected readonly editorOpen = signal(false);
    protected readonly confirmOpen = signal(false);
    protected text = '';

    private get hasChanges() {
        return this.text.trim().length > 0;
    }

    protected onEditorOpenChange(change: RdxDialogOpenChange) {
        // Re-open the editor and ask for confirmation when there are unsaved changes.
        if (!change.open && this.hasChanges) {
            this.editorOpen.set(true);
            this.confirmOpen.set(true);
        }
    }

    protected requestClose() {
        if (this.hasChanges) {
            this.confirmOpen.set(true);
        } else {
            this.editorOpen.set(false);
        }
    }

    protected save() {
        this.text = '';
        this.editorOpen.set(false);
    }

    protected discard() {
        this.text = '';
        this.confirmOpen.set(false);
        this.editorOpen.set(false);
    }
}
```

### Outside scroll

Wrap the popup in `rdxDialogViewport` to make the whole dialog scroll when it is taller than the screen.

```typescript
import { Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    selector: 'rdx-dialog-outside-scroll',
    imports: [...dialogImports, LucideX],
    template: `
        <div rdxDialogRoot>
            <button [class]="cn(b.base, b.primary, b.size.md)" rdxDialogTrigger>Open long dialog</button>

            <ng-template rdxDialogPortal>
                <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxDialogBackdrop></div>

                <!-- The viewport is the scrollable container; the popup grows past the screen. -->
                <div [class]="d.viewport" rdxDialogViewport>
                    <div [class]="cn(d.popupStatic, d.popupAnimated)" rdxDialogPopup>
                        <h2 [class]="d.title" rdxDialogTitle>Terms of service</h2>
                        <p [class]="d.description" rdxDialogDescription>
                            The whole dialog scrolls within the viewport.
                        </p>

                        @for (paragraph of paragraphs; track $index) {
                            <p class="text-muted-foreground mt-4 text-sm">{{ paragraph }}</p>
                        }

                        <div [class]="d.footer">
                            <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDialogClose>Accept</button>
                        </div>

                        <button [class]="d.close" aria-label="Close" rdxDialogClose>
                            <svg aria-hidden="true" lucideX size="16" />
                        </button>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDialogOutsideScrollComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
    protected readonly paragraphs = Array.from(
        { length: 12 },
        (_, i) =>
            `Section ${i + 1}. This is filler content that makes the dialog taller than the viewport so the outer container scrolls.`
    );
}
```

### Inside scroll

Keep the popup fixed on screen and scroll an inner region instead.

```typescript
import { Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    selector: 'rdx-dialog-inside-scroll',
    imports: [...dialogImports, LucideX],
    template: `
        <div rdxDialogRoot>
            <button [class]="cn(b.base, b.primary, b.size.md)" rdxDialogTrigger>Open dialog</button>

            <ng-template rdxDialogPortal>
                <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxDialogBackdrop></div>

                <!-- The popup stays fixed on screen; only its body scrolls. -->
                <div [class]="cn(d.popup, d.popupAnimated, 'flex max-h-[85vh] flex-col')" rdxDialogPopup>
                    <h2 [class]="d.title" rdxDialogTitle>Release notes</h2>
                    <p [class]="d.description" rdxDialogDescription>
                        Header and footer stay put while the body scrolls.
                    </p>

                    <div [class]="d.scrollBody">
                        @for (paragraph of paragraphs; track $index) {
                            <p class="mt-3 first:mt-0">{{ paragraph }}</p>
                        }
                    </div>

                    <div [class]="d.footer">
                        <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDialogClose>Got it</button>
                    </div>

                    <button [class]="d.close" aria-label="Close" rdxDialogClose>
                        <svg aria-hidden="true" lucideX size="16" />
                    </button>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDialogInsideScrollComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
    protected readonly paragraphs = Array.from(
        { length: 14 },
        (_, i) => `Change ${i + 1}. Lots of details that overflow the fixed-height popup and scroll inside it.`
    );
}
```

### Open from a menu

Control the dialog's `open` state from a menu item to launch it from a `Menu`.

```typescript
import { Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoDialog, demoMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-dialog-from-menu',
    imports: [...dialogImports, RdxMenuModule, LucideX],
    template: `
        <ng-container #menu="rdxMenuRoot" rdxMenuRoot>
            <button [class]="cn(b.base, b.outline, b.size.md)" rdxMenuTrigger>Actions</button>

            @if (menu.open()) {
                <div [class]="m.positioner" sideOffset="4" rdxMenuPositioner>
                    <div [class]="m.popup" rdxMenuPopup>
                        <button [class]="m.item" rdxMenuItem>Duplicate</button>
                        <button [class]="m.item" (click)="renameOpen.set(true)" rdxMenuItem>Rename…</button>
                        <div [class]="m.separator" rdxMenuSeparator></div>
                        <button [class]="m.item" rdxMenuItem>Archive</button>
                    </div>
                </div>
            }
        </ng-container>

        <!-- Controlled dialog opened from the menu item. -->
        <div [(open)]="renameOpen" rdxDialogRoot>
            <ng-template rdxDialogPortal>
                <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxDialogBackdrop></div>
                <div [class]="cn(d.popup, d.popupAnimated)" rdxDialogPopup>
                    <h2 [class]="d.title" rdxDialogTitle>Rename item</h2>
                    <p [class]="d.description" rdxDialogDescription>
                        Opened by controlling the dialog from a menu item.
                    </p>
                    <div [class]="d.footer">
                        <button [class]="cn(b.base, b.outline, b.size.sm)" rdxDialogClose>Cancel</button>
                        <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDialogClose>Rename</button>
                    </div>
                    <button [class]="d.close" aria-label="Close" rdxDialogClose>
                        <svg aria-hidden="true" lucideX size="16" />
                    </button>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDialogFromMenuComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
    protected readonly m = demoMenu;
    protected readonly renameOpen = signal(false);
}
```

## API Reference

### Root

`RdxDialogRoot` owns the open state and modal behavior, and exposes `onOpenChange` /
`onOpenChangeComplete`.

### Trigger

`RdxDialogTrigger` toggles the dialog and exposes ARIA attributes.

### Portal

`RdxDialogPortal` is a structural directive (`<ng-template rdxDialogPortal>`) that teleports the
backdrop and popup into `document.body` by default, or into the `container` element when set.

### Viewport

`RdxDialogViewport` is an optional scrollable container placed inside the portal, around the popup.
It reads everything from context and exposes no inputs.

### Popup

`RdxDialogPopup` owns dialog semantics, dismissal events, scroll locking, and focus lifecycle events.

### Backdrop, Title, Description, and Close

These parts read their behavior and state from context and do not expose additional inputs or outputs.

## Accessibility

### Keyboard Interactions

| Key               | Description                                                                       |
| ----------------- | --------------------------------------------------------------------------------- |
| `Enter` / `Space` | Opens the dialog when focus is on the trigger; activates the focused close button. |
| `Escape`          | Closes the dialog. Only the topmost dialog closes when dialogs are nested.        |
| `Tab`             | Moves focus to the next focusable element; focus is trapped within the dialog.    |
| `Shift` + `Tab`   | Moves focus to the previous focusable element inside the dialog.                  |
