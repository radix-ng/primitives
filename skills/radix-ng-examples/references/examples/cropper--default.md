# Cropper — Default

> One example from the [Cropper](../components/cropper.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

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

## Setup and shared files

These examples use Angular standalone components and Tailwind CSS v4. Install
`@radix-ng/primitives`. Copy the component from **Show code** and any shared files below,
preserving their relative import paths. Import the example component in its parent and use its selector.

Install `tailwindcss`, `@tailwindcss/postcss` and `postcss`. Configure the PostCSS plugin:

```json
{ "plugins": { "@tailwindcss/postcss": {} } }
```

Save the CSS below as `demo-styles.css` next to your global stylesheet. Import Tailwind first,
then the demo styles. Both Storybook and Playground use this same CSS through `main.css`.

```css
@import 'tailwindcss';
@import './demo-styles.css';
```

The shared file supplies theme values, light/dark tokens, common classes and animation keyframes.
Set `data-theme="dark"` on `<html>` for the dark theme; the default is light. The font stacks have
system fallbacks; Inter and JetBrains Mono can be self-hosted for the Storybook typography.

<details>
<summary>demo-styles.css</summary>

[Download demo-styles.css](../demo-styles.css)

</details>
