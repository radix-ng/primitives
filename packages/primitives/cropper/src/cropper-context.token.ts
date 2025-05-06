import { inject, InjectionToken, InputSignal, WritableSignal } from '@angular/core';

export interface CropperContextToken {
    image: InputSignal<string>;
    getImageProps: () => { [key: string]: any };
    getImageWrapperStyle: () => Record<string, string>;
    getCropAreaStyle: () => Record<string, string>;
    descriptionId: WritableSignal<string>;
}

export const CROPPER_ROOT_CONTEXT = new InjectionToken<CropperContextToken>('CROPPER_ROOT_CONTEXT');

export function injectCropperRootContext() {
    return inject(CROPPER_ROOT_CONTEXT);
}
