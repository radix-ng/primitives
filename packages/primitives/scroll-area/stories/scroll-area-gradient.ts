import { Component } from '@angular/core';
import {
    RdxScrollAreaContent,
    RdxScrollAreaRoot,
    RdxScrollAreaScrollbar,
    RdxScrollAreaThumb,
    RdxScrollAreaViewport
} from '@radix-ng/primitives/scroll-area';

const html = String.raw;

/**
 * Fades the content near the scroll edges by feeding the viewport's
 * `--scroll-area-overflow-y-start` / `--scroll-area-overflow-y-end` CSS variables
 * (the distance in px to each edge) into a `mask-image` gradient. The fade
 * disappears once you reach an edge because the matching variable becomes `0px`.
 */
@Component({
    selector: 'scroll-area-gradient-example',
    imports: [
        RdxScrollAreaRoot,
        RdxScrollAreaViewport,
        RdxScrollAreaContent,
        RdxScrollAreaScrollbar,
        RdxScrollAreaThumb
    ],
    template: html`
        <div class="border-border bg-background h-56 w-72 overflow-hidden rounded-md border" rdxScrollAreaRoot>
            <div
                class="h-full w-full rounded-[inherit] [mask-image:linear-gradient(to_bottom,transparent,#000_var(--scroll-area-overflow-y-start,0px),#000_calc(100%-var(--scroll-area-overflow-y-end,0px)),transparent)]"
                rdxScrollAreaViewport
            >
                <div class="text-foreground space-y-3 p-4 text-sm leading-relaxed" rdxScrollAreaContent>
                    @for (paragraph of paragraphs; track $index) {
                    <p>{{ paragraph }}</p>
                    }
                </div>
            </div>

            <div class="flex w-2.5 touch-none p-0.5 select-none" rdxScrollAreaScrollbar orientation="vertical">
                <div
                    class="bg-foreground/30 hover:bg-foreground/50 w-full rounded-full transition-colors"
                    rdxScrollAreaThumb
                ></div>
            </div>
        </div>
    `
})
export class ScrollAreaGradientExample {
    readonly paragraphs = [
        'Scroll areas keep the native scroll behavior — momentum, keyboard, and accessibility — while letting you style a custom scrollbar.',
        'The viewport exposes the distance to each edge as a CSS variable, so effects like this gradient fade react to the exact scroll position.',
        'Because the variables report pixels-from-edge, the top fade vanishes when you reach the top and the bottom fade vanishes at the very end.',
        'The scrollbar and thumb are headless: every visual decision here is a Tailwind utility, driven only by the data attributes and CSS variables.',
        'Try scrolling to the middle — both gradients are visible. Scroll to either end and watch the corresponding fade disappear.',
        'Everything you see is composed from Root, Viewport, Content, Scrollbar, and Thumb. No styles ship inside the primitive itself.'
    ];
}
