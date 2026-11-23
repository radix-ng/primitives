# Avatar — Default

> One example from the [Avatar](../components/avatar.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxAvatarFallbackDirective,
    RdxAvatarImageDirective,
    RdxAvatarRootDirective
} from '@radix-ng/primitives/avatar';

const IMG_COLM = 'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80';
const IMG_PEDRO = 'https://images.unsplash.com/photo-1511485977113-f34c92461ad9?ixlib=rb-1.2.1&w=128&h=128&dpr=2&q=80';

/**
 * Image avatars with an initials fallback shown only if the image is slow to load.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-avatar-demo',
    imports: [RdxAvatarRootDirective, RdxAvatarImageDirective, RdxAvatarFallbackDirective],
    template: `
        <div class="flex items-center gap-4">
            <span
                class="demo-avatar-root text-foreground relative inline-flex size-8 shrink-0 items-center justify-center overflow-hidden bg-neutral-200 align-middle text-sm leading-none dark:bg-neutral-800"
                rdxAvatarRoot
            >
                <img class="size-full object-cover" [src]="imgColm" rdxAvatarImage alt="Colm Tuite" />
                <span
                    class="text-foreground flex size-full items-center justify-center"
                    [delayMs]="600"
                    rdxAvatarFallback
                >
                    CT
                </span>
            </span>

            <span
                class="demo-avatar-root text-foreground relative inline-flex size-8 shrink-0 items-center justify-center overflow-hidden bg-neutral-200 align-middle text-sm leading-none dark:bg-neutral-800"
                rdxAvatarRoot
            >
                <img class="size-full object-cover" [src]="imgPedro" rdxAvatarImage alt="Pedro Duarte" />
                <span
                    class="text-foreground flex size-full items-center justify-center"
                    [delayMs]="600"
                    rdxAvatarFallback
                >
                    PD
                </span>
            </span>
        </div>
    `
})
export class RdxAvatarDemoComponent {
    protected readonly imgColm = IMG_COLM;
    protected readonly imgPedro = IMG_PEDRO;
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
