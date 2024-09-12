import { AutoFocusTarget, DialogConfig } from '@angular/cdk/dialog';
import { ComponentType } from '@angular/cdk/overlay';
import { TemplateRef } from '@angular/core';
import { Observable } from 'rxjs';

const ɵdialogData = Symbol.for('rdxDialogData');
const ɵdialogResult = Symbol.for('rdxDialogResult');

export type ɵDialogDataFlag = { [ɵdialogData]: unknown };
export type ɵDialogResultFlag<R> = { [ɵdialogResult]: R };

export type RdxDialogData<T> = {
    [K in keyof T]: T[K] extends ɵDialogDataFlag ? Omit<T[K], typeof ɵdialogData> : never;
}[keyof T];

type DialogRefProps<C> = { [K in keyof C]: C[K] extends ɵDialogResultFlag<unknown> ? K : never }[keyof C] & keyof C;
export type RdxDialogResult<C> =
    DialogRefProps<C> extends never ? void : C[DialogRefProps<C>] extends ɵDialogResultFlag<infer T> ? T : void;

interface RdxBaseDialogConfig<C> {
    content: ComponentType<C> | TemplateRef<C>;

    data: RdxDialogData<C>;

    modal?: boolean;

    ariaLabel?: string;

    autoFocus?: AutoFocusTarget | 'first-input' | string;

    canClose?: (comp: C) => boolean | Observable<boolean>;

    canCloseWithBackdrop?: boolean;

    cdkConfigOverride?: DialogConfig<C>;

    mode?: 'default' | 'drawer' | 'drawer-from-bottom';
}

export type RdxDialogConfig<T> =
    RdxDialogData<T> extends never ? Omit<RdxBaseDialogConfig<T>, 'data'> : RdxBaseDialogConfig<T>;
