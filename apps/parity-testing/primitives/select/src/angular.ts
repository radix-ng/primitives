import '@angular/compiler';
import { afterNextRender, Component, provideZonelessChangeDetection, viewChild } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
    _importsSelect,
    RdxSelectOpenChangeEvent,
    RdxSelectRoot,
    RdxSelectValueChangeEvent
} from '@radix-ng/primitives/select';
import { demoSelect } from '../../../../../packages/primitives/storybook/styles';
import '../../../../radix-storybook/.storybook/tailwind.css';
import { fixtureConfig, installProbe, itemKey, itemLabel, ItemValue } from './contract';

@Component({
    selector: 'parity-select',
    imports: [_importsSelect],
    template: `
        <form class="grid w-64 gap-3" (submit)="$event.preventDefault()" data-testid="form">
            <button data-testid="before" type="button">Before</button>
            <div
                [defaultValue]="config.initial"
                [multiple]="config.multiple"
                [disabled]="config.disabled"
                [readOnly]="config.readOnly"
                [modal]="false"
                [itemToStringLabel]="label"
                [itemToStringValue]="key"
                (onOpenChange)="openChange($event)"
                (onValueChange)="valueChange($event)"
                (onOpenChangeComplete)="trace.complete($event)"
                name="choice"
                rdxSelectRoot
            >
                <div rdxSelectLabel>Fruit</div>
                <button [class]="s.trigger" data-testid="trigger" rdxSelectTrigger>
                    <span #display="rdxSelectedValue" rdxSelectValue placeholder="Choose a fruit">
                        {{ display.slotText() }}
                    </span>
                </button>
                <ng-template rdxSelectPortal>
                    <div [class]="s.positioner" sideOffset="5" rdxSelectPositioner>
                        <div
                            [class]="s.popup"
                            [closeOnFocusOut]="config.closeOnFocusOut"
                            data-testid="popup"
                            rdxSelectPopup
                        >
                            <div [class]="s.list" rdxSelectList>
                                @for (option of config.options; track option.key) {
                                    <div
                                        [class]="s.item"
                                        [value]="option.value"
                                        [disabled]="option.disabled"
                                        [attr.data-option-key]="option.key"
                                        rdxSelectItem
                                    >
                                        <span rdxSelectItemText>{{ option.label }}</span>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </ng-template>
            </div>
            <button data-testid="after" type="button">After</button>
        </form>
    `
})
class AngularSelectFixture {
    readonly s = demoSelect;
    readonly config = fixtureConfig();
    readonly trace = installProbe('angular', this.config);
    readonly label = (value: ItemValue) => itemLabel(value, this.config.options);
    readonly key = itemKey;
    private readonly root = viewChild.required(RdxSelectRoot);

    constructor() {
        afterNextRender(() => {
            this.trace.probe.close = () => {
                this.root().close();
            };
            this.trace.probe.unmount = () => this.root().unmount();
        });
    }

    openChange({ open, eventDetails }: RdxSelectOpenChangeEvent): void {
        if ((open && this.config.name === 'cancel-open') || (!open && this.config.name === 'cancel-close'))
            eventDetails.cancel();
        const held = !open && this.config.defer && !eventDetails.isCanceled();
        if (held) eventDetails.preventUnmountOnClose();
        this.trace.open(open, eventDetails.reason, eventDetails.isCanceled(), eventDetails.event, held);
    }
    valueChange({ value, eventDetails }: RdxSelectValueChangeEvent<ItemValue>): void {
        if (this.config.name === 'cancel-value') eventDetails.cancel();
        this.trace.value(value, eventDetails.reason, eventDetails.isCanceled(), eventDetails.event);
    }
}

void bootstrapApplication(AngularSelectFixture, { providers: [provideZonelessChangeDetection()] });
