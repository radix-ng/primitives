import { Component } from '@angular/core';
import { drawerImports } from '@radix-ng/primitives/drawer';
import { cn, demoButton, demoDrawer } from '../../storybook/styles';

@Component({
    selector: 'rdx-drawer-page-scale',
    imports: [...drawerImports],
    template: `
        <!-- The provider tracks every open drawer; the indented region reacts via [data-active]. -->
        <div class="w-full max-w-md" rdxDrawerProvider>
            <div [class]="cn(d.indent, 'border-border bg-muted/40 rounded-xl border p-6')" rdxDrawerIndentBackground>
                <h3 class="text-foreground text-sm font-semibold">Page content</h3>
                <p class="text-muted-foreground mt-1 text-sm">
                    This panel scales back while the drawer is open, like an iOS sheet pushing the page away.
                </p>

                <div rdxDrawerRoot>
                    <button [class]="cn(b.base, b.primary, b.size.md, 'mt-4')" rdxDrawerTrigger>Open drawer</button>

                    <ng-template rdxDrawerPortalPresence>
                        <div [class]="d.portalAnimated" rdxDrawerPortal>
                            <div [class]="d.backdrop" rdxDrawerBackdrop></div>
                            <div [class]="cn(d.popup, d.side.bottom)" rdxDrawerPopup>
                                <div [class]="d.grip" aria-hidden="true"></div>
                                <div [class]="d.body" rdxDrawerContent>
                                    <h2 [class]="d.title" rdxDrawerTitle>Sheet</h2>
                                    <p [class]="d.description" rdxDrawerDescription>Close me to restore the page.</p>
                                    <div [class]="d.footer">
                                        <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDrawerClose>Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ng-template>
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
