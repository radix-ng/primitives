import { Component, input } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { Direction } from '@radix-ng/primitives/core';
import { Align, SideOrLogical } from '@radix-ng/primitives/popper';
import { demoSelect } from '../../storybook/styles';
import { _importsSelect } from '../index';

@Component({
    selector: 'select-arrow-example',
    imports: [_importsSelect, LucideCheck, LucideChevronDown],
    template: `
        <ng-container [dir]="dir()" defaultValue="Apple" rdxSelectRoot>
            <button class="w-64" [class]="s.trigger" aria-label="Fruit" rdxSelectTrigger>
                <span #display="rdxSelectedValue" rdxSelectValue>{{ display.slotText() }}</span>
                <svg [class]="s.icon" lucideChevronDown size="16" aria-hidden="true" />
            </button>
            <div
                *rdxSelectPortal
                [class]="s.positioner"
                [side]="side()"
                [align]="align()"
                [alignOffset]="alignOffset()"
                [dir]="dir()"
                sideOffset="6"
                arrowPadding="8"
                rdxSelectPositioner
            >
                <div [class]="s.popup" rdxSelectPopup>
                    <div [class]="s.arrow" width="12" height="6" rdxSelectArrow></div>
                    <div [class]="s.list" rdxSelectList>
                        @for (fruit of fruits; track fruit) {
                            <div [class]="s.item" [value]="fruit" rdxSelectItem>
                                <span [class]="s.itemIndicator" rdxSelectItemIndicator>
                                    <svg [class]="s.icon" lucideCheck size="16" aria-hidden="true" />
                                </span>
                                <span rdxSelectItemText>{{ fruit }}</span>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </ng-container>
    `
})
export class SelectArrowExample {
    protected readonly s = demoSelect;
    readonly side = input<SideOrLogical>('bottom');
    readonly align = input<Align>('center');
    readonly alignOffset = input(0);
    readonly dir = input<Direction>('ltr');
    readonly fruits = ['Apple', 'Banana', 'Blueberry'];
}
