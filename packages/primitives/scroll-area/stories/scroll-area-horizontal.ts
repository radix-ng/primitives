import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxScrollAreaContent,
    RdxScrollAreaRoot,
    RdxScrollAreaScrollbar,
    RdxScrollAreaThumb,
    RdxScrollAreaViewport
} from '@radix-ng/primitives/scroll-area';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'scroll-area-horizontal-example',
    imports: [
        RdxScrollAreaRoot,
        RdxScrollAreaViewport,
        RdxScrollAreaContent,
        RdxScrollAreaScrollbar,
        RdxScrollAreaThumb
    ],
    template: `
        <div class="border-border bg-background w-80 overflow-hidden border" rdxScrollAreaRoot>
            <div
                class="w-full rounded-[inherit]"
                rdxScrollAreaViewport
                tabindex="0"
                role="region"
                aria-label="Scrollable items"
            >
                <div class="flex gap-3 p-3" rdxScrollAreaContent>
                    @for (item of items; track item) {
                        <figure class="shrink-0">
                            <div
                                class="bg-muted text-foreground flex h-28 w-28 items-center justify-center text-2xl font-bold"
                            >
                                {{ item }}
                            </div>
                        </figure>
                    }
                </div>
            </div>

            <div class="flex h-2.5 touch-none p-0.5 select-none" rdxScrollAreaScrollbar orientation="horizontal">
                <div class="bg-foreground/30 hover:bg-foreground/50 h-full transition-colors" rdxScrollAreaThumb></div>
            </div>
        </div>
    `
})
export class ScrollAreaHorizontalExample {
    protected readonly items = Array.from({ length: 16 }, (_, index) => index + 1);
}
