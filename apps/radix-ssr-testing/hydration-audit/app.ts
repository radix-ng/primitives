import { isPlatformBrowser } from '@angular/common';
import {
    Component,
    computed,
    Directive,
    ErrorHandler,
    inject,
    Injectable,
    InjectionToken,
    input,
    PLATFORM_ID,
    signal
} from '@angular/core';
import {
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionPanelDirective,
    RdxAccordionPanelPresenceDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';
import { injectId } from '@radix-ng/primitives/core';
import {
    createRdxDialogHandle,
    type RdxDialogOpenChange,
    RdxDialogPopup,
    RdxDialogPortal,
    RdxDialogRoot,
    RdxDialogTitle,
    RdxDialogTrigger
} from '@radix-ng/primitives/dialog';
import {
    RdxMenuItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuTrigger
} from '@radix-ng/primitives/menu';
import {
    RdxPopoverPopup,
    RdxPopoverPortal,
    RdxPopoverPositioner,
    RdxPopoverRoot,
    RdxPopoverTrigger
} from '@radix-ng/primitives/popover';
import { RdxPortal, RdxPortalContainer, RdxPortalPresence } from '@radix-ng/primitives/portal';
import { provideRdxPresenceContext } from '@radix-ng/primitives/presence';
import {
    RdxSelectItem,
    RdxSelectItemText,
    RdxSelectList,
    RdxSelectPopup,
    RdxSelectPortal,
    RdxSelectPositioner,
    RdxSelectRoot,
    RdxSelectTrigger
} from '@radix-ng/primitives/select';
import { RdxTabsList, RdxTabsPanel, RdxTabsPanelPresence, RdxTabsRoot, RdxTabsTab } from '@radix-ng/primitives/tabs';
import LabelPage from '../src/app/components/label/page';
import ToastPage from '../src/app/components/toast/page';
import { CheckboxAuditView } from './checkbox-view';
import { FieldAuditView } from './field-view';
import { LazyPortalView } from './lazy-view';
import { MeterAuditView } from './meter-view';
import { ProgressAuditView } from './progress-view';
import { RadioAuditView } from './radio-view';
import { SeparatorAuditView } from './separator-view';
import { AuditProbe, Settings } from './settings';
import { SliderAuditView } from './slider-view';
import { TooltipAuditView } from './tooltip-view';

export const SETTINGS = new InjectionToken<Settings>('Portal hydration audit settings');
export const PROBE = new InjectionToken<AuditProbe>('Portal hydration audit observations');

@Injectable()
export class AuditErrors implements ErrorHandler {
    private readonly probe = inject(PROBE);
    handleError(error: unknown) {
        this.probe.errors.push(error instanceof Error ? (error.stack ?? error.message) : String(error));
    }
}

@Injectable({ providedIn: 'root' })
export class AuditState {
    readonly settings = inject(SETTINGS);
    readonly first = signal(false);
    readonly second = signal(false);
    readonly present = signal(true);
    readonly visible = signal(true);
    readonly extra = signal(false);
    readonly destination = signal<RdxPortalContainer | null | undefined>(
        this.settings.placement === 'pending'
            ? null
            : this.settings.placement === 'destination'
              ? '#audit-destination'
              : undefined
    );
}

@Directive({
    selector: 'ng-template[auditPortal]',
    hostDirectives: [{ directive: RdxPortalPresence, inputs: ['container'] }]
})
export class AuditPortal {}

@Component({
    selector: 'audit-probe',
    host: {
        '[attr.data-probe]': 'name()',
        '[attr.data-client]': 'browser ? "" : undefined'
    },
    template: `
        <label [attr.for]="id()">Field {{ name() }}</label>
        <input [id]="id()" value="initial" />
        <button (click)="clicks.update(increment)" type="button">Increment {{ name() }}</button>
        <output>{{ clicks() }}</output>
    `
})
export class HydrationProbe {
    readonly name = input.required<string>();
    private readonly generatedId = injectId('audit-field-');
    private readonly authoredIds = inject(SETTINGS).authoredIds;
    readonly id = computed(() => (this.authoredIds ? 'authored-field-' + this.name() : this.generatedId));
    readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
    readonly clicks = signal(0);
    readonly increment = (value: number) => value + 1;
    constructor() {
        inject(PROBE).constructed.push(this.generatedId);
    }
}

@Component({
    selector: 'audit-portal-view',
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionHeaderDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective,
        RdxAccordionPanelPresenceDirective,
        RdxDialogRoot,
        RdxDialogTrigger,
        RdxDialogPortal,
        RdxDialogPopup,
        RdxDialogTitle,
        RdxMenuRoot,
        RdxMenuTrigger,
        RdxMenuPortal,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuItem,
        RdxSelectRoot,
        RdxSelectTrigger,
        RdxSelectPortal,
        RdxSelectPositioner,
        RdxSelectPopup,
        RdxSelectList,
        RdxSelectItem,
        RdxSelectItemText,
        RdxTabsRoot,
        RdxTabsList,
        RdxTabsTab,
        RdxTabsPanel,
        RdxTabsPanelPresence,
        RdxPortal,
        AuditPortal,
        HydrationProbe,
        RadioAuditView,
        LabelPage,
        FieldAuditView,
        ProgressAuditView,
        MeterAuditView,
        SeparatorAuditView,
        SliderAuditView,
        TooltipAuditView,
        ToastPage,
        RdxPopoverRoot,
        RdxPopoverTrigger,
        RdxPopoverPortal,
        RdxPopoverPositioner,
        RdxPopoverPopup
    ],
    template: `
        @switch (state.settings.kind) {
            @case ('radio') {
                <audit-radio-view />
            }
            @case ('label') {
                <app-label />
            }
            @case ('field') {
                <audit-field-view />
            }
            @case ('progress') {
                <audit-progress-view />
            }
            @case ('meter') {
                <audit-meter-view />
            }
            @case ('separator') {
                <audit-separator-view />
            }
            @case ('slider') {
                <audit-slider-view />
            }
            @case ('tooltip') {
                <audit-tooltip-view [late]="state.settings.name === 'detached-tooltip'" />
            }
            @case ('toast') {
                <app-toast />
            }
            @case ('accordion') {
                <section [attr.data-widget]="name()">
                    <div [defaultValue]="['one']" [keepMounted]="state.settings.retain ?? false" rdxAccordionRoot>
                        <div rdxAccordionItem value="one">
                            <h3 rdxAccordionHeader>
                                <button rdxAccordionTrigger>Accordion {{ name() }}</button>
                            </h3>
                            <div class="audit-accordion-panel" *rdxAccordionPanelPresence rdxAccordionPanel>
                                <audit-probe [name]="name()" />
                            </div>
                        </div>
                    </div>
                </section>
            }
            @case ('menu') {
                <section [attr.data-widget]="name()">
                    <ng-container [open]="true" [modal]="false" (onOpenChange)="keepOpen($event)" rdxMenuRoot>
                        <button rdxMenuTrigger>Menu {{ name() }}</button>
                        <ng-template [container]="state.destination()" rdxMenuPortal>
                            <div rdxMenuPositioner>
                                <div [attr.data-widget]="name()" rdxMenuPopup>
                                    <button rdxMenuItem>Action</button>
                                    <audit-probe [name]="name()" />
                                </div>
                            </div>
                        </ng-template>
                    </ng-container>
                </section>
            }
            @case ('select') {
                <section [attr.data-widget]="name()">
                    <ng-container [open]="true" [modal]="false" (onOpenChange)="keepOpen($event)" rdxSelectRoot>
                        <button rdxSelectTrigger aria-label="Hydration select">Select {{ name() }}</button>
                        <ng-template [container]="state.destination()" rdxSelectPortal>
                            <div rdxSelectPositioner>
                                <div [attr.data-widget]="name()" rdxSelectPopup>
                                    <div rdxSelectList>
                                        <div rdxSelectItem value="one"><span rdxSelectItemText>One</span></div>
                                    </div>
                                    <audit-probe [name]="name()" />
                                </div>
                            </div>
                        </ng-template>
                    </ng-container>
                </section>
            }
            @case ('dialog') {
                <section [attr.data-widget]="name()">
                    <ng-container [open]="true" [modal]="false" (onOpenChange)="keepOpen($event)" rdxDialogRoot>
                        <button rdxDialogTrigger>Dialog {{ name() }}</button>
                        <ng-template [container]="state.destination()" rdxDialogPortal>
                            <div [attr.data-widget]="name()" rdxDialogPopup>
                                <h2 rdxDialogTitle>Hydration dialog</h2>
                                <audit-probe [name]="name()" />
                            </div>
                        </ng-template>
                    </ng-container>
                </section>
            }
            @case ('tabs') {
                <section [attr.data-widget]="name()">
                    <div rdxTabsRoot value="one">
                        <div rdxTabsList aria-label="Hydration tabs">
                            <button rdxTabsTab value="one">One</button>
                            <button rdxTabsTab value="two">Two</button>
                        </div>
                        <div *rdxTabsPanelPresence="'one'" rdxTabsPanel><audit-probe [name]="name()" /></div>
                    </div>
                </section>
            }
            @case ('popover-container') {
                <section [attr.data-widget]="name()">
                    <ng-container [open]="true" [modal]="false" (onOpenChange)="keepOpen($event)" rdxPopoverRoot>
                        <button rdxPopoverTrigger type="button">Anchor {{ name() }}</button>
                        <ng-template [container]="state.destination()" rdxPopoverPortal>
                            <div rdxPopoverPositioner>
                                <div [initialFocus]="false" rdxPopoverPopup>
                                    <audit-probe [name]="name()" />
                                </div>
                            </div>
                        </ng-template>
                    </ng-container>
                </section>
            }
            @case ('popover') {
                <div
                    [open]="state.settings.placement !== 'closed'"
                    [modal]="false"
                    [attr.data-widget]="name()"
                    (onOpenChange)="keepOpen($event)"
                    rdxPopoverRoot
                >
                    <button rdxPopoverTrigger type="button">Anchor {{ name() }}</button>
                    <ng-template [container]="state.destination()" rdxPopoverPortal>
                        <div rdxPopoverPositioner>
                            <div [initialFocus]="false" rdxPopoverPopup>
                                <audit-probe [name]="name()" />
                            </div>
                        </div>
                    </ng-template>
                </div>
            }
            @case ('attribute') {
                <section [container]="state.destination()" rdxPortal data-portal-host>
                    <audit-probe [name]="name()" />
                </section>
            }
            @case ('structural') {
                <ng-template [container]="state.destination()" auditPortal>
                    <audit-probe [name]="name()" />
                    <span [attr.data-portal-sibling]="name()">Second template root</span>
                </ng-template>
            }
            @default {
                <audit-probe [name]="name()" />
            }
        }
    `
})
export class PortalView {
    readonly state = inject(AuditState);
    readonly name = input.required<string>();
    keepOpen(change: { open: boolean; eventDetails: { cancel(): void } }) {
        // Keep native outside focus/press interactions from closing an audit fixture while its
        // application controls trigger another island. This uses the public cancellation API.
        if (!change.open) change.eventDetails.cancel();
    }
}

@Component({
    selector: 'audit-detached-dialog',
    imports: [RdxDialogRoot, RdxDialogPortal, RdxDialogPopup, RdxDialogTitle, RdxDialogTrigger],
    host: {
        '[attr.data-dialog-open]': 'handle.isOpen()',
        '[attr.data-dialog-changes]': 'changes().join(",")'
    },
    template: `
        <div
            [handle]="handle"
            (onOpenChange)="recordChange($event)"
            defaultOpen
            defaultTriggerId="audit-detached-trigger"
            rdxDialogRoot
        >
            <ng-template rdxDialogPortal>
                <div rdxDialogPopup data-detached-dialog-popup>
                    <h2 rdxDialogTitle>Detached hydration dialog</h2>
                    <button (click)="handle.close()" type="button" data-close-detached-dialog>Close via handle</button>
                </div>
            </ng-template>
        </div>
        @defer (hydrate when state.first()) {
            <button
                id="audit-detached-trigger"
                [handle]="handle"
                [attr.data-client]="browser ? '' : undefined"
                rdxDialogTrigger
                data-detached-dialog-trigger
            >
                Open detached dialog
            </button>
        }
    `
})
export class DetachedDialogView {
    readonly state = inject(AuditState);
    readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
    readonly handle = createRdxDialogHandle();
    readonly changes = signal<string[]>([]);

    recordChange(change: RdxDialogOpenChange): void {
        this.changes.update((changes) => [...changes, `${change.open}:${change.reason}`]);
    }
}

@Component({
    selector: 'portal-hydration-audit',
    imports: [
        CheckboxAuditView,
        RdxPortal,
        AuditPortal,
        PortalView,
        HydrationProbe,
        LazyPortalView,
        DetachedDialogView
    ],
    providers: [provideRdxPresenceContext(() => ({ present: inject(AuditState).present }))],
    template: `
        <nav [attr.data-extra]="state.extra()" aria-label="Hydration audit controls">
            <button (click)="state.first.set(true)" type="button" data-hydrate-first>Hydrate first</button>
            <button (click)="state.second.set(true)" type="button" data-hydrate-second>Hydrate second</button>
            <button (click)="state.extra.set(true)" type="button" data-add-client>Add client content</button>
            <button (click)="state.present.set(false)" type="button" data-close>Close portal</button>
            <button (click)="state.visible.set(false)" type="button" data-dispose>Dispose portal owner</button>
            <button (click)="state.destination.set(undefined)" type="button" data-resolve>Resolve destination</button>
            <button (click)="state.destination.set('#audit-external-destination')" type="button" data-retarget>
                Change destination
            </button>
        </nav>
        @switch (state.settings.placement) {
            @case ('checkbox-reverse') {
                @defer (hydrate on interaction) {
                    <audit-checkbox-view name="first" />
                }
                @defer (hydrate on interaction) {
                    <audit-checkbox-view name="second" />
                }
            }
            @case ('detached-trigger') {
                <audit-detached-dialog />
            }
            @case ('pending-lazy-dispose') {
                @if (state.visible()) {
                    <ng-template [container]="state.destination()" auditPortal>
                        @defer (hydrate when state.first()) {
                            <audit-lazy-portal-view />
                        }
                    </ng-template>
                }
            }
            @case ('pending-lazy-if-close') {
                @if (state.present()) {
                    @defer (hydrate when state.first()) {
                        <audit-lazy-portal-view />
                    }
                }
            }
            @case ('pending-lazy-close') {
                <ng-template [container]="state.destination()" auditPortal>
                    @defer (hydrate when state.first()) {
                        <audit-lazy-portal-view />
                    }
                </ng-template>
            }
            @case ('pending-lazy-retarget') {
                <ng-template [container]="state.destination()" auditPortal>
                    @defer (hydrate when state.first()) {
                        <audit-lazy-portal-view />
                    }
                </ng-template>
            }
            @case ('outside') {
                @defer (hydrate when state.first()) {
                    <audit-portal-view name="first" />
                } @placeholder {
                    <p data-placeholder>Waiting for content</p>
                }
            }
            @case ('interaction') {
                @defer (hydrate on interaction) {
                    <audit-portal-view name="first" />
                } @placeholder {
                    <p data-placeholder>Waiting for content</p>
                }
            }
            @case ('lazy') {
                @defer (hydrate when state.first()) {
                    <audit-lazy-portal-view />
                } @placeholder {
                    <p data-placeholder>Waiting for lazy component</p>
                }
            }
            @case ('inside') {
                @if (state.settings.kind === 'attribute') {
                    <section [container]="state.destination()" rdxPortal data-portal-host>
                        @defer (hydrate when state.first()) {
                            <audit-probe name="first" />
                        } @placeholder {
                            <p data-placeholder>Waiting for content</p>
                        }
                    </section>
                } @else {
                    <ng-template [container]="state.destination()" auditPortal>
                        @defer (hydrate when state.first()) {
                            <audit-probe name="first" />
                        } @placeholder {
                            <p data-placeholder>Waiting for content</p>
                        }
                        <span data-portal-sibling="first">Second template root</span>
                    </ng-template>
                }
            }
            @case ('inside-wrapped') {
                <ng-template [container]="state.destination()" auditPortal>
                    <section data-native-root-boundary>
                        @defer (hydrate when state.first()) {
                            <audit-probe name="first" />
                        }
                    </section>
                </ng-template>
            }
            @case ('inside-interaction') {
                @if (state.settings.kind === 'attribute') {
                    <section [container]="state.destination()" rdxPortal data-portal-host>
                        @defer (hydrate on interaction) {
                            <audit-probe name="first" />
                        }
                    </section>
                } @else {
                    <ng-template [container]="state.destination()" auditPortal>
                        @defer (hydrate on interaction) {
                            <audit-probe name="first" />
                        }
                    </ng-template>
                }
            }
            @case ('inside-client') {
                @if (state.settings.kind === 'attribute') {
                    <section [container]="state.destination()" rdxPortal data-portal-host>
                        @defer (when state.first()) {
                            <audit-probe name="first" />
                        } @placeholder {
                            <p data-placeholder>Waiting for content</p>
                        }
                    </section>
                } @else {
                    <ng-template [container]="state.destination()" auditPortal>
                        @defer (when state.first()) {
                            <audit-probe name="first" />
                        } @placeholder {
                            <p data-placeholder>Waiting for content</p>
                        }
                    </ng-template>
                }
            }
            @case ('client') {
                @defer (when state.first()) {
                    <audit-portal-view name="first" />
                } @placeholder {
                    <p data-placeholder>Waiting for content</p>
                }
            }
            @case ('reverse') {
                @defer (hydrate when state.first()) {
                    <audit-portal-view name="first" />
                }
                @defer (hydrate when state.second()) {
                    <audit-portal-view name="second" />
                }
            }
            @case ('client-before-islands') {
                @if (state.extra()) {
                    <audit-portal-view name="client" />
                }
                @defer (hydrate when state.first()) {
                    <audit-portal-view name="first" />
                }
                @defer (hydrate when state.second()) {
                    <audit-portal-view name="second" />
                }
            }
            @case ('destination') {
                <audit-portal-view name="first" />
                @defer (hydrate when state.first()) {
                    <div id="audit-destination"><audit-probe name="destination" /></div>
                }
            }
            @default {
                <audit-portal-view name="first" />
            }
        }
        <span data-ssr-end>End of server view</span>
    `
})
export class PortalHydrationAudit {
    readonly state = inject(AuditState);
}
