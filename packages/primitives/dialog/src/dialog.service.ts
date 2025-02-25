import { Dialog } from '@angular/cdk/dialog';
import { inject, Injectable, Injector, Renderer2 } from '@angular/core';
import { filter, isObservable, merge, of, switchMap, take, takeUntil } from 'rxjs';
import { DISMISSED_VALUE, RdxDialogRef } from './dialog-ref';
import type { RdxDialogConfig, RdxDialogResult } from './dialog.config';

/**
 * Modality control: When `isModal` is set to `true`, the dialog will:
 *
 * - Have a backdrop that blocks interaction with the rest of the page
 * - Disable closing by clicking outside or pressing Escape
 * - Set `aria-modal="true"` for screen readers
 * - Automatically focus the first tabbable element in the dialog
 * - Restore focus to the element that opened the dialog when it's closed
 *
 *
 * When `isModal` is `false`, the dialog will:
 *
 * - Not have a backdrop, allowing interaction with the rest of the page
 * - Allow closing by clicking outside or pressing Escape
 * - Not set `aria-modal` attribute
 * - Not automatically manage focus
 */
@Injectable()
export class RdxDialogService {
    #cdkDialog = inject(Dialog);
    #injector = inject(Injector);

    open<C>(config: RdxDialogConfig<C>): RdxDialogRef<C> {
        let dialogRef: RdxDialogRef<C>;
        let modeClasses: string[] = [];

        switch (config.mode) {
            case 'sheet':
                modeClasses = ['mod-sheet', 'mod-right'];
                break;
            case 'sheet-right':
                modeClasses = ['mod-sheet', 'mod-right'];
                break;
            case 'sheet-bottom':
                modeClasses = ['mod-sheet', 'mod-bottom'];
                break;
            case 'sheet-left':
                modeClasses = ['mod-sheet', 'mod-left'];
                break;
            case 'sheet-top':
                modeClasses = ['mod-sheet', 'mod-top'];
                break;
        }

        const cdkRef = this.#cdkDialog.open<RdxDialogResult<C> | typeof DISMISSED_VALUE, unknown, C>(config.content, {
            ariaModal: config.modal ?? true,
            hasBackdrop: config.modal ?? true,
            data: 'data' in config ? config.data : null,
            restoreFocus: true,
            role: config.isAlert ? 'alertdialog' : 'dialog',
            disableClose: true,
            closeOnDestroy: true,
            injector: this.#injector,
            backdropClass: config.backdropClass ? config.backdropClass : 'cdk-overlay-dark-backdrop',
            panelClass: ['dialog', ...modeClasses, ...(config.panelClasses || [])],
            autoFocus: config.autoFocus === 'first-input' ? 'dialog' : (config.autoFocus ?? 'first-tabbable'),
            ariaLabel: config.ariaLabel,
            templateContext: () => ({ dialogRef: dialogRef }),
            providers: (ref) => {
                dialogRef = new RdxDialogRef(ref, config);
                return [
                    {
                        provide: RdxDialogRef,
                        useValue: dialogRef
                    }
                ];
            },
            // @FIXME
            ...(config.cdkConfigOverride || ({} as any))
        });

        if (cdkRef.componentRef) {
            cdkRef.componentRef.injector
                .get(Renderer2)
                .setStyle(cdkRef.componentRef.location.nativeElement, 'display', 'contents');
        }

        if (!config.isAlert) {
            merge(
                cdkRef.backdropClick,
                cdkRef.keydownEvents.pipe(filter((e) => e.key === 'Escape' && !e.defaultPrevented))
            )
                .pipe(
                    filter(() => config.canCloseWithBackdrop ?? true),
                    switchMap(() => {
                        const canClose =
                            (cdkRef.componentInstance && config.canClose?.(cdkRef.componentInstance)) ?? true;
                        const canClose$ = isObservable(canClose) ? canClose : of(canClose);
                        return canClose$.pipe(take(1));
                    }),

                    takeUntil(dialogRef!.closed$)
                )
                .subscribe((canClose) => {
                    if (canClose) {
                        cdkRef.close(DISMISSED_VALUE);
                    }
                });
        }

        return dialogRef!;
    }
}
