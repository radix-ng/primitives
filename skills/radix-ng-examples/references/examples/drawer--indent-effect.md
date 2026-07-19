# Drawer — Indent effect

> One example from the [Drawer](../components/drawer.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

Wrap content in `rdxDrawerProvider` (or call `provideRdxDrawerProvider()` at the app root) and mark a
background layer with `rdxDrawerIndentBackground` and the foreground page with `rdxDrawerIndent`.
Both gain `[data-active]`, `--drawer-swipe-progress`, `--nested-drawers`, and
`--drawer-frontmost-height` while any drawer is open, so the page-scale effect follows the closing
gesture.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { drawerImports } from '@radix-ng/primitives/drawer';
import { cn, demoButton, demoDrawer } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-drawer-page-scale',
    imports: [...drawerImports],
    template: `
        <div class="w-full" rdxDrawerProvider>
            <div class="relative w-full overflow-hidden [--bleed:3rem]" #portalContainer>
                <div class="bg-foreground absolute inset-0" rdxDrawerIndentBackground></div>

                <div
                    class="border-border bg-background text-foreground relative min-h-80 origin-top [transform:scale(1)_translateY(0)] border p-4 [transition-duration:calc(400ms*var(--indent-transition)),calc(250ms*var(--indent-transition))] will-change-transform [--indent-radius:calc(1rem*(1-var(--drawer-swipe-progress)))] [--indent-transition:calc(1-clamp(0,calc(var(--drawer-swipe-progress)*100000),1))] [transition:transform_400ms_cubic-bezier(0.32,0.72,0,1),border-radius_250ms_cubic-bezier(0.32,0.72,0,1)] data-[active]:[transform:scale(calc(0.98+(0.02*var(--drawer-swipe-progress))))_translateY(calc(0.5rem*(1-var(--drawer-swipe-progress))))] data-[active]:rounded-tl-[var(--indent-radius)] data-[active]:rounded-tr-[var(--indent-radius)]"
                    rdxDrawerIndent
                >
                    <div class="flex min-h-80 items-center justify-center">
                        <div [modal]="false" rdxDrawerRoot>
                            <button [class]="cn(b.base, b.outline, b.size.sm)" rdxDrawerTrigger>Open drawer</button>

                            <ng-template [container]="portalContainer" rdxDrawerPortal>
                                <div
                                    class="bg-foreground/20 absolute inset-0 opacity-[calc(1-var(--drawer-swipe-progress))] transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 data-[swiping]:duration-0"
                                    rdxDrawerBackdrop
                                ></div>

                                <div class="absolute inset-0 z-20 flex items-end justify-center" rdxDrawerViewport>
                                    <div
                                        class="border-border bg-card text-card-foreground -mb-[var(--bleed)] max-h-[calc(80vh+var(--bleed))] w-full [transform:translateY(var(--drawer-swipe-movement-y))] overflow-y-auto overscroll-contain border-t px-6 py-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px)+var(--bleed))] shadow-lg outline-none [transition:transform_450ms_cubic-bezier(0.32,0.72,0,1)] data-[ending-style]:[transform:translateY(calc(100%-var(--bleed)+2px))] data-[starting-style]:[transform:translateY(calc(100%-var(--bleed)+2px))] data-[swiping]:select-none data-[swiping]:[transition:none]"
                                        rdxDrawerPopup
                                    >
                                        <div class="bg-muted mx-auto mb-4 h-1 w-12"></div>
                                        <div class="mx-auto w-full max-w-lg" rdxDrawerContent>
                                            <h2 class="text-center" [class]="cn(d.title, 'text-center')" rdxDrawerTitle>
                                                Notifications
                                            </h2>
                                            <p [class]="cn(d.description, 'mb-6 text-center')" rdxDrawerDescription>
                                                You are all caught up. Good job!
                                            </p>
                                            <div class="flex justify-center gap-3">
                                                <button [class]="cn(b.base, b.outline, b.size.sm)" rdxDrawerClose>
                                                    Close
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ng-template>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class RdxDrawerPageScaleComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDrawer;
}
```
