import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AcceptableValue } from '@radix-ng/primitives/core';
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
        <button
            class="border-border bg-background text-foreground focus-visible:ring-ring inline-flex h-9 w-64 items-center justify-between gap-2 rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
            rdxSelectTrigger
        >
            <span #display="rdxSelectedValue" [placeholder]="placeholder()" rdxSelectValue>
                {{ display.slotText() }}
            </span>
            <span aria-hidden="true">⌄</span>
        </button>
        <div class="z-50" *rdxSelectPortal [sideOffset]="4" align="start" rdxSelectPositioner>
            <div
                class="border-border bg-popover text-popover-foreground w-64 rounded-md border p-1 shadow-md"
                rdxSelectPopup
            >
                <div rdxSelectList>
                    @for (option of options(); track option) {
                        <div
                            class="data-[highlighted]:bg-muted relative flex min-h-8 cursor-default items-center gap-2 rounded-sm px-2 text-sm outline-none"
                            [value]="option"
                            rdxSelectItem
                        >
                            <span class="w-4" aria-hidden="true" rdxSelectItemIndicator>✓</span>
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
    readonly options = input.required<readonly Value[]>();
    readonly placeholder = input('Select an option');
}
