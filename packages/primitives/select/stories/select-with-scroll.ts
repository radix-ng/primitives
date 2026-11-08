import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideCheck, LucideChevronDown, LucideChevronUp } from '@lucide/angular';
import { demoSelect } from '../../storybook/styles';
import { RdxSelectGroup } from '../src/select-group';
import { RdxSelectGroupLabel } from '../src/select-group-label';
import { RdxSelectItem } from '../src/select-item';
import { RdxSelectItemIndicator } from '../src/select-item-indicator';
import { RdxSelectItemText } from '../src/select-item-text';
import { RdxSelectList } from '../src/select-list';
import { RdxSelectPopup } from '../src/select-popup';
import { RdxSelectPortal } from '../src/select-portal';
import { RdxSelectPositioner } from '../src/select-positioner';
import { RdxSelectRoot } from '../src/select-root';
import { RdxSelectScrollDownButton } from '../src/select-scroll-down-button';
import { RdxSelectScrollUpButton } from '../src/select-scroll-up-button';
import { RdxSelectTrigger } from '../src/select-trigger';
import { RdxSelectValue } from '../src/select-value';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'select-with-scroll',
    imports: [
        RdxSelectRoot,
        RdxSelectPortal,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPopup,
        RdxSelectList,
        LucideChevronDown,
        LucideChevronUp,
        LucideCheck,
        RdxSelectItem,
        RdxSelectGroupLabel,
        RdxSelectGroup,
        RdxSelectPositioner,
        RdxSelectItemText,
        RdxSelectItemIndicator,
        RdxSelectScrollUpButton,
        RdxSelectScrollDownButton
    ],
    template: `
        <ng-container rdxSelectRoot>
            <button class="min-w-40" [class]="s.trigger" aria-label="Customise options" rdxSelectTrigger>
                <span #selectedValue="rdxSelectedValue" rdxSelectValue placeholder="Select a fruit...">
                    {{ selectedValue.slotText() }}
                </span>
                <svg [class]="s.icon" lucideChevronDown size="16" aria-hidden="true" />
            </button>

            <div *rdxSelectPortal [class]="s.positioner" [sideOffset]="5" align="start" rdxSelectPositioner>
                <div class="max-h-[300px] overflow-hidden" [class]="s.popup" rdxSelectPopup>
                    <div [class]="s.scrollButton" rdxSelectScrollUpButton>
                        <svg [class]="s.icon" lucideChevronUp size="16" aria-hidden="true" />
                    </div>
                    <div [class]="s.list" rdxSelectList>
                        <div [class]="s.groupLabel" rdxSelectGroupLabel>Fruits</div>
                        <div rdxSelectGroup>
                            @for (option of options; track option) {
                                <div [class]="s.item" [value]="option" rdxSelectItem>
                                    <span [class]="s.itemIndicator" rdxSelectItemIndicator>
                                        <svg [class]="s.icon" lucideCheck size="16" aria-hidden="true" />
                                    </span>
                                    <span rdxSelectItemText>{{ option }}</span>
                                </div>
                            }
                        </div>
                        <div [class]="s.separator"></div>
                        <div [class]="s.groupLabel" rdxSelectGroupLabel>Vegetables</div>
                        <div rdxSelectGroup>
                            @for (vegetable of vegetables; track vegetable) {
                                <div [class]="s.item" [value]="vegetable" rdxSelectItem>
                                    <span [class]="s.itemIndicator" rdxSelectItemIndicator>
                                        <svg [class]="s.icon" lucideCheck size="16" aria-hidden="true" />
                                    </span>
                                    <span rdxSelectItemText>{{ vegetable }}</span>
                                </div>
                            }
                        </div>
                    </div>
                    <div [class]="s.scrollButton" rdxSelectScrollDownButton>
                        <svg [class]="s.icon" lucideChevronDown size="16" aria-hidden="true" />
                    </div>
                </div>
            </div>
        </ng-container>
    `
})
export class SelectWithScroll {
    protected readonly s = demoSelect;

    readonly options = ['Apple', 'Banana', 'Blueberry', 'Grapes', 'Pineapple'];
    readonly vegetables = [
        'Aubergine',
        'Broccoli',
        'Carrot',
        'Courgette',
        'Leek',
        'Aubergine 2',
        'Broccoli 2',
        'Carrot 2',
        'Courgette 2',
        'Leek 2'
    ];
}
