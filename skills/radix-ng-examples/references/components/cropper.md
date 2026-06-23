# Cropper

#### Headless component for interactive image cropping — inspired by the experience on [X](https://x.com/).

Based on the React version [image-cropper](https://github.com/origin-space/image-cropper).

```typescript
import { demoCropper } from '../../storybook/styles';
import { RdxCropperCropAreaDirective } from '../src/cropper-crop-area.directive';
import { RdxCropperDescriptionDirective } from '../src/cropper-description.directive';
import { RdxCropperImageComponent } from '../src/cropper-image.component';
import { RdxCropperRootDirective } from '../src/cropper-root.directive';
import { ChangeDetectionStrategy, Component } from '@angular/core';

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
        <div image="https://images.unsplash.com/photo-1494790108377-be9c29b29330" rdxCropperRoot [class]="c.root">
            <div class="sr-only" rdxCropperDescription>
                Use the arrow keys to move the image, and plus or minus to zoom.
            </div>
            <div rdxCropperImage [imgClass]="c.image"></div>
            <div rdxCropperCropArea [class]="c.cropArea"></div>
        </div>
    `
})
export class CropperDefault {
    protected readonly c = demoCropper;
}
```

## Features

- ✅ Interactive: zoom (mouse wheel, pinch gesture, `+`/`-` keys) and pan (mouse drag, touch drag, arrow keys).
- ✅ Aspect ratio: enforces a specified aspect ratio for the crop area.
- ✅ Controlled/Uncontrolled: manage zoom state internally or control it via the `zoom` input.
- ✅ Crop calculation: outputs precise pixel coordinates of the cropped area relative to the original image.
- ✅ Accessible: exposes ARIA attributes and reads keyboard instructions from a description element.
- ✅ Customizable: control zoom limits, sensitivity, padding, and keyboard steps; style every part yourself.

## Import

```ts
import {
  RdxCropperRootDirective,
  RdxCropperImageComponent,
  RdxCropperCropAreaDirective,
  RdxCropperDescriptionDirective
} from '@radix-ng/primitives/cropper';
```

## Anatomy

Import all parts and piece them together.

```html
<div rdxCropperRoot>
  <div rdxCropperDescription></div>
  <div rdxCropperImage></div>
  <div rdxCropperCropArea></div>
</div>
```

## Examples

### Disabled

Set `disabled` to freeze the cropper — drag, wheel/pinch zoom, and keyboard are all ignored, the root
leaves the tab order, and `data-disabled` is exposed for styling.

```typescript
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
```

### With crop data

Subscribe to `onCropChange` to read the crop rectangle (in the source image's natural pixels).

```typescript
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
```

## Data attributes

### Root

| Attribute       | Present when                 |
| --------------- | ---------------------------- |
| `data-dragging` | The image is being dragged.  |
| `data-disabled` | The `disabled` input is set. |

## Accessibility

Always include a `rdxCropperDescription` element inside `rdxCropperRoot`. Its text is linked to the
root via `aria-describedby`, giving screen reader users instructions on how to operate the cropper; a
console warning is logged when it is missing. Visually hide it with an `sr-only` class. The root uses
`role="application"` so arrow and zoom keys reach the cropper instead of the screen reader's browse
mode, and its accessible name can be customized with the `ariaLabel` input.

### Keyboard Interactions

| Key                     | Description                         |
| ----------------------- | ----------------------------------- |
| Arrow keys              | Pan the image within the crop area. |
| `+` / `=` / `Page Up`   | Zoom in.                            |
| `-` / `_` / `Page Down` | Zoom out.                           |

## API Reference

### Root

`RdxCropperRootDirective` — the main container and controller. It handles logic, state, and interactions.

### Description

`RdxCropperDescriptionDirective` — renders a `<div>` for accessibility instructions. Its id is linked
via `aria-describedby` on the _Root_ element.

### Image

`RdxCropperImageComponent` — renders the actual `<img>`. It is positioned and scaled by `rdxCropperRoot`.

### Crop Area

`RdxCropperCropAreaDirective` — a `<div>` representing the visual crop window. Style it to show the bounds.
