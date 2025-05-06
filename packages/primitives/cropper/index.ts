import { NgModule } from '@angular/core';
import { RdxCropperCropAreaDirective } from './src/cropper-crop-area.directive';
import { RdxCropperDescriptionDirective } from './src/cropper-description.directive';
import { RdxCropperImageComponent } from './src/cropper-image.component';
import { RdxCropperRootDirective } from './src/cropper-root.directive';

export * from './src/cropper-context.token';
export * from './src/cropper-crop-area.directive';
export * from './src/cropper-description.directive';
export * from './src/cropper-image.component';
export * from './src/cropper-root.directive';

const _imports = [
    RdxCropperRootDirective,
    RdxCropperImageComponent,
    RdxCropperCropAreaDirective,
    RdxCropperDescriptionDirective
];

@NgModule({
    imports: [..._imports],
    exports: [..._imports]
})
export class RdxCropperModule {}
