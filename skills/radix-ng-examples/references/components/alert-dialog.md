# Alert Dialog

#### A modal dialog that interrupts the user with important content and expects a response.

Alert Dialog is the Dialog primitive with three fixed invariants: it is always modal, it does **not**
dismiss on outside clicks or focus leaving the popup (only an explicit action or Escape closes it), and
its popup uses `role="alertdialog"`. Each `rdxAlertDialog*` part is a thin wrapper around the matching
dialog part.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { alertDialogImports } from '@radix-ng/primitives/alert-dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-alert-dialog-default',
    imports: [...alertDialogImports],
    template: `
        <div rdxAlertDialogRoot>
            <button [class]="cn(b.base, b.destructive, b.size.md)" rdxAlertDialogTrigger>Delete account</button>

            <ng-template rdxAlertDialogPortal>
                <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxAlertDialogBackdrop></div>

                <div [class]="cn(d.popup, d.popupAnimated)" rdxAlertDialogPopup>
                    <h2 [class]="d.title" rdxAlertDialogTitle>Are you absolutely sure?</h2>
                    <p [class]="d.description" rdxAlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account and remove your data
                        from our servers.
                    </p>

                    <div [class]="d.footer">
                        <button [class]="cn(b.base, b.outline, b.size.sm)" rdxAlertDialogClose>Cancel</button>
                        <button [class]="cn(b.base, b.destructive, b.size.sm)" rdxAlertDialogClose>
                            Yes, delete account
                        </button>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxAlertDialogDefaultComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
}
```

## Features

- ✅ Always modal: document scrolling is locked and outside pointer events are disabled.
- ✅ Does not close on outside interaction — requires an explicit choice; Escape still closes.
- ✅ Renders the popup with `role="alertdialog"` for assertive screen-reader semantics.
- ✅ Supports uncontrolled state, `defaultOpen`, and Angular two-way binding with `[(open)]`.
- ✅ Supports multiple triggers, controlled `triggerId`, and detached triggers through a shared handle.
- ✅ Traps and restores focus; links the popup to title and description for accessible labeling.

## Import

```typescript
import {
    alertDialogImports,
    createRdxAlertDialogHandle,
    RdxAlertDialogBackdrop,
    RdxAlertDialogClose,
    RdxAlertDialogDescription,
    RdxAlertDialogPopup,
    RdxAlertDialogPortal,
    RdxAlertDialogRoot,
    RdxAlertDialogTitle,
    RdxAlertDialogTrigger
} from '@radix-ng/primitives/alert-dialog';
```

Or import all parts through the module:

```typescript
import { RdxAlertDialogModule } from '@radix-ng/primitives/alert-dialog';
```

## Anatomy

```html
<div rdxAlertDialogRoot>
    <button rdxAlertDialogTrigger>Delete</button>

    <ng-template rdxAlertDialogPortal>
        <div rdxAlertDialogBackdrop></div>
        <div rdxAlertDialogPopup>
            <h2 rdxAlertDialogTitle>Are you sure?</h2>
            <p rdxAlertDialogDescription>This action cannot be undone.</p>
            <button rdxAlertDialogClose>Cancel</button>
            <button rdxAlertDialogClose>Confirm</button>
        </div>
    </ng-template>
</div>
```

## Examples

### Default

A destructive confirmation with Cancel and an action button. Clicking the backdrop keeps it open.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { alertDialogImports } from '@radix-ng/primitives/alert-dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-alert-dialog-default',
    imports: [...alertDialogImports],
    template: `
        <div rdxAlertDialogRoot>
            <button [class]="cn(b.base, b.destructive, b.size.md)" rdxAlertDialogTrigger>Delete account</button>

            <ng-template rdxAlertDialogPortal>
                <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxAlertDialogBackdrop></div>

                <div [class]="cn(d.popup, d.popupAnimated)" rdxAlertDialogPopup>
                    <h2 [class]="d.title" rdxAlertDialogTitle>Are you absolutely sure?</h2>
                    <p [class]="d.description" rdxAlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account and remove your data
                        from our servers.
                    </p>

                    <div [class]="d.footer">
                        <button [class]="cn(b.base, b.outline, b.size.sm)" rdxAlertDialogClose>Cancel</button>
                        <button [class]="cn(b.base, b.destructive, b.size.sm)" rdxAlertDialogClose>
                            Yes, delete account
                        </button>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxAlertDialogDefaultComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
}
```

### Controlled

Bind `[(open)]` to open or close the alert dialog from component state.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { alertDialogImports } from '@radix-ng/primitives/alert-dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-alert-dialog-controlled',
    imports: [...alertDialogImports],
    template: `
        <div class="flex flex-col items-center gap-4">
            <p class="text-muted-foreground text-xs">Alert dialog is {{ open() ? 'open' : 'closed' }}</p>

            <button [class]="cn(b.base, b.outline, b.size.sm)" (click)="open.set(true)">Open from outside</button>

            <div [(open)]="open" rdxAlertDialogRoot>
                <button [class]="cn(b.base, b.destructive, b.size.md)" rdxAlertDialogTrigger>Discard changes</button>

                <ng-template rdxAlertDialogPortal>
                    <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxAlertDialogBackdrop></div>

                    <div [class]="cn(d.popup, d.popupAnimated)" rdxAlertDialogPopup>
                        <h2 [class]="d.title" rdxAlertDialogTitle>Discard unsaved changes?</h2>
                        <p [class]="d.description" rdxAlertDialogDescription>
                            The open state is owned by the component and bound with
                            <code>[(open)]</code>
                            .
                        </p>

                        <div [class]="d.footer">
                            <button [class]="cn(b.base, b.outline, b.size.sm)" (click)="open.set(false)">
                                Keep editing
                            </button>
                            <button [class]="cn(b.base, b.destructive, b.size.sm)" (click)="open.set(false)">
                                Discard
                            </button>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class RdxAlertDialogControlledComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
    protected readonly open = signal(false);
}
```

### Multiple triggers

Several triggers can open the same alert dialog. The active trigger's `payload` is exposed on the root
so the content can adapt to what is being confirmed.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { alertDialogImports } from '@radix-ng/primitives/alert-dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-alert-dialog-multiple-triggers',
    imports: [...alertDialogImports],
    template: `
        <div #root="rdxAlertDialogRoot" rdxAlertDialogRoot>
            <div class="flex gap-2">
                <button [class]="cn(b.base, b.outline, b.size.md)" payload="photo" rdxAlertDialogTrigger>
                    Delete photo
                </button>
                <button [class]="cn(b.base, b.outline, b.size.md)" payload="video" rdxAlertDialogTrigger>
                    Delete video
                </button>
                <button [class]="cn(b.base, b.outline, b.size.md)" payload="album" rdxAlertDialogTrigger>
                    Delete album
                </button>
            </div>

            <ng-template rdxAlertDialogPortal>
                <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxAlertDialogBackdrop></div>
                <div [class]="cn(d.popup, d.popupAnimated)" rdxAlertDialogPopup>
                    <h2 [class]="d.title" rdxAlertDialogTitle>Delete this {{ root.payload() || 'item' }}?</h2>
                    <p [class]="d.description" rdxAlertDialogDescription>
                        Every trigger opens the same alert dialog; the active trigger's
                        <code>payload</code>
                        decides what is being deleted.
                    </p>
                    <div [class]="d.footer">
                        <button [class]="cn(b.base, b.outline, b.size.sm)" rdxAlertDialogClose>Cancel</button>
                        <button [class]="cn(b.base, b.destructive, b.size.sm)" rdxAlertDialogClose>Delete</button>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxAlertDialogMultipleTriggersComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
}
```

### Controlled mode with multiple triggers

Bind both `[(open)]` and `[(triggerId)]` to choose which trigger is active from component state.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { alertDialogImports } from '@radix-ng/primitives/alert-dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-alert-dialog-controlled-multiple',
    imports: [...alertDialogImports],
    template: `
        <div class="flex flex-col items-center gap-3">
            <p class="text-muted-foreground text-xs">open: {{ open() }} · triggerId: {{ triggerId() ?? '—' }}</p>

            <div [(open)]="open" [(triggerId)]="triggerId" rdxAlertDialogRoot>
                <div class="flex gap-2">
                    <button id="logout" [class]="cn(b.base, b.outline, b.size.md)" rdxAlertDialogTrigger>
                        Log out
                    </button>
                    <button id="delete" [class]="cn(b.base, b.outline, b.size.md)" rdxAlertDialogTrigger>
                        Delete account
                    </button>
                </div>

                <ng-template rdxAlertDialogPortal>
                    <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxAlertDialogBackdrop></div>
                    <div [class]="cn(d.popup, d.popupAnimated)" rdxAlertDialogPopup>
                        <h2 [class]="d.title" rdxAlertDialogTitle>
                            {{ triggerId() === 'delete' ? 'Delete account?' : 'Log out?' }}
                        </h2>
                        <p [class]="d.description" rdxAlertDialogDescription>
                            Both
                            <code>open</code>
                            and
                            <code>triggerId</code>
                            are bound, so the active action is driven from component state.
                        </p>
                        <div [class]="d.footer">
                            <button [class]="cn(b.base, b.outline, b.size.sm)" rdxAlertDialogClose>Cancel</button>
                            <button
                                [class]="cn(b.base, triggerId() === 'delete' ? b.destructive : b.primary, b.size.sm)"
                                rdxAlertDialogClose
                            >
                                {{ triggerId() === 'delete' ? 'Delete' : 'Log out' }}
                            </button>
                        </div>
                    </div>
                </ng-template>
            </div>

            <button [class]="cn(b.base, b.secondary, b.size.sm)" (click)="confirmDelete()">Delete externally</button>
        </div>
    `
})
export class RdxAlertDialogControlledMultipleComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
    protected readonly open = signal(false);
    protected readonly triggerId = signal<string | null>(null);

    protected confirmDelete() {
        this.triggerId.set('delete');
        this.open.set(true);
    }
}
```

### Detached triggers

Connect a trigger rendered outside the root with `createRdxAlertDialogHandle()`; the handle also exposes
imperative `open(id)` / `close()`.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { alertDialogImports, createRdxAlertDialogHandle } from '@radix-ng/primitives/alert-dialog';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-alert-dialog-detached',
    imports: [...alertDialogImports],
    template: `
        <div class="flex flex-col items-center gap-3">
            <!-- Triggers live outside the root and are linked through a shared handle. -->
            <button id="delete" [class]="cn(b.base, b.destructive, b.size.md)" [handle]="handle" rdxAlertDialogTrigger>
                Delete file
            </button>

            <button [class]="cn(b.base, b.secondary, b.size.sm)" (click)="handle.open('delete')">
                Open imperatively
            </button>

            <div [handle]="handle" rdxAlertDialogRoot>
                <ng-template rdxAlertDialogPortal>
                    <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxAlertDialogBackdrop></div>
                    <div [class]="cn(d.popup, d.popupAnimated)" rdxAlertDialogPopup>
                        <h2 [class]="d.title" rdxAlertDialogTitle>Delete this file?</h2>
                        <p [class]="d.description" rdxAlertDialogDescription>
                            The trigger and this alert dialog are connected with
                            <code>createRdxAlertDialogHandle()</code>
                            .
                        </p>
                        <div [class]="d.footer">
                            <button [class]="cn(b.base, b.outline, b.size.sm)" rdxAlertDialogClose>Cancel</button>
                            <button [class]="cn(b.base, b.destructive, b.size.sm)" rdxAlertDialogClose>Delete</button>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class RdxAlertDialogDetachedComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
    protected readonly handle = createRdxAlertDialogHandle();
}
```

### Close confirmation

A regular Dialog editor asks an Alert Dialog to confirm before discarding unsaved changes — the classic
reason to reach for an alert dialog.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { alertDialogImports } from '@radix-ng/primitives/alert-dialog';
import { dialogImports, RdxDialogOpenChange } from '@radix-ng/primitives/dialog';
import { cn, demoButton, demoDialog, demoInput } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-alert-dialog-close-confirmation',
    imports: [...dialogImports, ...alertDialogImports, FormsModule],
    template: `
        <!-- The editor is a regular Dialog, controlled so a close request can be intercepted. -->
        <div [(open)]="editorOpen" (onOpenChange)="onEditorOpenChange($event)" rdxDialogRoot>
            <button [class]="cn(b.base, b.primary, b.size.md)" rdxDialogTrigger>Edit note</button>

            <ng-template rdxDialogPortal>
                <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxDialogBackdrop></div>
                <div [class]="cn(d.popup, d.popupAnimated)" rdxDialogPopup>
                    <h2 [class]="d.title" rdxDialogTitle>Edit note</h2>
                    <p [class]="d.description" rdxDialogDescription>
                        Closing with unsaved changes asks an alert dialog to confirm.
                    </p>

                    <label [class]="d.field">
                        Note
                        <input [(ngModel)]="text" [class]="input" placeholder="Type to create changes" />
                    </label>

                    <div [class]="d.footer">
                        <button [class]="cn(b.base, b.outline, b.size.sm)" (click)="requestClose()">Cancel</button>
                        <button [class]="cn(b.base, b.primary, b.size.sm)" (click)="save()">Save</button>
                    </div>
                </div>
            </ng-template>
        </div>

        <!-- The confirmation is an Alert Dialog (assertive, not outside-dismissable). -->
        <div [(open)]="confirmOpen" rdxAlertDialogRoot>
            <ng-template rdxAlertDialogPortal>
                <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxAlertDialogBackdrop></div>
                <div [class]="cn(d.popup, d.popupAnimated)" rdxAlertDialogPopup>
                    <h2 [class]="d.title" rdxAlertDialogTitle>Discard changes?</h2>
                    <p [class]="d.description" rdxAlertDialogDescription>Your unsaved note will be lost.</p>
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
export class RdxAlertDialogCloseConfirmationComponent {
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

### Open from a menu

Control the alert dialog's `open` state from a menu item to launch a destructive confirmation from a `Menu`.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { alertDialogImports } from '@radix-ng/primitives/alert-dialog';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoDialog, demoMenu } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-alert-dialog-from-menu',
    imports: [...alertDialogImports, RdxMenuModule],
    template: `
        <ng-container #menu="rdxMenuRoot" rdxMenuRoot>
            <button [class]="cn(b.base, b.outline, b.size.md)" rdxMenuTrigger>Project</button>

            @if (menu.open()) {
                <div [class]="m.positioner" sideOffset="4" rdxMenuPositioner>
                    <div [class]="m.popup" rdxMenuPopup>
                        <button [class]="m.item" rdxMenuItem>Rename</button>
                        <button [class]="m.item" rdxMenuItem>Duplicate</button>
                        <div [class]="m.separator" rdxMenuSeparator></div>
                        <button [class]="m.item" (click)="deleteOpen.set(true)" rdxMenuItem>Delete…</button>
                    </div>
                </div>
            }
        </ng-container>

        <!-- Controlled alert dialog opened from the menu item. -->
        <div [(open)]="deleteOpen" rdxAlertDialogRoot>
            <ng-template rdxAlertDialogPortal>
                <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxAlertDialogBackdrop></div>
                <div [class]="cn(d.popup, d.popupAnimated)" rdxAlertDialogPopup>
                    <h2 [class]="d.title" rdxAlertDialogTitle>Delete project?</h2>
                    <p [class]="d.description" rdxAlertDialogDescription>
                        This permanently deletes the project. Opened by controlling the alert dialog from a menu item.
                    </p>
                    <div [class]="d.footer">
                        <button [class]="cn(b.base, b.outline, b.size.sm)" rdxAlertDialogClose>Cancel</button>
                        <button [class]="cn(b.base, b.destructive, b.size.sm)" rdxAlertDialogClose>Delete</button>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxAlertDialogFromMenuComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
    protected readonly m = demoMenu;
    protected readonly deleteOpen = signal(false);
}
```

## API Reference

### Root

`RdxAlertDialogRoot` composes the Dialog root and forces alert semantics (always modal, no pointer
dismissal, `role="alertdialog"`).

### Trigger

`RdxAlertDialogTrigger` opens the alert dialog; it behaves like the dialog trigger.

### Portal, Backdrop, Popup, Title, Description, Close, Viewport

These are thin wrappers around the matching dialog parts and read their behavior from context. See the
Dialog docs for their full reference.

## Accessibility

### Keyboard Interactions

| Key               | Description                                                                               |
| ----------------- | ----------------------------------------------------------------------------------------- |
| `Enter` / `Space` | Opens the alert dialog when focus is on the trigger; activates the focused action button. |
| `Escape`          | Closes the alert dialog. Only the topmost dialog closes when dialogs are nested.          |
| `Tab`             | Moves focus to the next focusable element; focus is trapped within the popup.             |
| `Shift` + `Tab`   | Moves focus to the previous focusable element inside the popup.                           |
