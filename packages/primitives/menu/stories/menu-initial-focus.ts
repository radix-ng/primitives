import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-menu-initial-focus',
    imports: [RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="flex w-72 flex-col gap-4">
            <div class="text-foreground grid gap-2 text-sm">
                <div class="flex items-center gap-2">
                    <input
                        class="accent-primary"
                        id="menu-initial-first"
                        #firstToggle
                        [checked]="firstDisabled()"
                        (change)="firstDisabled.set(firstToggle.checked)"
                        type="checkbox"
                    />
                    <label for="menu-initial-first">First item disabled</label>
                </div>
                <div class="flex items-center gap-2">
                    <input
                        class="accent-primary"
                        id="menu-initial-all"
                        #allToggle
                        [checked]="allDisabled()"
                        (change)="allDisabled.set(allToggle.checked)"
                        type="checkbox"
                    />
                    <label for="menu-initial-all">All items disabled</label>
                </div>
                <div class="flex items-center gap-2">
                    <input
                        class="accent-primary"
                        id="menu-initial-retained"
                        #retainedToggle
                        [checked]="keepMounted()"
                        (change)="keepMounted.set(retainedToggle.checked)"
                        type="checkbox"
                    />
                    <label for="menu-initial-retained">Keep mounted</label>
                </div>
            </div>
            <ng-container rdxMenuRoot>
                <button [class]="cn(b.base, b.outline, b.size.md)" rdxMenuTrigger>Actions</button>
                <ng-template [keepMounted]="keepMounted()" rdxMenuPortal>
                    <div [class]="m.positioner" sideOffset="4" rdxMenuPositioner>
                        <div [class]="m.popup" rdxMenuPopup>
                            <button
                                [class]="m.item"
                                [disabled]="firstDisabled() || allDisabled()"
                                (onSelect)="selected.set('First command')"
                                rdxMenuItem
                            >
                                First command
                            </button>
                            <button
                                [class]="m.item"
                                [disabled]="allDisabled()"
                                (onSelect)="selected.set('Second command')"
                                rdxMenuItem
                            >
                                Second command
                            </button>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
            <output class="text-muted-foreground text-sm" aria-live="polite">Selected: {{ selected() }}</output>
        </div>
    `
})
export class RdxMenuInitialFocusComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly m = demoMenu;
    protected readonly firstDisabled = signal(true);
    protected readonly allDisabled = signal(false);
    protected readonly keepMounted = signal(false);
    protected readonly selected = signal('none');
}
