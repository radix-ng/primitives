# Cropper — Default

> One example from the [Cropper](../components/cropper.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

The preview above uses this standalone component. Copy the setup and shared files below as well.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxCropperCropAreaDirective,
    RdxCropperDescriptionDirective,
    RdxCropperImageComponent,
    RdxCropperRootDirective
} from '@radix-ng/primitives/cropper';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'cropper-default',
    imports: [
        RdxCropperRootDirective,
        RdxCropperImageComponent,
        RdxCropperCropAreaDirective,
        RdxCropperDescriptionDirective
    ],
    template: `
        <div
            class="demo-cropper-root group relative flex h-[280px] w-[500px] max-w-full items-center justify-center overflow-hidden data-[disabled]:cursor-default data-[disabled]:opacity-60"
            image="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
            rdxCropperRoot
        >
            <div class="sr-only" rdxCropperDescription>
                Use the arrow keys to move the image, and plus or minus to zoom.
            </div>
            <div [imgClass]="c.image" rdxCropperImage></div>
            <div class="demo-cropper-crop-area pointer-events-none absolute" rdxCropperCropArea></div>
        </div>
    `
})
export class CropperDefault {
    protected readonly c = {
        root: 'demo-cropper-root group relative flex h-[280px] w-[500px] max-w-full items-center justify-center overflow-hidden data-[disabled]:cursor-default data-[disabled]:opacity-60',
        image: 'pointer-events-none size-full object-cover',
        cropArea: 'demo-cropper-crop-area pointer-events-none absolute',
        output: 'demo-cropper-output mt-2 max-w-full overflow-auto p-2'
    };
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
