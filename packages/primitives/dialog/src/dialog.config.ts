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

type RdxDialogMode = 'default' | 'sheet' | 'sheet-bottom' | 'sheet-top' | 'sheet-left' | 'sheet-right';

type RdxBaseDialogConfig<C> = {
    content: ComponentType<C> | TemplateRef<C>;

    data: RdxDialogData<C>;

    modal?: boolean;

    ariaLabel?: string;

    autoFocus?: AutoFocusTarget | 'first-input' | string;

    canClose?: (comp: C) => boolean | Observable<boolean>;

    canCloseWithBackdrop?: boolean;

    cdkConfigOverride?: Partial<DialogConfig<C>>;

    mode?: RdxDialogMode;

    backdropClass?: string | string[];

    panelClasses?: string[];

    isAlert?: boolean;
};

export type RdxDialogConfig<T> =
    RdxDialogData<T> extends never
        ? Omit<RdxBaseDialogConfig<T>, 'data'>
        : RdxBaseDialogConfig<T> & { data: Required<RdxDialogData<T>> };

export type RdxDialogState = 'open' | 'closed';

export function getState(open: boolean): RdxDialogState {
    return open ? 'open' : 'closed';
}
