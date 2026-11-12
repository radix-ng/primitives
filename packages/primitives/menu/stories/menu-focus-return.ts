import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild } from '@angular/core';
import { RdxMenuModule, type RdxMenuOpenChange } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoInput, demoMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-menu-focus-return',
    imports: [RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="grid w-80 gap-4">
            <div class="grid gap-2 text-sm">
                <label for="menu-root-return">Parent return focus</label>
                <select
                    id="menu-root-return"
                    #rootChoice
                    [class]="i.base"
                    [value]="rootMode()"
                    (change)="rootMode.set(rootChoice.value)"
                >
                    <option value="auto">Automatic</option>
                    <option value="none">None</option>
                    <option value="custom">Return target</option>
                </select>
                <label for="menu-child-return">Child return focus</label>
                <select
                    id="menu-child-return"
                    #childChoice
                    [class]="i.base"
                    [value]="childMode()"
                    (change)="childMode.set(childChoice.value)"
                >
                    <option value="auto">Automatic</option>
                    <option value="none">None</option>
                    <option value="custom">Parent field</option>
                </select>
                <div class="flex items-center gap-2">
                    <input
                        class="accent-primary"
                        id="menu-veto-parent"
                        #parentVeto
                        [checked]="cancelParent()"
                        (change)="cancelParent.set(parentVeto.checked)"
                        type="checkbox"
                    />
                    <label for="menu-veto-parent">Cancel parent focus-out</label>
                </div>
                <div class="flex items-center gap-2">
                    <input
                        class="accent-primary"
                        id="menu-veto-child"
                        #childVeto
                        [checked]="cancelChild()"
                        (change)="cancelChild.set(childVeto.checked)"
                        type="checkbox"
                    />
                    <label for="menu-veto-child">Cancel child focus-out</label>
                </div>
                <div class="flex items-center gap-2">
                    <input
                        class="accent-primary"
                        id="menu-return-retained"
                        #retained
                        [checked]="keepMounted()"
                        (change)="keepMounted.set(retained.checked)"
                        type="checkbox"
                    />
                    <label for="menu-return-retained">Keep mounted</label>
                </div>
            </div>
            <button #returnTarget [class]="cn(b.base, b.outline, b.size.md)">Return target</button>
            <ng-container (onOpenChange)="change('Parent', $event)" rdxMenuRoot>
                <button [class]="cn(b.base, b.outline, b.size.md)" rdxMenuTrigger>Focus policies</button>
                <ng-template [keepMounted]="keepMounted()" rdxMenuPortal>
                    <div [class]="m.positioner" sideOffset="4" rdxMenuPositioner>
                        <div
                            [class]="m.popup"
                            [finalFocus]="
                                rootMode() === 'custom' ? returnTarget : rootMode() === 'none' ? false : undefined
                            "
                            rdxMenuPopup
                        >
                            @if (childMode() === 'custom') {
                                <input
                                    #parentField
                                    [class]="i.base"
                                    aria-label="Child return target"
                                    placeholder="Child return target"
                                />
                            }
                            <ng-container (onOpenChange)="change('Child', $event)" rdxMenuRoot>
                                <button [class]="m.item" rdxMenuSubTrigger>More commands</button>
                                <ng-template [keepMounted]="keepMounted()" rdxMenuPortal>
                                    <div [class]="m.positioner" side="right" sideOffset="4" rdxMenuPositioner>
                                        <div
                                            [class]="m.popup"
                                            [finalFocus]="
                                                childMode() === 'custom'
                                                    ? parentField()?.nativeElement
                                                    : childMode() === 'none'
                                                      ? false
                                                      : undefined
                                            "
                                            rdxMenuPopup
                                        >
                                            <button [class]="m.item" rdxMenuItem>Run command</button>
                                        </div>
                                    </div>
                                </ng-template>
                            </ng-container>
                            <button [class]="m.item" rdxMenuItem>Close menu</button>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
            <button [class]="cn(b.base, b.outline, b.size.md)">After menu</button>
            <output class="text-muted-foreground text-sm" aria-live="polite">{{ lastChange() }}</output>
        </div>
    `
})
export class RdxMenuFocusReturnComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly i = demoInput;
    protected readonly m = demoMenu;
    protected readonly rootMode = signal('auto');
    protected readonly childMode = signal('auto');
    protected readonly cancelParent = signal(false);
    protected readonly cancelChild = signal(false);
    protected readonly keepMounted = signal(true);
    protected readonly lastChange = signal('No close requested');
    protected readonly parentField = viewChild('parentField', { read: ElementRef<HTMLElement> });
    protected change(layer: 'Parent' | 'Child', change: RdxMenuOpenChange) {
        if (change.open) return;
        if (change.reason === 'focus-out' && (layer === 'Parent' ? this.cancelParent() : this.cancelChild()))
            change.eventDetails.cancel();
        this.lastChange.set(`${layer}: ${change.reason}${change.eventDetails.isCanceled() ? ' (canceled)' : ''}`);
    }
}
