# Confirmation Dialog

#### An imperative `confirm()` that returns a `Promise<boolean>`, built on the Alert Dialog primitive.

Rather than declaring an alert dialog at every call site, this recipe wraps the
[Alert Dialog](?path=/docs/primitives-alert-dialog--docs) primitive in a small service. You call
`confirm({ title, description })` from anywhere and `await` the result — the service opens one shared,
presence-gated dialog and resolves `true` on confirm or `false` on cancel (including Escape).

The primitive still owns everything that matters for correctness: it is modal, traps focus, renders
`role="alertdialog"`, and does **not** dismiss on an outside click (only an explicit choice or Escape).
The service owns only the open state, the per-call options, and the pending promise.

```typescript
import { ChangeDetectionStrategy, Component, inject, Injectable, signal } from '@angular/core';
import { alertDialogImports } from '@radix-ng/primitives/alert-dialog';
import { RdxButtonDirective } from '@radix-ng/primitives/button';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

/**
 * Confirmation Dialog — an imperative `confirm()` built on the Alert Dialog primitive.
 *
 * Instead of declaring an alert dialog per call site, a small service opens one shared, presence-gated
 * dialog and returns a `Promise<boolean>` that resolves when the user chooses. The Alert Dialog
 * primitive owns the modal behavior, focus trap, `role="alertdialog"`, and Escape-to-close; the service
 * only owns the open state, the per-call options, and the pending promise.
 */
export interface ConfirmOptions {
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    /** Style the confirm button as a destructive action. */
    destructive?: boolean;
}

/**
 * Drives one shared confirmation dialog.
 *
 * In an app, provide it once with `{ providedIn: 'root' }` and mount a single `<confirm-dialog-host />`
 * at the app root. Here it is provided at the demo component so the story is self-contained.
 */
@Injectable()
export class ConfirmService {
    /** Source of truth for the dialog's open state (read by the host's `[open]`). */
    readonly open = signal(false);
    readonly options = signal<ConfirmOptions | null>(null);

    private resolver: ((value: boolean) => void) | null = null;

    /** Open the dialog and resolve `true` (confirm) or `false` (cancel / Escape). */
    confirm(options: ConfirmOptions): Promise<boolean> {
        this.options.set(options);
        this.open.set(true);
        return new Promise<boolean>((resolve) => (this.resolver = resolve));
    }

    /** Resolve the pending confirmation with `value` and close. Called by the dialog's buttons. */
    settle(value: boolean): void {
        this.resolver?.(value);
        this.resolver = null;
        this.open.set(false);
    }

    /** Keep `open` in sync with the dialog and treat any external close (Escape) as a cancel. */
    onOpenChange(isOpen: boolean): void {
        this.open.set(isOpen);
        if (!isOpen) {
            this.settle(false);
        }
    }
}

/**
 * The single mounted dialog the service drives. Mount once near the app root.
 */
@Component({
    selector: 'confirm-dialog-host',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [...alertDialogImports],
    template: `
        <div [open]="confirm.open()" (openChange)="confirm.onOpenChange($event)" rdxAlertDialogRoot>
            <ng-template rdxAlertDialogPortal>
                <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxAlertDialogBackdrop></div>

                <div [class]="cn(d.popup, d.popupAnimated)" rdxAlertDialogPopup>
                    @if (confirm.options(); as o) {
                        <h2 [class]="d.title" rdxAlertDialogTitle>{{ o.title }}</h2>
                        @if (o.description) {
                            <p [class]="d.description" rdxAlertDialogDescription>{{ o.description }}</p>
                        }

                        <div [class]="d.footer">
                            <button [class]="cn(b.base, b.outline, b.size.sm)" (click)="confirm.settle(false)">
                                {{ o.cancelText ?? 'Cancel' }}
                            </button>
                            <button
                                [class]="cn(b.base, o.destructive ? b.destructive : b.primary, b.size.sm)"
                                (click)="confirm.settle(true)"
                            >
                                {{ o.confirmText ?? 'Confirm' }}
                            </button>
                        </div>
                    }
                </div>
            </ng-template>
        </div>
    `
})
export class ConfirmDialogHost {
    protected readonly confirm = inject(ConfirmService);
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
}

/**
 * Demo: a destructive action that awaits the shared confirmation dialog.
 */
@Component({
    selector: 'confirmation-dialog-example',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [ConfirmService],
    imports: [RdxButtonDirective, ConfirmDialogHost],
    template: `
        <div class="flex flex-col items-center gap-4">
            <button [class]="cn(b.base, b.destructive, b.size.md)" (click)="deleteAccount()" rdxButton>
                Delete account
            </button>

            <p class="text-muted-foreground text-sm">
                Result:
                <span class="text-foreground font-medium">{{ result() }}</span>
            </p>

            <confirm-dialog-host />
        </div>
    `
})
export class ConfirmationDialogExample {
    private readonly confirm = inject(ConfirmService);
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly result = signal('—');

    protected async deleteAccount(): Promise<void> {
        const confirmed = await this.confirm.confirm({
            title: 'Delete account?',
            description: 'This permanently deletes your account and all of its data. This action cannot be undone.',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            destructive: true
        });

        this.result.set(confirmed ? 'Confirmed — account deleted' : 'Cancelled');
    }
}
```

## Composed from

- **[Alert Dialog](?path=/docs/primitives-alert-dialog--docs)** (`rdxAlertDialogRoot` / `…Portal` /
  `…Backdrop` / `…Popup` / `…Title` / `…Description`) — the modal dialog, driven by `[open]` and
  `(openChange)` instead of a trigger.
- **[Button](?path=/docs/primitives-button--docs)** (`rdxButton`) — the call-site action that awaits the
  result.

## Anatomy

Three pieces: a service that owns the promise, one host component that renders the shared dialog, and
any number of call sites that `await confirm(...)`.

```ts
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly open = signal(false);
  readonly options = signal<ConfirmOptions | null>(null);
  private resolver: ((value: boolean) => void) | null = null;

  confirm(options: ConfirmOptions): Promise<boolean> {
    this.options.set(options);
    this.open.set(true);
    return new Promise((resolve) => (this.resolver = resolve));
  }

  settle(value: boolean): void {
    this.resolver?.(value);
    this.resolver = null;
    this.open.set(false);
  }

  // External close (Escape) counts as a cancel.
  onOpenChange(isOpen: boolean): void {
    this.open.set(isOpen);
    if (!isOpen) this.settle(false);
  }
}
```

Mount one host near the app root, then call it from anywhere:

```html
<!-- once, at the app root -->
<confirm-dialog-host />
```

```ts
const ok = await this.confirm.confirm({
  title: 'Delete account?',
  description: 'This action cannot be undone.',
  confirmText: 'Delete',
  destructive: true
});
```

## Examples

### Default

A destructive action awaits the shared dialog. Confirm resolves `true`; Cancel and Escape resolve
`false`. The result is shown below the trigger.

```typescript
import { ChangeDetectionStrategy, Component, inject, Injectable, signal } from '@angular/core';
import { alertDialogImports } from '@radix-ng/primitives/alert-dialog';
import { RdxButtonDirective } from '@radix-ng/primitives/button';
import { cn, demoButton, demoDialog } from '../../storybook/styles';

/**
 * Confirmation Dialog — an imperative `confirm()` built on the Alert Dialog primitive.
 *
 * Instead of declaring an alert dialog per call site, a small service opens one shared, presence-gated
 * dialog and returns a `Promise<boolean>` that resolves when the user chooses. The Alert Dialog
 * primitive owns the modal behavior, focus trap, `role="alertdialog"`, and Escape-to-close; the service
 * only owns the open state, the per-call options, and the pending promise.
 */
export interface ConfirmOptions {
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    /** Style the confirm button as a destructive action. */
    destructive?: boolean;
}

/**
 * Drives one shared confirmation dialog.
 *
 * In an app, provide it once with `{ providedIn: 'root' }` and mount a single `<confirm-dialog-host />`
 * at the app root. Here it is provided at the demo component so the story is self-contained.
 */
@Injectable()
export class ConfirmService {
    /** Source of truth for the dialog's open state (read by the host's `[open]`). */
    readonly open = signal(false);
    readonly options = signal<ConfirmOptions | null>(null);

    private resolver: ((value: boolean) => void) | null = null;

    /** Open the dialog and resolve `true` (confirm) or `false` (cancel / Escape). */
    confirm(options: ConfirmOptions): Promise<boolean> {
        this.options.set(options);
        this.open.set(true);
        return new Promise<boolean>((resolve) => (this.resolver = resolve));
    }

    /** Resolve the pending confirmation with `value` and close. Called by the dialog's buttons. */
    settle(value: boolean): void {
        this.resolver?.(value);
        this.resolver = null;
        this.open.set(false);
    }

    /** Keep `open` in sync with the dialog and treat any external close (Escape) as a cancel. */
    onOpenChange(isOpen: boolean): void {
        this.open.set(isOpen);
        if (!isOpen) {
            this.settle(false);
        }
    }
}

/**
 * The single mounted dialog the service drives. Mount once near the app root.
 */
@Component({
    selector: 'confirm-dialog-host',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [...alertDialogImports],
    template: `
        <div [open]="confirm.open()" (openChange)="confirm.onOpenChange($event)" rdxAlertDialogRoot>
            <ng-template rdxAlertDialogPortal>
                <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxAlertDialogBackdrop></div>

                <div [class]="cn(d.popup, d.popupAnimated)" rdxAlertDialogPopup>
                    @if (confirm.options(); as o) {
                        <h2 [class]="d.title" rdxAlertDialogTitle>{{ o.title }}</h2>
                        @if (o.description) {
                            <p [class]="d.description" rdxAlertDialogDescription>{{ o.description }}</p>
                        }

                        <div [class]="d.footer">
                            <button [class]="cn(b.base, b.outline, b.size.sm)" (click)="confirm.settle(false)">
                                {{ o.cancelText ?? 'Cancel' }}
                            </button>
                            <button
                                [class]="cn(b.base, o.destructive ? b.destructive : b.primary, b.size.sm)"
                                (click)="confirm.settle(true)"
                            >
                                {{ o.confirmText ?? 'Confirm' }}
                            </button>
                        </div>
                    }
                </div>
            </ng-template>
        </div>
    `
})
export class ConfirmDialogHost {
    protected readonly confirm = inject(ConfirmService);
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
}

/**
 * Demo: a destructive action that awaits the shared confirmation dialog.
 */
@Component({
    selector: 'confirmation-dialog-example',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [ConfirmService],
    imports: [RdxButtonDirective, ConfirmDialogHost],
    template: `
        <div class="flex flex-col items-center gap-4">
            <button [class]="cn(b.base, b.destructive, b.size.md)" (click)="deleteAccount()" rdxButton>
                Delete account
            </button>

            <p class="text-muted-foreground text-sm">
                Result:
                <span class="text-foreground font-medium">{{ result() }}</span>
            </p>

            <confirm-dialog-host />
        </div>
    `
})
export class ConfirmationDialogExample {
    private readonly confirm = inject(ConfirmService);
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly result = signal('—');

    protected async deleteAccount(): Promise<void> {
        const confirmed = await this.confirm.confirm({
            title: 'Delete account?',
            description: 'This permanently deletes your account and all of its data. This action cannot be undone.',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            destructive: true
        });

        this.result.set(confirmed ? 'Confirmed — account deleted' : 'Cancelled');
    }
}
```

## Accessibility

The Alert Dialog primitive provides the WAI-ARIA `alertdialog` semantics: focus moves into the dialog
on open and is trapped, the `Title` and `Description` are wired as the accessible name and description,
and focus returns to the previously focused element on close. Always pass a `title` (and ideally a
`description`) to every `confirm()` call so the dialog is announced.

### Keyboard Interactions

| Key               | Description                                                                |
| ----------------- | -------------------------------------------------------------------------- |
| `Enter` / `Space` | Activates the focused button — resolves the confirmation accordingly.      |
| `Escape`          | Closes the dialog and resolves the promise as a cancel (`false`).          |
| `Tab`             | Moves focus to the next focusable element; focus is trapped in the dialog. |
| `Shift` + `Tab`   | Moves focus to the previous focusable element inside the dialog.           |
