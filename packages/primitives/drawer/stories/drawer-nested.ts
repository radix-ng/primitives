import { cn, demoButton, demoDrawer } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { drawerImports } from '@radix-ng/primitives/drawer';

/**
 * A self-recursive drawer: each level's content hosts the trigger for the next level, so drawers
 * stack on top of each other. Nesting is detected through the dialog hierarchy, so every parent
 * gains `data-nested-drawer-open` and recedes behind the one in front (see `demoDrawer.popup`).
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-drawer-nested',
    imports: [...drawerImports],
    template: `
        <div rdxDrawerRoot>
            <button rdxDrawerTrigger [class]="cn(b.base, level() === 1 ? b.primary : b.outline, b.size.md)">
                {{ level() === 1 ? 'Open drawer' : 'Open drawer ' + level() }}
            </button>

            <ng-template rdxDrawerPortal>
                <div rdxDrawerBackdrop [class]="cn(d.backdrop, d.overlayAnimated)"></div>

                <div rdxDrawerPopup [class]="cn(d.popup, d.side.bottom)">
                    <div aria-hidden="true" [class]="d.grip"></div>

                    <div rdxDrawerContent [class]="d.body">
                        <h2 rdxDrawerTitle [class]="d.title">Drawer level {{ level() }}</h2>
                        <p rdxDrawerDescription [class]="d.description">
                            @if (level() < max()) {
                                Open another to stack it on top — this one scales back and peeks behind it.
                            } @else {
                                Deepest level. Swipe down or press Escape to peel the stack back one at a time.
                            }
                        </p>

                        <div [class]="d.footer">
                            @if (level() < max()) {
                                <rdx-drawer-nested [level]="level() + 1" [max]="max()" />
                            }
                            <button rdxDrawerClose [class]="cn(b.base, b.outline, b.size.sm)">Close</button>
                        </div>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDrawerNestedComponent {
    /** Current depth (1 = the root drawer). */
    readonly level = input(1);
    /** How many levels can be stacked. */
    readonly max = input(4);

    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDrawer;
}
