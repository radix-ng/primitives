import { Component } from '@angular/core';
import { createRdxDrawerHandle, drawerImports } from '@radix-ng/primitives/drawer';
import { cn, demoButton, demoDrawer } from '../../storybook/styles';

@Component({
    selector: 'rdx-drawer-detached',
    imports: [...drawerImports],
    template: `
        <div class="flex flex-col items-center gap-3">
            <!-- Triggers live outside the root and are linked through a shared handle. -->
            <div class="flex gap-2">
                <button id="cart" [class]="cn(b.base, b.outline, b.size.md)" [handle]="handle" rdxDrawerTrigger>
                    Cart
                </button>
                <button id="account" [class]="cn(b.base, b.outline, b.size.md)" [handle]="handle" rdxDrawerTrigger>
                    Account
                </button>
            </div>

            <button [class]="cn(b.base, b.secondary, b.size.sm)" (click)="handle.open('account')">
                Open account imperatively
            </button>

            <div [handle]="handle" rdxDrawerRoot>
                <ng-template rdxDrawerPortal>
                    <div [class]="cn(d.backdrop, d.overlayAnimated)" rdxDrawerBackdrop></div>

                    <div [class]="cn(d.popup, d.side.right)" rdxDrawerPopup>
                        <div [class]="d.body" rdxDrawerContent>
                            <h2 [class]="d.title" rdxDrawerTitle>Detached triggers</h2>
                            <p [class]="d.description" rdxDrawerDescription>
                                The triggers and this drawer are connected with
                                <code>createRdxDrawerHandle()</code>
                                rather than DOM nesting.
                            </p>

                            <div [class]="d.footer">
                                <button [class]="cn(b.base, b.primary, b.size.sm)" rdxDrawerClose>Close</button>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class RdxDrawerDetachedComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDrawer;
    protected readonly handle = createRdxDrawerHandle();
}
