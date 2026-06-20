# Dialog

#### A window overlaid on the page, rendering the content underneath inert.

Dialog composes the shared Portal, Presence, Dismissable Layer, and Focus Scope primitives.
It stays headless: styles and native CSS animations belong to the consumer.

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

### Controlled

Bind `[(open)]` when application state should open or close the dialog programmatically.

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

### Non-modal

Set `[modal]="false"` to keep document scrolling and outside pointer interactions available. There is
no backdrop in this mode.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
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
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog, demoInput } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
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
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
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
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
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
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
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
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { createRdxDialogHandle, dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
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
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
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
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideX } from '@lucide/angular';
import { dialogImports, RdxDialogOpenChange } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog, demoInput } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
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

Make the `rdxDialogViewport` fill the screen and compose a custom [Scroll Area](?path=/docs/primitives-scroll-area--docs)
inside it, so the whole dialog scrolls — with a styled overlay scrollbar — when it is taller than the
screen. Center the popup with the scroll-area content's `min-h-full items-center` layout and give it
vertical margin so it can grow past the bottom edge.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import {
    RdxScrollAreaContent,
    RdxScrollAreaRoot,
    RdxScrollAreaScrollbar,
    RdxScrollAreaThumb,
    RdxScrollAreaViewport
} from '@radix-ng/primitives/scroll-area';
import { cn, demoButton, demoCard, demoDialog } from '../../storybook/styles';

/**
 * Outside-scroll dialog — a 1-1 port of the Base UI example.
 *
 * The dialog `Viewport` fills the screen and hosts a {@link RdxScrollAreaRoot custom scroll area}
 * instead of a native `overflow: auto` container, so a styled overlay scrollbar (with a draggable
 * thumb) appears while scrolling. The popup is centered by the scroll-area content's
 * `min-h-full items-center` layout and given `my-16` breathing room, so it can grow past the bottom
 * edge while the whole page (not an inner region) scrolls.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-dialog-outside-scroll',
    imports: [
        ...dialogImports,
        RdxScrollAreaRoot,
        RdxScrollAreaViewport,
        RdxScrollAreaContent,
        RdxScrollAreaScrollbar,
        RdxScrollAreaThumb,
        LucideX
    ],
    template: `
        <div rdxDialogRoot>
            <button [class]="cn(b.base, b.primary, b.size.md)" rdxDialogTrigger>Open dialog</button>

            <ng-template rdxDialogPortal>
                <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxDialogBackdrop></div>

                <!-- Full-screen viewport hosting a custom scroll area (not native overflow). -->
                <div class="group/dialog fixed inset-0 z-50" rdxDialogViewport>
                    <!--
                        Modal dialogs set \`body { pointer-events: none }\`, which the scroll surface inherits —
                        re-enable it here so the wheel works anywhere in the viewport (not only over the popup),
                        and drop it again during the exit animation. Outside-press dismissal still fires.
                    -->
                    <div
                        class="pointer-events-auto h-full overscroll-contain group-data-[ending-style]/dialog:pointer-events-none"
                        rdxScrollAreaRoot
                    >
                        <div class="h-full overscroll-contain" rdxScrollAreaViewport>
                            <div class="flex min-h-full items-center justify-center" rdxScrollAreaContent>
                                <div
                                    [class]="
                                        cn(
                                            card,
                                            'relative mx-auto my-16 flex w-[min(40rem,calc(100vw-2rem))] flex-col gap-4 p-6 focus:outline-none',
                                            d.popupAnimated
                                        )
                                    "
                                    rdxDialogPopup
                                >
                                    <div class="relative flex flex-col gap-1 pr-8">
                                        <h2 [class]="d.title" rdxDialogTitle>Dialog</h2>
                                        <p [class]="d.description" rdxDialogDescription>
                                            This layout keeps an outer container scrollable while the dialog can extend
                                            past the bottom edge.
                                        </p>
                                        <button [class]="d.close" aria-label="Close" rdxDialogClose>
                                            <svg aria-hidden="true" lucideX size="16" />
                                        </button>
                                    </div>

                                    <div class="flex flex-col gap-4">
                                        @for (item of contentSections; track item.title) {
                                            <section class="flex flex-col gap-1">
                                                <h3 class="text-card-foreground text-sm font-semibold">
                                                    {{ item.title }}
                                                </h3>
                                                <p class="text-muted-foreground text-sm">{{ item.body }}</p>
                                            </section>
                                        }
                                    </div>

                                    <!-- prettier-ignore -->
                                    <p class="text-muted-foreground text-sm">Related docs:
                                        @for (item of relatedLinks; track item.href; let last = $last) {<a class="text-card-foreground underline decoration-1 underline-offset-2 hover:no-underline" [href]="item.href">{{ item.label }}</a>{{ last ? '.' : ',' }} }
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div
                            class="bg-foreground/10 pointer-events-none flex w-4 touch-none justify-center opacity-0 transition-opacity duration-200 hover:pointer-events-auto hover:opacity-100 hover:duration-75 data-[scrolling]:pointer-events-auto data-[scrolling]:opacity-100 data-[scrolling]:duration-75"
                            rdxScrollAreaScrollbar
                            orientation="vertical"
                        >
                            <div class="bg-foreground/50 w-full rounded-full" rdxScrollAreaThumb></div>
                        </div>
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
    protected readonly card = demoCard;

    protected readonly contentSections = [
        {
            title: 'What a dialog is for',
            body: 'Use a dialog when you need the user to complete a focused task or read something important without navigating away. It opens on top of the page and returns focus back where it started when closed.'
        },
        {
            title: 'Anatomy at a glance',
            body: 'Root, Trigger, Portal, Backdrop, Viewport, Popup, Title, Description, Close. Keep the title short and the first paragraph specific so screen readers announce something meaningful.'
        },
        {
            title: 'Opening and closing',
            body: 'Control it using external state via the `open` and `onOpenChange` props, or let it manage state for you internally.'
        },
        {
            title: 'Keyboard and focus behavior',
            body: 'Focus moves inside the dialog when it opens. Tab and Shift+Tab loop within, and Esc requests close.'
        },
        {
            title: 'Accessible labeling',
            body: 'Set an explicit title and description using the `Dialog.Title` and `Dialog.Description` components.'
        },
        {
            title: 'Backdrop and page scrolling',
            body: 'The backdrop visually separates layers while background content is inert. Don’t rely on dimness alone—keep copy clear and buttons obvious so actions are easy to choose.'
        },
        {
            title: 'Portals and stacking',
            body: 'Dialogs render in a portal so they sit above the `isolation: isolate` app content and avoid local z-index wars.'
        },
        {
            title: 'Viewport overflow',
            body: 'Let long content overflow the bottom edge and reveal as you scroll the page container. Keep generous padding at the top and bottom so the dialog doesn’t feel jammed against the edges.'
        },
        {
            title: 'Nested dialogs and confirmations',
            body: 'If closing a dialog needs confirmation, open a child alert dialog rather than mutating the current one. The parent stays visible behind it; only the topmost layer should feel interactive.'
        },
        {
            title: 'Transitions that respect motion settings',
            body: 'Use small, fast transitions (opacity plus a few pixels of Y translation or scale). Subtle motion helps people notice what changed without slowing them down.'
        },
        {
            title: 'Controlled vs. uncontrolled',
            body: 'Controlled state is best when other parts of the page need to react to open/close. Uncontrolled is fine for local cases where only the dialog matters.'
        },
        {
            title: 'Close affordances',
            body: 'Always offer a visible close button in the corner. Don’t rely only on Esc or the backdrop for pointer outside presses. Touch screen readers and accessibility users benefit from a clear, targetable control to click to close the dialog.'
        },
        {
            title: 'Forms inside dialogs',
            body: 'Keep forms short; longer flows usually deserve a full page. Validate inline, keep button text specific (“Create project”), and disable destructive actions until the input is valid.'
        },
        {
            title: 'Content guidelines',
            body: 'Lead with the outcome (“Rename project?”) and follow with one or two short, concrete sentences. Avoid long prose; link out for details instead.'
        },
        {
            title: 'SSR and hydration notes',
            body: 'Because dialogs render in a portal, make sure your portal container exists on the client.'
        },
        {
            title: 'Mobile ergonomics',
            body: 'Use larger touch targets and keep the close button reachable with the thumb. Avoid full-screen modals unless the task truly needs a whole screen.'
        },
        {
            title: 'Theming and density',
            body: 'Match spacing and corner radius to your system. Use a slightly denser layout than pages so the dialog feels purpose-built, not like a mini web page.'
        },
        {
            title: 'Internationalization',
            body: 'Plan for longer text. Buttons can grow to two lines; titles should wrap gracefully. Keep destructive terms consistent across locales.'
        },
        {
            title: 'Performance',
            body: 'Children are mounted lazily when the dialog opens. If the dialog can reopen often, consider the `keepMounted` prop sparingly to perform the work only once on mount to avoid re-initializing complex trees on each open.'
        },
        {
            title: 'When a popover is better',
            body: 'If the content is a small hint or a few quick actions anchored to a control, use a popover or menu instead of a dialog. Dialogs interrupt on purpose—use that sparingly.'
        },
        {
            title: 'Follow-up and cleanup',
            body: 'After a successful action, close the dialog and show confirmation in context (toast, inline message, or updated UI) so people can see the result of what they just did.'
        }
    ];

    protected readonly relatedLinks = [
        { href: '/components/scroll-area', label: 'Scroll Area' },
        { href: '/components/drawer', label: 'Drawer' },
        { href: '/components/popover', label: 'Popover' }
    ];
}
```

### Inside scroll

Keep the popup fixed on screen and scroll an inner region instead.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
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

### Placing elements outside the popup

Make the popup a transparent `pointer-events-none` frame and opt its children back into pointer events
individually, so elements such as a close button can sit outside the visible content card while the gaps
around it stay dismissable.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

/**
 * Placing elements outside the popup — a 1-1 port of the Base UI "uncontained" dialog.
 *
 * The `rdxDialogPopup` is a transparent positioning frame that fills the viewport; its children opt
 * into pointer events individually — the content card and a `Close` button rendered *outside* (above)
 * the card. Keeping the button inside the popup means it stays in the focus trap and is Tab-reachable,
 * even though it sits outside the visible card. Dismiss via Escape, the close button, or pressing the
 * dimmed area around the frame.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-dialog-uncontained',
    imports: [...dialogImports, LucideX],
    template: `
        <div rdxDialogRoot>
            <button [class]="cn(b.base, b.primary, b.size.md)" rdxDialogTrigger>Open dialog</button>

            <ng-template rdxDialogPortal>
                <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxDialogBackdrop></div>

                <div class="fixed inset-0 z-50 grid place-items-center px-4 py-12 xl:py-6" rdxDialogViewport>
                    <!-- Transparent frame: pointer-events-none so the gaps around the card stay dismissable. -->
                    <div
                        class="group/popup pointer-events-none relative flex h-full w-full max-w-[70rem] justify-center transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 xl:max-w-none"
                        rdxDialogPopup
                    >
                        <!-- Rendered outside the card, above its top-right corner. -->
                        <button
                            class="border-border bg-background text-foreground hover:bg-muted pointer-events-auto absolute -top-10 right-0 flex size-8 items-center justify-center rounded-md border shadow-sm xl:top-0"
                            aria-label="Close"
                            rdxDialogClose
                        >
                            <svg aria-hidden="true" lucideX size="16" />
                        </button>

                        <div
                            class="border-border bg-card text-card-foreground pointer-events-auto h-full w-full max-w-[70rem] rounded-md border p-6 shadow-sm transition-[scale] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[starting-style]/popup:scale-105"
                        >
                            <h2 [class]="d.title" rdxDialogTitle>Uncontained dialog</h2>
                            <p [class]="d.description" rdxDialogDescription>
                                The close button lives in the popup but is rendered outside this card, above its
                                top-right corner.
                            </p>
                        </div>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDialogUncontainedComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
}
```

### Open from a menu

Control the dialog's `open` state from a menu item to launch it from a `Menu`.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoDialog, demoMenu } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
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
