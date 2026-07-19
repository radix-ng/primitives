# Cropper

Headless component for interactive image cropping — inspired by the experience on [X](https://x.com/).

> Index — full source of each example is one click away in `../examples/cropper--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

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

- [Disabled](../examples/cropper--disabled.md)
- [With crop data](../examples/cropper--with-crop-data.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/cropper.json`
- Styling (parts + `data-*`): `references/styling-contract/cropper.json`
