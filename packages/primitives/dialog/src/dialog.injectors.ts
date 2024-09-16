import { DIALOG_DATA } from '@angular/cdk/dialog';
import { inject } from '@angular/core';
import { RdxDialogRef, RdxDialogSelfRef } from './dialog-ref';
import { ɵDialogDataFlag, ɵDialogResultFlag } from './dialog.config';

export function injectDialogData<TData>(): TData & ɵDialogDataFlag {
    return inject<TData & ɵDialogDataFlag>(DIALOG_DATA);
}

export function injectDialogRef<R = void>(): RdxDialogSelfRef<R> & ɵDialogResultFlag<R> {
    return inject<RdxDialogSelfRef<R>>(RdxDialogRef) as RdxDialogSelfRef<R> & ɵDialogResultFlag<R>;
}
