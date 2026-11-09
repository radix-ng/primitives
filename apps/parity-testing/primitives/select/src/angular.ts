import '@angular/compiler';
import { afterNextRender, Component, provideZonelessChangeDetection, signal, viewChild } from '@angular/core';
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
import {
    changeOptions,
    fixtureConfig,
    installProbe,
    itemKey,
    itemLabel,
    ItemValue,
    OptionAction,
    optionActions
} from './contract';

const config = fixtureConfig();
document.documentElement.dir = config.dir;

@Component({
    selector: 'parity-select',
    host: {
        '(document:keydown)': 'onCommand($event)',
        '[class]': 'config.geometry?.shellClass',
        'data-testid': 'scroller'
    },
    imports: [_importsSelect, RdxDirectionProvider],
    template: `
        <form
            [class]="config.geometry?.formClass ?? 'grid w-64 gap-3'"
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
                [items]="config.dynamic ? options() : undefined"
                [isItemEqualToValue]="config.name === 'dynamic-objects' ? equalByKey : undefined"
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
                <ng-template [container]="config.geometry?.customPortal ? portalHost : undefined" rdxSelectPortal>
                    @if (config.aligned) {
                        <div [class]="s.positioner" data-testid="positioner" rdxSelectItemAlignedPosition>
                            <div
                                [class]="config.geometry ? 'min-h-0 flex-1' : ''"
                                [closeOnFocusOut]="config.closeOnFocusOut"
                                data-testid="popup"
                                rdxSelectPopup
                            >
                                <div
                                    [class]="s.popup + (config.geometry ? ' min-h-0 flex-1 overflow-hidden' : '')"
                                    rdxSelectItemAlignedPositionContent
                                >
                                    @if (config.geometry?.arrows) {
                                        <div
                                            [class]="s.scrollButton + ' absolute inset-x-0 top-0 z-10'"
                                            data-testid="scroll-up"
                                            rdxSelectScrollUpButton
                                        >
                                            Up
                                        </div>
                                    }
                                    <div [class]="listClass" data-testid="list" rdxSelectList>
                                        @for (option of options(); track option.key) {
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
                                    @if (config.geometry?.arrows) {
                                        <div
                                            [class]="s.scrollButton + ' absolute inset-x-0 bottom-0 z-10'"
                                            data-testid="scroll-down"
                                            rdxSelectScrollDownButton
                                        >
                                            Down
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    } @else if (config.name === 'anchor-default') {
                        <div [class]="s.positioner" sideOffset="5" data-testid="positioner" rdxSelectPositioner>
                            <div [class]="s.popup + ' w-48 min-w-48!'" data-testid="popup" rdxSelectPopup>
                                <div [class]="listClass" data-testid="list" rdxSelectList>
                                    @for (option of options(); track option.key) {
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
                                [class]="
                                    (config.dir === 'rtl' ? s.popup + ' w-48 min-w-48!' : s.popup) +
                                    (config.geometry ? ' max-h-[var(--available-height)]' : '')
                                "
                                [closeOnFocusOut]="config.closeOnFocusOut"
                                data-testid="popup"
                                rdxSelectPopup
                            >
                                <div [class]="listClass" data-testid="list" rdxSelectList>
                                    @for (option of options(); track option.key) {
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
        @if (config.geometry?.spacerClass) {
            <div [class]="config.geometry!.spacerClass" aria-hidden="true"></div>
        }
        <div #portalHost [class]="config.geometry?.portalClass ?? 'contents'" data-testid="portal-host"></div>
        @if (config.dynamic) {
            <div class="mt-4 grid w-64 gap-2" aria-label="Option data actions">
                @for (action of optionActions; track action.key) {
                    <button
                        class="border-border rounded border px-2 py-1 text-start text-xs"
                        (click)="mutate(action.key)"
                        type="button"
                    >
                        {{ action.label }} ({{ action.shortcut }})
                    </button>
                }
            </div>
        }
        @if (config.scrollable) {
            <div class="h-[150vh]" aria-hidden="true"></div>
        }
    `
})
class AngularSelectFixture {
    readonly s = demoSelect;
    readonly config = config;
    readonly listClass =
        demoSelect.list +
        (config.name === 'touch-scroll'
            ? ' max-h-48 overflow-y-auto'
            : config.geometry
              ? ' min-h-0 overflow-y-auto'
              : '');
    readonly options = signal(config.options);
    readonly optionActions = optionActions;
    readonly trace = installProbe('angular', this.config);
    readonly label = (value: ItemValue) => itemLabel(value, this.options());
    readonly key = itemKey;
    readonly equalByKey = (a: ItemValue, b: ItemValue) => itemKey(a) === itemKey(b);
    private readonly root = viewChild.required(RdxSelectRoot);

    constructor() {
        afterNextRender(() => {
            this.trace.probe.close = () => {
                this.root().close();
            };
            this.trace.probe.unmount = () => this.root().unmount();
        });
    }

    mutate(action: OptionAction) {
        const next = changeOptions(this.options(), action);
        this.trace.observeOptions(next);
        this.options.set(next);
    }
    onCommand(event: KeyboardEvent) {
        const action = this.config.dynamic && optionActions.find((action) => action.shortcut === event.key);
        if (!action) return;
        event.preventDefault();
        this.mutate(action.key);
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
        if (
            this.config.name === 'cancel-value' ||
            this.config.name === 'typeahead-cancel-value' ||
            this.config.name === 'dynamic-cancel-value'
        )
            eventDetails.cancel();
        this.trace.value(value, eventDetails.reason, eventDetails.isCanceled(), eventDetails.event);
    }
}

void bootstrapApplication(AngularSelectFixture, { providers: [provideZonelessChangeDetection()] });
