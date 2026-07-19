# Cropper — Disabled

> One example from the [Cropper](../components/cropper.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

Set `disabled` to freeze the cropper — drag, wheel/pinch zoom, and keyboard are all ignored, the root
leaves the tab order, and `data-disabled` is exposed for styling.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { demoCropper } from '../../storybook/styles';
import { RdxCropperCropAreaDirective } from '../src/cropper-crop-area.directive';
import { RdxCropperDescriptionDirective } from '../src/cropper-description.directive';
import { RdxCropperImageComponent } from '../src/cropper-image.component';
import { RdxCropperRootDirective } from '../src/cropper-root.directive';

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
```
