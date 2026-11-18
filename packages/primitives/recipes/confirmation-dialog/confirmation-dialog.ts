import { ChangeDetectionStrategy, Component, inject, Injectable, signal } from '@angular/core';
import {
    RdxAlertDialogBackdrop,
    RdxAlertDialogDescription,
    RdxAlertDialogPopup,
    RdxAlertDialogPortal,
    RdxAlertDialogRoot,
    RdxAlertDialogTitle
} from '@radix-ng/primitives/alert-dialog';
import { RdxButtonDirective } from '@radix-ng/primitives/button';

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
    imports: [
        RdxAlertDialogRoot,
        RdxAlertDialogPortal,
        RdxAlertDialogBackdrop,
        RdxAlertDialogPopup,
        RdxAlertDialogTitle,
        RdxAlertDialogDescription
    ],
    template: `
        <div [open]="confirm.open()" (openChange)="confirm.onOpenChange($event)" rdxAlertDialogRoot>
            <ng-template rdxAlertDialogPortal>
                <div
                    class="bg-foreground/50 data-[open]:animate-dialog-overlay-in data-[closed]:animate-dialog-overlay-out fixed inset-0 z-50"
                    rdxAlertDialogBackdrop
                ></div>

                <div
                    class="demo-surface data-[open]:animate-dialog-popup-in data-[closed]:animate-dialog-popup-out fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 p-6 transition-[transform,scale] focus:outline-none data-[nested-dialog-open]:scale-[0.96]"
                    rdxAlertDialogPopup
                >
                    @if (confirm.options(); as o) {
                        <h2 class="demo-dialog-title" rdxAlertDialogTitle>{{ o.title }}</h2>
                        @if (o.description) {
                            <p class="text-muted-foreground mt-1.5 text-sm" rdxAlertDialogDescription>
                                {{ o.description }}
                            </p>
                        }

                        <div class="mt-6 flex justify-end gap-2">
                            <button
                                class="demo-button demo-button-outline h-8 px-3 text-xs"
                                (click)="confirm.settle(false)"
                            >
                                {{ o.cancelText ?? 'Cancel' }}
                            </button>
                            <button
                                class="demo-button h-8 px-3 text-xs"
                                [class]="o.destructive ? 'demo-button-destructive' : 'demo-button-primary'"
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
            <button class="demo-button demo-button-destructive h-9 px-4" (click)="deleteAccount()" rdxButton>
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
