import { NgModule } from '@angular/core';
import { RdxCropperCropAreaDirective } from './src/cropper-crop-area.directive';
import { RdxCropperDescriptionDirective } from './src/cropper-description.directive';
import { RdxCropperImageDirective } from './src/cropper-image.directive';
import { RdxCropperRootDirective } from './src/cropper-root.directive';

export * from './src/cropper-context.token';
export * from './src/cropper-crop-area.directive';
export * from './src/cropper-description.directive';
export * from './src/cropper-image.directive';
export * from './src/cropper-root.directive';

const _imports = [
    RdxCropperRootDirective,
    RdxCropperImageDirective,
    RdxCropperCropAreaDirective,
    RdxCropperDescriptionDirective
];

@NgModule({
    imports: [..._imports],
    exports: [..._imports]
})
export class RdxCropperModule {}
