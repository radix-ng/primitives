# Avatar — Fallback

> One example from the [Avatar](../components/avatar.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

The fallback renders when there is no image or the image fails to load.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxAvatarFallbackDirective,
    RdxAvatarImageDirective,
    RdxAvatarRootDirective
} from '@radix-ng/primitives/avatar';

const IMG_COLM = 'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80';

const AVATAR_DIRECTIVES = [RdxAvatarRootDirective, RdxAvatarImageDirective, RdxAvatarFallbackDirective];

/**
 * The same avatar at the three sizes from the style layer.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-avatar-sizes',
    imports: AVATAR_DIRECTIVES,
    template: `
        <div class="flex items-center gap-4">
            <span
                class="demo-avatar-root relative inline-flex size-8 shrink-0 items-center justify-center overflow-hidden align-middle text-xs"
                rdxAvatarRoot
            >
                <img class="size-full object-cover" [src]="img" rdxAvatarImage alt="Colm Tuite" />
                <span class="text-foreground flex size-full items-center justify-center font-medium" rdxAvatarFallback>
                    CT
                </span>
            </span>
            <span
                class="demo-avatar-root relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden align-middle text-sm"
                rdxAvatarRoot
            >
                <img class="size-full object-cover" [src]="img" rdxAvatarImage alt="Colm Tuite" />
                <span class="text-foreground flex size-full items-center justify-center font-medium" rdxAvatarFallback>
                    CT
                </span>
            </span>
            <span
                class="demo-avatar-root relative inline-flex size-12 shrink-0 items-center justify-center overflow-hidden align-middle text-base"
                rdxAvatarRoot
            >
                <img class="size-full object-cover" [src]="img" rdxAvatarImage alt="Colm Tuite" />
                <span class="text-foreground flex size-full items-center justify-center font-medium" rdxAvatarFallback>
                    CT
                </span>
            </span>
        </div>
    `
})
export class RdxAvatarSizesComponent {
    protected readonly img = IMG_COLM;
}

/**
 * The fallback renders when there is no image or the image fails to load.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-avatar-fallback',
    imports: AVATAR_DIRECTIVES,
    template: `
        <div class="flex items-center gap-4">
            <!-- no image at all -->
            <span
                class="demo-avatar-root relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden align-middle text-sm"
                rdxAvatarRoot
            >
                <span class="text-foreground flex size-full items-center justify-center font-medium" rdxAvatarFallback>
                    PD
                </span>
            </span>

            <!-- image that fails to load -->
            <span
                class="demo-avatar-root relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden align-middle text-sm"
                rdxAvatarRoot
            >
                <img class="size-full object-cover" rdxAvatarImage alt="Broken" src="" />
                <span class="text-foreground flex size-full items-center justify-center font-medium" rdxAvatarFallback>
                    JD
                </span>
            </span>
        </div>
    `
})
export class RdxAvatarFallbackComponent {}

/**
 * `delayMs` waits before showing the fallback, so it only appears on slower
 * connections (here the image never loads, so the fallback appears after 600ms).
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-avatar-delay',
    imports: AVATAR_DIRECTIVES,
    template: `
        <span
            class="demo-avatar-root relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden align-middle text-sm"
            rdxAvatarRoot
        >
            <img class="size-full object-cover" rdxAvatarImage alt="Slow" src="https://invalid.example/none.png" />
            <span
                class="text-foreground flex size-full items-center justify-center font-medium"
                [delayMs]="600"
                rdxAvatarFallback
            >
                RN
            </span>
        </span>
    `
})
export class RdxAvatarDelayComponent {}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
