import { Component, signal } from '@angular/core';
import { demoCropper } from '../../storybook/styles';
import { RdxCropperCropAreaDirective } from '../src/cropper-crop-area.directive';
import { RdxCropperDescriptionDirective } from '../src/cropper-description.directive';
import { RdxCropperImageComponent } from '../src/cropper-image.component';
import { Area, RdxCropperRootDirective } from '../src/cropper-root.directive';

@Component({
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
                [class]="c.root"
                (onCropChange)="cropData.set($event)"
                image="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
                rdxCropperRoot
            >
                <div class="sr-only" rdxCropperDescription>
                    Use the arrow keys to move the image, and plus or minus to zoom.
                </div>
                <div [imgClass]="c.image" rdxCropperImage></div>
                <div [class]="c.cropArea" rdxCropperCropArea></div>
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
