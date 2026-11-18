import '@angular/compiler';
import { afterNextRender, Component, provideZonelessChangeDetection, signal, viewChild } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
    RdxDialogBackdrop,
    RdxDialogClose,
    RdxDialogDescription,
    RdxDialogPopup,
    RdxDialogPortal,
    RdxDialogPortalMisuseGuard,
    RdxDialogRoot,
    RdxDialogTitle,
    RdxDialogTrigger,
    RdxDialogViewport
} from '@radix-ng/primitives/dialog';
import {
    RdxPopoverArrow,
    RdxPopoverBackdrop,
    RdxPopoverClose,
    RdxPopoverDescription,
    RdxPopoverPopup,
    RdxPopoverPortal,
    RdxPopoverPortalMisuseGuard,
    RdxPopoverPositioner,
    RdxPopoverRoot,
    RdxPopoverTitle,
    RdxPopoverTrigger,
    RdxPopoverViewport
} from '@radix-ng/primitives/popover';
import {
    RdxSelectArrow,
    RdxSelectBackdrop,
    RdxSelectGroup,
    RdxSelectGroupLabel,
    RdxSelectIcon,
    RdxSelectItem,
    RdxSelectItemAlignedPosition,
    RdxSelectItemAlignedPositionContent,
    RdxSelectItemIndicator,
    RdxSelectItemText,
    RdxSelectLabel,
    RdxSelectList,
    RdxSelectOpenChangeEvent,
    RdxSelectPopup,
    RdxSelectPortal,
    RdxSelectPortalMisuseGuard,
    RdxSelectPositioner,
    RdxSelectRoot,
    RdxSelectScrollDownButton,
    RdxSelectScrollUpButton,
    RdxSelectSeparator,
    RdxSelectTrigger,
    RdxSelectValue,
    RdxSelectValueChangeEvent
} from '@radix-ng/primitives/select';

import { RdxDirectionProvider } from '@radix-ng/primitives/direction-provider';

import '../../../../radix-storybook/.storybook/main.css';
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
import { anchoredHeightClass } from './geometry';
import { liveCommands, liveFormClass, liveHeightClass, liveItemClass, type LiveState } from './live';
import { shellStyles } from './nested';

const config = fixtureConfig();
document.documentElement.dir = config.dir;

@Component({
    selector: 'parity-select-content',
    host: {
        '(document:keydown)': 'onCommand($event)',
        '[class]': 'config.geometry?.shellClass',
        'data-testid': 'scroller'
    },
    imports: [
        RdxSelectRoot,
        RdxSelectPortal,
        RdxSelectPortalMisuseGuard,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPopup,
        RdxSelectArrow,
        RdxSelectList,
        RdxSelectLabel,
        RdxSelectItemIndicator,
        RdxSelectItem,
        RdxSelectItemText,
        RdxSelectGroupLabel,
        RdxSelectGroup,
        RdxSelectPositioner,
        RdxSelectItemAlignedPosition,
        RdxSelectItemAlignedPositionContent,
        RdxSelectScrollUpButton,
        RdxSelectScrollDownButton,
        RdxSelectIcon,
        RdxSelectSeparator,
        RdxSelectBackdrop,
        RdxDirectionProvider
    ],
    template: `
        <form
            [class]="(config.geometry?.formClass ?? 'grid w-64 gap-3') + liveFormClass(live())"
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
                <button
                    class="demo-select-trigger data-[placeholder]:text-muted-foreground data-[invalid]:border-destructive data-[invalid]:aria-invalid:ring-destructive/30 demo-focus inline-flex min-h-9 items-center justify-between gap-2 px-3 py-1.5 disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                    data-testid="trigger"
                    rdxSelectTrigger
                >
                    <span #display="rdxSelectedValue" data-testid="value" rdxSelectValue placeholder="Choose a fruit">
                        {{ display.slotText() }}
                    </span>
                </button>
                <ng-template
                    [container]="config.geometry?.customPortal || config.nested?.customPortal ? portalHost : undefined"
                    [keepMounted]="config.geometry?.retained ?? false"
                    rdxSelectPortal
                >
                    @if (config.aligned) {
                        <div
                            class="pointer-events-auto z-[100]"
                            [disableAnchorTracking]="config.geometry?.disableAnchorTracking"
                            align="start"
                            sideOffset="5"
                            data-testid="positioner"
                            rdxSelectItemAlignedPosition
                        >
                            <div
                                [class]="config.geometry ? 'min-h-0 flex-1' + anchoredHeightClass : ''"
                                [closeOnFocusOut]="config.closeOnFocusOut"
                                data-testid="popup"
                                rdxSelectPopup
                            >
                                <div
                                    class="demo-select-popup min-w-[var(--anchor-width,10rem)] will-change-[opacity,transform]"
                                    [class]="
                                        [
                                            liveHeightClass(live()),
                                            config.geometry
                                                ? 'min-h-0 flex-1 overflow-hidden' + config.geometry.heightClass
                                                : ''
                                        ].join(' ')
                                    "
                                    rdxSelectItemAlignedPositionContent
                                >
                                    @if (config.geometry?.arrows) {
                                        <div
                                            class="demo-select-scroll-button absolute inset-x-0 top-0 z-10 flex h-7 items-center justify-center"
                                            data-testid="scroll-up"
                                            rdxSelectScrollUpButton
                                        >
                                            Up
                                        </div>
                                    }
                                    <div [class]="listClass" data-testid="list" rdxSelectList>
                                        @for (option of options(); track option.key) {
                                            <div
                                                class="demo-select-item data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[disabled]:text-muted-foreground relative flex min-h-7 items-center gap-2 ps-6 pe-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                                [class]="liveItemClass(live())"
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
                                            class="demo-select-scroll-button absolute inset-x-0 bottom-0 z-10 flex h-7 items-center justify-center"
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
                        <div class="z-[100]" sideOffset="5" data-testid="positioner" rdxSelectPositioner>
                            <div
                                class="demo-select-popup w-48 min-w-48! min-w-[var(--anchor-width,10rem)] will-change-[opacity,transform]"
                                data-testid="popup"
                                rdxSelectPopup
                            >
                                <div [class]="listClass" data-testid="list" rdxSelectList>
                                    @for (option of options(); track option.key) {
                                        <div
                                            class="demo-select-item data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[disabled]:text-muted-foreground relative flex min-h-7 items-center gap-2 ps-6 pe-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
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
                            class="z-[100]"
                            [disableAnchorTracking]="config.geometry?.disableAnchorTracking"
                            sideOffset="5"
                            align="start"
                            data-testid="positioner"
                            rdxSelectPositioner
                        >
                            <div
                                [class]="
                                    (config.dir === 'rtl'
                                        ? 'demo-select-popup min-w-[var(--anchor-width,10rem)] will-change-[opacity,transform]' +
                                          ' w-48 min-w-48!'
                                        : 'demo-select-popup min-w-[var(--anchor-width,10rem)] will-change-[opacity,transform]') +
                                    liveHeightClass(live()) +
                                    (config.geometry ? anchoredHeightClass : '')
                                "
                                [closeOnFocusOut]="config.closeOnFocusOut"
                                data-testid="popup"
                                rdxSelectPopup
                            >
                                <div [class]="listClass" data-testid="list" rdxSelectList>
                                    @for (option of options(); track option.key) {
                                        <div
                                            class="demo-select-item data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[disabled]:text-muted-foreground relative flex min-h-7 items-center gap-2 ps-6 pe-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                            [class]="liveItemClass(live())"
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
    readonly anchoredHeightClass = anchoredHeightClass;
    readonly config = config;
    readonly listClass =
        'p-1' +
        (config.name === 'touch-scroll'
            ? ' max-h-48 overflow-y-auto'
            : config.geometry
              ? ' min-h-0 overflow-y-auto'
              : '');
    readonly options = signal(config.options);
    readonly live = signal<LiveState>({});
    readonly liveFormClass = liveFormClass;
    readonly liveItemClass = liveItemClass;
    readonly liveHeightClass = liveHeightClass;
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
        const command = this.config.name.startsWith('live-') && liveCommands.find((c) => c.shortcut === event.key);
        if (command) {
            event.preventDefault();
            this.live.update((state) => ({ ...state, [command.key]: !state[command.key] }));
            if (command.key === 'renamed') {
                this.options.set(
                    this.config.options.map((o) => ({ ...o, label: o.label + (this.live().renamed ? ' renamed' : '') }))
                );
            }
            return;
        }
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

@Component({
    selector: 'parity-select',
    imports: [
        AngularSelectFixture,
        RdxDialogRoot,
        RdxDialogTrigger,
        RdxDialogPortal,
        RdxDialogPortalMisuseGuard,
        RdxDialogBackdrop,
        RdxDialogViewport,
        RdxDialogPopup,
        RdxDialogTitle,
        RdxDialogDescription,
        RdxDialogClose,
        RdxPopoverRoot,
        RdxPopoverTrigger,
        RdxPopoverPortal,
        RdxPopoverPortalMisuseGuard,
        RdxPopoverBackdrop,
        RdxPopoverPositioner,
        RdxPopoverPopup,
        RdxPopoverArrow,
        RdxPopoverTitle,
        RdxPopoverDescription,
        RdxPopoverClose,
        RdxPopoverViewport
    ],
    template: `
        @switch (config.nested?.kind) {
            @case ('dialog') {
                <div class="min-h-[180vh]">
                    <ng-container rdxDialogRoot>
                        <button [class]="s.trigger" data-testid="shell-trigger" rdxDialogTrigger>Open container</button>
                        <ng-template rdxDialogPortal>
                            <div class="fixed inset-0 z-30" rdxDialogBackdrop></div>
                            <div [class]="s.dialog" data-testid="shell-popup" rdxDialogPopup>
                                <h2 rdxDialogTitle>Nested Select</h2>
                                <p rdxDialogDescription>Choose a fruit and continue.</p>
                                <parity-select-content />
                                <button [class]="s.trigger" data-testid="shell-close" rdxDialogClose>
                                    Close container
                                </button>
                            </div>
                        </ng-template>
                    </ng-container>
                </div>
            }
            @case ('popover') {
                <div class="min-h-[180vh]">
                    <ng-container rdxPopoverRoot>
                        <button [class]="s.trigger" data-testid="shell-trigger" rdxPopoverTrigger>
                            Open container
                        </button>
                        <ng-template rdxPopoverPortal>
                            <div class="z-40" sideOffset="5" align="start" rdxPopoverPositioner>
                                <div [class]="s.popover" data-testid="shell-popup" rdxPopoverPopup>
                                    <h2 rdxPopoverTitle>Nested Select</h2>
                                    <p rdxPopoverDescription>Choose a fruit and continue.</p>
                                    <parity-select-content />
                                    <button [class]="s.trigger" data-testid="shell-close" rdxPopoverClose>
                                        Close container
                                    </button>
                                </div>
                            </div>
                        </ng-template>
                    </ng-container>
                </div>
            }
            @default {
                <parity-select-content />
            }
        }
    `
})
class AngularSelectShell {
    readonly config = config;
    readonly s = shellStyles;
}
void bootstrapApplication(AngularSelectShell, { providers: [provideZonelessChangeDetection()] });
