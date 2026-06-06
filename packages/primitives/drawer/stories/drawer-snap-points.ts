import { Component, signal } from '@angular/core';
import { drawerImports, RdxDrawerSnapPoint } from '@radix-ng/primitives/drawer';
import { cn, demoButton, demoDrawer } from '../../storybook/styles';

@Component({
    selector: 'rdx-drawer-snap-points',
    imports: [...drawerImports],
    template: `
        <div [(snapPoint)]="snap" [snapPoints]="snapPoints" rdxDrawerRoot>
            <button [class]="cn(b.base, b.primary, b.size.md)" rdxDrawerTrigger>Open snap drawer</button>

            <ng-template rdxDrawerPortalPresence>
                <div [class]="d.portalAnimated" rdxDrawerPortal>
                    <div [class]="d.backdrop" rdxDrawerBackdrop></div>

                    <div [class]="cn(d.popup, d.side.bottom, 'h-[85vh]')" rdxDrawerPopup>
                        <div [class]="d.grip" aria-hidden="true"></div>

                        <div class="text-muted-foreground px-6 pt-2 text-center text-xs font-medium">
                            Active snap point: {{ snap() }}
                        </div>

                        <div [class]="d.body" rdxDrawerContent>
                            <h2 [class]="d.title" rdxDrawerTitle>Snap points</h2>
                            <p [class]="d.description" rdxDrawerDescription>
                                Drag the sheet between {{ snapPoints.length }} resting positions. A fast flick skips
                                points; dragging past the lowest one dismisses it.
                            </p>

                            <p class="text-muted-foreground mt-4 text-sm">
                                The active snap point is two-way bound with
                                <code>[(snapPoint)]</code>
                                , so app state and the gesture stay in sync.
                            </p>

                            <div [class]="d.footer">
                                <button [class]="cn(b.base, b.outline, b.size.sm)" (click)="snap.set(1)">Expand</button>
                                <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDrawerClose>Close</button>
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
    protected readonly snapPoints: RdxDrawerSnapPoint[] = ['160px', 0.5, 1];
    protected readonly snap = signal<RdxDrawerSnapPoint | null>(null);
}
