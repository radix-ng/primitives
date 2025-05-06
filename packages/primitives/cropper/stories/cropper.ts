import { Component, ViewEncapsulation } from '@angular/core';
import { RdxCropperCropAreaDirective } from '../src/cropper-crop-area.directive';
import { RdxCropperDescriptionDirective } from '../src/cropper-description.directive';
import { RdxCropperImageComponent } from '../src/cropper-image.component';
import { RdxCropperRootDirective } from '../src/cropper-root.directive';

@Component({
    selector: 'app-cropper-default',
    imports: [
        RdxCropperRootDirective,
        RdxCropperImageComponent,
        RdxCropperCropAreaDirective,
        RdxCropperDescriptionDirective
    ],
    encapsulation: ViewEncapsulation.None,
    styleUrl: 'cropper.styles.css',
    template: `
        <div class="flex-column-center">
            <div
                class="CropperRoot"
                style="height: 280px; width: 500px"
                rdxCropperRoot
                image="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
            >
                <div class="sr-only" rdxCropperDescription></div>
                <div imgClass="CropperImage" rdxCropperImage></div>
                <div class="CropArea" data-slot="cropper-crop-area" rdxCropperCropArea></div>
            </div>
        </div>
    `
})
export class CropperDefault {}
