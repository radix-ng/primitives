import { computed, DestroyRef, Directive, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
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

    private readonly closed = toSignal<RdxDialogResult<C> | undefined, RdxDialogResult<C> | undefined>(
        this.dialogRef.closed$.pipe(takeUntilDestroyed(this.destroyRef)),
        { initialValue: undefined }
    );

    protected readonly state = computed(() => getState(this.closed() === undefined));

    close(result: RdxDialogResult<C>): void {
        this.dialogRef.close(result);
    }

    dismiss(): void {
        this.dialogRef.dismiss();
    }
}
