import '@angular/compiler';
import { afterNextRender, Component, provideZonelessChangeDetection, viewChild } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RdxDirectionProvider } from '@radix-ng/primitives/direction-provider';
import {
    _importsSelect,
    RdxSelectOpenChangeEvent,
    RdxSelectRoot,
    RdxSelectValueChangeEvent
} from '@radix-ng/primitives/select';
import { demoSelect } from '../../../../../packages/primitives/storybook/styles';
import '../../../../radix-storybook/.storybook/tailwind.css';
import { fixtureConfig, installProbe, itemKey, itemLabel, ItemValue } from './contract';

const config = fixtureConfig();
document.documentElement.dir = config.dir;

@Component({
    selector: 'parity-select',
    imports: [_importsSelect, RdxDirectionProvider],
    template: `
        <form
            class="grid w-64 gap-3"
            [direction]="config.dir"
            [attr.dir]="config.dir"
            (submit)="$event.preventDefault()"
            data-testid="form"
            rdxDirectionProvider
        >
            <button
                (click)="trace.probe.backgroundActivations = trace.probe.backgroundActivations + 1"
                data-testid="before"
                type="button"
            >
                Before
            </button>
            <div
                class="grid gap-3"
                [defaultValue]="config.initial"
                [multiple]="config.multiple"
                [disabled]="config.disabled"
                [readOnly]="config.readOnly"
                [modal]="config.modal"
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
                    <span #display="rdxSelectedValue" data-testid="value" rdxSelectValue placeholder="Choose a fruit">
                        {{ display.slotText() }}
                    </span>
                </button>
                <ng-template rdxSelectPortal>
                    @if (config.aligned) {
                        <div [class]="s.positioner" data-testid="positioner" rdxSelectItemAlignedPosition>
                            <div [closeOnFocusOut]="config.closeOnFocusOut" data-testid="popup" rdxSelectPopup>
                                <div [class]="s.popup" rdxSelectItemAlignedPositionContent>
                                    <div [class]="s.list" rdxSelectList>
                                        @for (option of config.options; track option.key) {
                                            <div
                                                [class]="s.item"
                                                [value]="option.value"
                                                [disabled]="option.disabled"
                                                [attr.data-option-key]="option.key"
                                                rdxSelectItem
                                            >
                                                <span [attr.data-option-text]="option.key" rdxSelectItemText>
                                                    {{ option.label }}
                                                </span>
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    } @else if (config.name === 'anchor-default') {
                        <div [class]="s.positioner" sideOffset="5" data-testid="positioner" rdxSelectPositioner>
                            <div [class]="s.popup + ' w-48 min-w-48!'" data-testid="popup" rdxSelectPopup>
                                <div [class]="s.list" rdxSelectList>
                                    @for (option of config.options; track option.key) {
                                        <div
                                            [class]="s.item"
                                            [value]="option.value"
                                            [disabled]="option.disabled"
                                            [attr.data-option-key]="option.key"
                                            rdxSelectItem
                                        >
                                            <span [attr.data-option-text]="option.key" rdxSelectItemText>
                                                {{ option.label }}
                                            </span>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    } @else {
                        <div
                            [class]="s.positioner"
                            sideOffset="5"
                            align="start"
                            data-testid="positioner"
                            rdxSelectPositioner
                        >
                            <div
                                [class]="config.dir === 'rtl' ? s.popup + ' w-48 min-w-48!' : s.popup"
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
                                            <span [attr.data-option-text]="option.key" rdxSelectItemText>
                                                {{ option.label }}
                                            </span>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    }
                </ng-template>
            </div>
            <button
                (click)="trace.probe.backgroundActivations = trace.probe.backgroundActivations + 1"
                data-testid="after"
                type="button"
            >
                After
            </button>
        </form>
        @if (config.scrollable) {
            <div class="h-[150vh]" aria-hidden="true"></div>
        }
    `
})
class AngularSelectFixture {
    readonly s = demoSelect;
    readonly config = config;
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
        if (
            (open && this.config.name === 'cancel-open') ||
            (!open && (this.config.name === 'cancel-close' || this.config.name === 'modal-cancel-close'))
        )
            eventDetails.cancel();
        const held = !open && this.config.defer && !eventDetails.isCanceled();
        if (held) eventDetails.preventUnmountOnClose();
        this.trace.open(open, eventDetails.reason, eventDetails.isCanceled(), eventDetails.event, held);
    }
    valueChange({ value, eventDetails }: RdxSelectValueChangeEvent<ItemValue>): void {
        if (this.config.name === 'cancel-value' || this.config.name === 'typeahead-cancel-value') eventDetails.cancel();
        this.trace.value(value, eventDetails.reason, eventDetails.isCanceled(), eventDetails.event);
    }
}

void bootstrapApplication(AngularSelectFixture, { providers: [provideZonelessChangeDetection()] });
