import { computed, DestroyRef, Directive, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RdxDialogRef } from './dialog-ref';
import { getState, RdxDialogResult } from './dialog.config';

@Directive({
    selector: '[rdxDialogContent]',
    standalone: true,
    host: {
        role: 'dialog',
        '[attr.aria-describedby]': '"true"',
        '[attr.aria-labelledby]': '"true"',
        '[attr.data-state]': 'state()'
    }
})
export class RdxDialogContentDirective<C = unknown> {
    private readonly dialogRef = inject<RdxDialogRef<C>>(RdxDialogRef);
    private readonly destroyRef = inject(DestroyRef);

    private readonly isOpen = signal(true);

    readonly state = computed(() => getState(this.isOpen()));

    constructor() {
        this.dialogRef.closed$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.isOpen.set(false);
        });
    }

    /**
     * Closes the dialog with a specified result.
     *
     * @param result The result to be passed back when closing the dialog
     */
    close(result: RdxDialogResult<C>): void {
        this.dialogRef.close(result);
    }

    /**
     * Dismisses the dialog without a result.
     */
    dismiss(): void {
        this.dialogRef.dismiss();
    }
}
