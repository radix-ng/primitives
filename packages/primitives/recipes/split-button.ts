import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import { RdxButtonDirective } from '@radix-ng/primitives/button';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoMenu } from '../storybook/styles';

/**
 * Split Button — a primary action joined to a menu of related actions.
 *
 * Composition only: the `button` primitive drives the primary action, and the `menu` primitive
 * (Root / Trigger / Positioner / Popup / Item) drives the secondary actions. The two `<button>`
 * elements share a rounded shell so they read as one control while staying independently focusable.
 */
@Component({
    selector: 'split-button-example',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RdxButtonDirective, RdxMenuModule, LucideChevronDown],
    template: `
        <div class="flex flex-col items-center gap-4">
            <div class="inline-flex rounded-md shadow-sm">
                <button [class]="cn(b.base, b.primary, b.size.md, 'rounded-r-none')" (click)="run('Save')" rdxButton>
                    Save
                </button>

                <ng-container rdxMenuRoot>
                    <button
                        [class]="
                            cn(b.base, b.primary, b.size.icon, 'border-primary-foreground/20 rounded-l-none border-l')
                        "
                        aria-label="More save options"
                        rdxMenuTrigger
                    >
                        <svg lucideChevronDown size="16"></svg>
                    </button>

                    <div *rdxMenuPortal [class]="m.positioner" sideOffset="6" align="end" rdxMenuPositioner>
                        <div [class]="m.popup" rdxMenuPopup>
                            <button [class]="m.item" (onSelect)="run('Save and duplicate')" rdxMenuItem>
                                Save and duplicate
                            </button>
                            <button [class]="m.item" (onSelect)="run('Save as template')" rdxMenuItem>
                                Save as template
                            </button>
                            <div [class]="m.separator" rdxMenuSeparator></div>
                            <button [class]="m.item" (onSelect)="run('Save and close')" rdxMenuItem>
                                Save and close
                            </button>
                        </div>
                    </div>
                </ng-container>
            </div>

            <p class="text-muted-foreground text-sm">
                Last action:
                <span class="text-foreground font-medium">{{ lastAction() }}</span>
            </p>
        </div>
    `
})
export class SplitButtonExample {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly m = demoMenu;

    protected readonly lastAction = signal('—');

    protected run(action: string): void {
        this.lastAction.set(action);
    }
}
