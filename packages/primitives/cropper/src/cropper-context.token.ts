import { InputSignal, Signal } from '@angular/core';
import { createContext } from '@radix-ng/primitives/core';

export interface CropperRootContext {
    image: InputSignal<string>;
    imageWrapperStyle: Signal<Record<string, string>>;
    cropAreaStyle: Signal<Record<string, string>>;
    descriptionId: string;
}

export const [injectCropperRootContext, provideCropperRootContext] = createContext<CropperRootContext>(
    'CropperRoot',
    'components/cropper'
);
