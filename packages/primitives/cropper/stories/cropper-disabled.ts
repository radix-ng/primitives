import { Component } from '@angular/core';
import { demoCropper } from '../../storybook/styles';
import { RdxCropperCropAreaDirective } from '../src/cropper-crop-area.directive';
import { RdxCropperDescriptionDirective } from '../src/cropper-description.directive';
import { RdxCropperImageComponent } from '../src/cropper-image.component';
import { RdxCropperRootDirective } from '../src/cropper-root.directive';

@Component({
    selector: 'cropper-disabled',
    imports: [
        RdxCropperRootDirective,
        RdxCropperImageComponent,
        RdxCropperCropAreaDirective,
        RdxCropperDescriptionDirective
    ],
    template: `
        <div
            [class]="c.root"
            disabled
            image="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
            rdxCropperRoot
        >
            <div class="sr-only" rdxCropperDescription>
                Use the arrow keys to move the image, and plus or minus to zoom.
            </div>
            <div [imgClass]="c.image" rdxCropperImage></div>
            <div [class]="c.cropArea" rdxCropperCropArea></div>
        </div>
    `
})
export class CropperDisabled {
    protected readonly c = demoCropper;
}
