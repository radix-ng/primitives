import { cn, demoButton, demoDrawer } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { createRdxDrawerHandle, drawerImports } from '@radix-ng/primitives/drawer';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-drawer-detached',
    imports: [...drawerImports],
    template: `
        <div class="flex flex-col items-center gap-3">
            <!-- Triggers live outside the root and are linked through a shared handle. -->
            <div class="flex gap-2">
                <button id="cart" rdxDrawerTrigger [class]="cn(b.base, b.outline, b.size.md)" [handle]="handle">
                    Cart
                </button>
                <button id="account" rdxDrawerTrigger [class]="cn(b.base, b.outline, b.size.md)" [handle]="handle">
                    Account
                </button>
            </div>

            <button [class]="cn(b.base, b.secondary, b.size.sm)" (click)="handle.open('account')">
                Open account imperatively
            </button>

            <div rdxDrawerRoot [handle]="handle">
                <ng-template rdxDrawerPortal>
                    <div rdxDrawerBackdrop [class]="cn(d.backdrop, d.overlayAnimated)"></div>

                    <div rdxDrawerPopup [class]="cn(d.popup, d.side.right)">
                        <div rdxDrawerContent [class]="d.body">
                            <h2 rdxDrawerTitle [class]="d.title">Detached triggers</h2>
                            <p rdxDrawerDescription [class]="d.description">
                                The triggers and this drawer are connected with
                                <code>createRdxDrawerHandle()</code>
                                rather than DOM nesting.
                            </p>

                            <div [class]="d.footer">
                                <button rdxDrawerClose [class]="cn(b.base, b.primary, b.size.sm)">Close</button>
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
