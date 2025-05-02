import { DialogRef } from '@angular/cdk/dialog';
import { computed, signal } from '@angular/core';
import { filter, isObservable, map, Observable, of, take } from 'rxjs';
import { RdxDialogConfig, RdxDialogResult } from './dialog.config';

export const DISMISSED_VALUE = {} as const;

function isDismissed(v: unknown): v is typeof DISMISSED_VALUE {
    return v === DISMISSED_VALUE;
}

/**
 * Represents a reference to an open dialog.
 * Provides methods and observables to interact with and monitor the dialog's state.
 * @template C - The type of the dialog's content component
 */
export class RdxDialogRef<C = unknown> {
    private _previousTimeout: ReturnType<typeof setTimeout> | undefined;

    // state tracking
    private readonly _openSignal = signal(true);
    public readonly state = computed(() => (this._openSignal() ? 'open' : 'closed'));

    closed$: Observable<RdxDialogResult<C> | undefined> = this.cdkRef.closed.pipe(
        map((res): RdxDialogResult<C> | undefined => (isDismissed(res) ? undefined : res))
    );

    dismissed$: Observable<void> = this.cdkRef.closed.pipe(
        filter((res) => res === DISMISSED_VALUE),
        map((): void => undefined)
    );

    result$: Observable<RdxDialogResult<C>> = this.cdkRef.closed.pipe(
        filter((res): res is RdxDialogResult<C> => !isDismissed(res))
    );

    /**
     * @param cdkRef - Reference to the underlying CDK dialog
     * @param config - Configuration options for the dialog
     */
    constructor(
        public readonly cdkRef: DialogRef<RdxDialogResult<C> | typeof DISMISSED_VALUE, C>,
        public readonly config: RdxDialogConfig<C>
    ) {}

    get instance(): C | null {
        return this.cdkRef.componentInstance;
    }

    /**
     * Attempts to dismiss the dialog
     * Checks the canClose condition before dismissing
     */
    dismiss(): void {
        if (!this.instance || this.config.isAlert) {
            return;
        }

        const canClose = this.config.canClose?.(this.instance) ?? true;
        const canClose$ = isObservable(canClose) ? canClose : of(canClose);
        canClose$.pipe(take(1)).subscribe((close) => {
            if (close) {
                this.cdkRef.close(DISMISSED_VALUE);
            }
        });
    }

    close(result: RdxDialogResult<C>): void {
        // check if dialog is already in closing state to prevent double-closing
        if (this.state() === 'closed') {
            return;
        }

        this._openSignal.set(false);

        if (this._previousTimeout) {
            clearTimeout(this._previousTimeout);
        }

        const closeDelay = this.config.closeDelay ?? 100; // Default to 100ms if not specified

        // Actual closing happens after delay
        this._previousTimeout = setTimeout(() => {
            this.cdkRef.close(result ?? DISMISSED_VALUE);
        }, closeDelay);
    }
}

/**
 * Represents a simplified interface for dialog interaction
 * Typically used by dialog content components
 * @template R - The type of the result when closing the dialog
 */
export type RdxDialogSelfRef<R> = { dismiss(): void; close(res: R): void };
