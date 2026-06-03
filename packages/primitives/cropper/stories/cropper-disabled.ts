import { demoCropper } from '../../storybook/styles';
import { RdxCropperCropAreaDirective } from '../src/cropper-crop-area.directive';
import { RdxCropperDescriptionDirective } from '../src/cropper-description.directive';
import { RdxCropperImageComponent } from '../src/cropper-image.component';
import { RdxCropperRootDirective } from '../src/cropper-root.directive';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'cropper-disabled',
    imports: [
        RdxCropperRootDirective,
        RdxCropperImageComponent,
        RdxCropperCropAreaDirective,
        RdxCropperDescriptionDirective
    ],
    template: `
        <div
            disabled
            image="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
            rdxCropperRoot
            [class]="c.root"
        >
            <div class="sr-only" rdxCropperDescription>
                Use the arrow keys to move the image, and plus or minus to zoom.
            </div>
            <div rdxCropperImage [imgClass]="c.image"></div>
            <div rdxCropperCropArea [class]="c.cropArea"></div>
        </div>
    `
})
export class CropperDisabled {
    protected readonly c = demoCropper;
}
