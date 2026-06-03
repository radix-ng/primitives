import { cn, demoButton, demoDrawer } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { drawerImports, RdxDrawerSnapPoint } from '@radix-ng/primitives/drawer';

const TOP_MARGIN_REM = 1;
const VISIBLE_SNAP_POINTS_REM = [30];

function toViewportSnapPoint(heightRem: number): RdxDrawerSnapPoint {
    return `${heightRem + TOP_MARGIN_REM}rem`;
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-drawer-snap-points',
    imports: [...drawerImports],
    template: `
        <div rdxDrawerRoot [snapPoints]="snapPoints">
            <button rdxDrawerTrigger [class]="cn(b.base, b.outline, b.size.sm)">Open snap drawer</button>

            <ng-template rdxDrawerPortal>
                <div
                    rdxDrawerBackdrop
                    [class]="
                        cn(
                            'bg-foreground/20 fixed inset-0 min-h-dvh opacity-[calc(1-var(--drawer-swipe-progress))]',
                            'transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)]',
                            d.overlayAnimated,
                            'data-[state=closed]:[animation-duration:450ms] data-[state=open]:[animation-duration:450ms]',
                            'data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 data-[swiping]:duration-0'
                        )
                    "
                ></div>

                <div class="fixed inset-0 flex touch-none items-end justify-center" rdxDrawerViewport>
                    <div
                        class="border-border bg-card text-card-foreground data-[state=open]:animate-drawer-in-bottom relative flex h-[calc(100dvh-var(--top-margin))] min-h-0 w-full [transform:translateY(var(--drawer-swipe-movement-y))] touch-none flex-col overflow-visible border-t shadow-lg outline-none [--bleed:3rem] [--top-margin:1rem] [transition:transform_450ms_cubic-bezier(0.32,0.72,0,1),box-shadow_450ms_cubic-bezier(0.32,0.72,0,1)] after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-[var(--bleed)] after:bg-[inherit] after:content-[''] data-[ending-style]:[transform:translateY(calc(100%+2px))] data-[starting-style]:[transform:translateY(calc(100%+2px))] data-[state=open]:[animation-duration:450ms] data-[swiping]:select-none data-[swiping]:[transition:none]"
                        rdxDrawerPopup
                    >
                        <div class="border-border shrink-0 touch-none border-b px-6 pt-3.5 pb-4">
                            <div class="bg-muted mx-auto mb-2.5 h-1 w-12 shrink-0"></div>
                            <h2 class="cursor-default text-center text-base font-bold" rdxDrawerTitle>Snap points</h2>
                        </div>

                        <div
                            class="min-h-0 flex-1 touch-auto overflow-y-auto overscroll-contain px-6 pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
                            rdxDrawerContent
                        >
                            <div class="mx-auto w-full max-w-90">
                                <p class="text-muted-foreground mb-4 text-center text-sm" rdxDrawerDescription>
                                    Drag the sheet to snap between a compact peek and a near full-height view.
                                </p>

                                <div class="mb-6 grid gap-3" aria-hidden="true">
                                    @for (item of items; track item) {
                                        <div class="bg-muted h-12"></div>
                                    }
                                </div>

                                <div class="flex items-center justify-end gap-3">
                                    <button rdxDrawerClose [class]="cn(b.base, b.outline, b.size.sm)">Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDrawerSnapPointsComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDrawer;
    protected readonly snapPoints: RdxDrawerSnapPoint[] = [...VISIBLE_SNAP_POINTS_REM.map(toViewportSnapPoint), 1];
    protected readonly items = Array.from({ length: 20 }, (_, index) => index);
}
