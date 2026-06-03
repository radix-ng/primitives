import { demoCropper } from '../../storybook/styles';
import { RdxCropperCropAreaDirective } from '../src/cropper-crop-area.directive';
import { RdxCropperDescriptionDirective } from '../src/cropper-description.directive';
import { RdxCropperImageComponent } from '../src/cropper-image.component';
import { Area, RdxCropperRootDirective } from '../src/cropper-root.directive';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'cropper-with-data',
    imports: [
        RdxCropperRootDirective,
        RdxCropperImageComponent,
        RdxCropperCropAreaDirective,
        RdxCropperDescriptionDirective
    ],
    template: `
        <div class="flex flex-col items-center gap-2">
            <div
                image="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
                rdxCropperRoot
                [class]="c.root"
                (onCropChange)="cropData.set($event)"
            >
                <div class="sr-only" rdxCropperDescription>
                    Use the arrow keys to move the image, and plus or minus to zoom.
                </div>
                <div rdxCropperImage [imgClass]="c.image"></div>
                <div rdxCropperCropArea [class]="c.cropArea"></div>
            </div>

            @if (cropData(); as data) {
                <code [class]="c.output">{{ format(data) }}</code>
            }
        </div>
    `
})
export class CropperWithData {
    protected readonly c = demoCropper;
    readonly cropData = signal<Area | null>(null);

    protected format(data: Area): string {
        return JSON.stringify(data, null, 2);
    }
}
