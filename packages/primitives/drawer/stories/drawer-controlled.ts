import { cn, demoButton, demoDrawer } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { drawerImports } from '@radix-ng/primitives/drawer';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-drawer-controlled',
    imports: [...drawerImports],
    template: `
        <div class="flex flex-col items-center gap-4">
            <p class="text-muted-foreground text-xs">Drawer is {{ open() ? 'open' : 'closed' }}</p>

            <button [class]="cn(b.base, b.outline, b.size.sm)" (click)="open.set(true)">Open from outside</button>

            <div rdxDrawerRoot [(open)]="open">
                <button rdxDrawerTrigger [class]="cn(b.base, b.primary, b.size.md)">Open drawer</button>

                <ng-template rdxDrawerPortal>
                    <div rdxDrawerBackdrop [class]="cn(d.backdrop, d.overlayAnimated)"></div>

                    <div rdxDrawerPopup [class]="cn(d.popup, d.side.bottom)">
                        <div aria-hidden="true" [class]="d.grip"></div>

                        <div rdxDrawerContent [class]="d.body">
                            <h2 rdxDrawerTitle [class]="d.title">Controlled drawer</h2>
                            <p rdxDrawerDescription [class]="d.description">
                                The open state is owned by the component and bound with
                                <code>[(open)]</code>
                                .
                            </p>

                            <div [class]="d.footer">
                                <button [class]="cn(b.base, b.primary, b.size.sm)" (click)="open.set(false)">
                                    Close from outside
                                </button>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class RdxDrawerControlledComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDrawer;
    protected readonly open = signal(false);
}
