import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { AcceptableValue } from '@radix-ng/primitives/core';
import { demoSelect } from '../../storybook/styles';
import {
    provideRdxSelectRoot,
    RdxSelectItem,
    RdxSelectItemIndicator,
    RdxSelectItemText,
    RdxSelectList,
    RdxSelectPopup,
    RdxSelectPortal,
    RdxSelectPositioner,
    RdxSelectRoot,
    RdxSelectTrigger,
    RdxSelectValue
} from '../index';

/** Application-owned markup; all state, events and form bindings are inherited from the primitive. */
@Component({
    selector: 'example-select',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [provideRdxSelectRoot(SelectTypedControl)],
    imports: [
        LucideCheck,
        LucideChevronDown,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPortal,
        RdxSelectPositioner,
        RdxSelectPopup,
        RdxSelectList,
        RdxSelectItem,
        RdxSelectItemText,
        RdxSelectItemIndicator
    ],
    template: `
        <button class="w-64" [class]="s.trigger" rdxSelectTrigger>
            <span #display="rdxSelectedValue" [placeholder]="placeholder()" rdxSelectValue>
                {{ display.slotText() }}
            </span>
            <svg [class]="s.icon" lucideChevronDown size="16" aria-hidden="true" />
        </button>
        <div *rdxSelectPortal [class]="s.positioner" [sideOffset]="4" align="start" rdxSelectPositioner>
            <div [class]="s.popup" rdxSelectPopup>
                <div [class]="s.list" rdxSelectList>
                    @for (option of options(); track option) {
                        <div [class]="s.item" [value]="option" rdxSelectItem>
                            <span [class]="s.itemIndicator" aria-hidden="true" rdxSelectItemIndicator>
                                <svg [class]="s.icon" lucideCheck size="16" aria-hidden="true" />
                            </span>
                            <span rdxSelectItemText>{{ itemToStringLabel()?.(option) ?? option }}</span>
                        </div>
                    }
                </div>
            </div>
        </div>
    `
})
export class SelectTypedControl<
    Value extends AcceptableValue = AcceptableValue,
    Multiple extends boolean = false
> extends RdxSelectRoot<Value, Multiple> {
    protected readonly s = demoSelect;

    readonly options = input.required<readonly Value[]>();
    readonly placeholder = input('Select an option');
}
