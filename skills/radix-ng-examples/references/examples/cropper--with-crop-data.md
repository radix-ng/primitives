# Cropper — With crop data

> One example from the [Cropper](../components/cropper.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

Subscribe to `onCropChange` to read the crop rectangle (in the source image's natural pixels).

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    Area,
    RdxCropperCropAreaDirective,
    RdxCropperDescriptionDirective,
    RdxCropperImageComponent,
    RdxCropperRootDirective
} from '@radix-ng/primitives/cropper';

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
                class="demo-cropper-root group relative flex h-[280px] w-[500px] max-w-full items-center justify-center overflow-hidden data-[disabled]:cursor-default data-[disabled]:opacity-60"
                (onCropChange)="cropData.set($event)"
                image="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
                rdxCropperRoot
            >
                <div class="sr-only" rdxCropperDescription>
                    Use the arrow keys to move the image, and plus or minus to zoom.
                </div>
                <div [imgClass]="c.image" rdxCropperImage></div>
                <div class="demo-cropper-crop-area pointer-events-none absolute" rdxCropperCropArea></div>
            </div>

            @if (cropData(); as data) {
                <code class="demo-cropper-output mt-2 max-w-full overflow-auto p-2">{{ format(data) }}</code>
            }
        </div>
    `
})
export class CropperWithData {
    protected readonly c = {
        root: 'demo-cropper-root group relative flex h-[280px] w-[500px] max-w-full items-center justify-center overflow-hidden data-[disabled]:cursor-default data-[disabled]:opacity-60',
        image: 'pointer-events-none size-full object-cover',
        cropArea: 'demo-cropper-crop-area pointer-events-none absolute',
        output: 'demo-cropper-output mt-2 max-w-full overflow-auto p-2'
    };
    readonly cropData = signal<Area | null>(null);

    protected format(data: Area): string {
        return JSON.stringify(data, null, 2);
    }
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
