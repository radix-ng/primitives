// `@angular/platform-server` ships partially-compiled code; load the compiler so JIT is available
// as a fallback in the test environment (otherwise PlatformLocation fails to compile).
import '@angular/compiler';
import { Component, provideZonelessChangeDetection, Type } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { bootstrapApplication, BootstrapContext, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import {
    RdxAccordionItemDirective,
    RdxAccordionPanelDirective,
    RdxAccordionPanelPresenceDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';
import { RdxAutocompleteInput, RdxAutocompleteRoot } from '@radix-ng/primitives/autocomplete';
import {
    RdxCheckboxButtonDirective,
    RdxCheckboxGroupDirective,
    RdxCheckboxIndicatorDirective,
    RdxCheckboxIndicatorPresenceDirective,
    RdxCheckboxInputDirective,
    RdxCheckboxRootDirective
} from '@radix-ng/primitives/checkbox';
import { RdxFieldDescription, RdxFieldItem, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import {
    RdxMenuGroup,
    RdxMenuGroupLabel,
    RdxMenuPortal,
    RdxMenuRadioGroup,
    RdxMenuRoot
} from '@radix-ng/primitives/menu';
import { RdxNumberFieldHiddenInput, RdxNumberFieldInput, RdxNumberFieldRoot } from '@radix-ng/primitives/number-field';
import { RdxPortal } from '@radix-ng/primitives/portal';
import {
    RdxRadioGroupDirective,
    RdxRadioIndicatorDirective,
    RdxRadioIndicatorPresenceDirective,
    RdxRadioItemDirective,
    RdxRadioItemInputDirective
} from '@radix-ng/primitives/radio';
import { _importsSelect, RdxSelectLabel, RdxSelectRoot, RdxSelectTrigger } from '@radix-ng/primitives/select';
import { RdxSwitchInput, RdxSwitchRoot, RdxSwitchThumb } from '@radix-ng/primitives/switch';
import { RdxTabsList, RdxTabsPanel, RdxTabsPanelPresence, RdxTabsRoot, RdxTabsTab } from '@radix-ng/primitives/tabs';
import { RdxToggle } from '@radix-ng/primitives/toggle';
import { describe, expect, it, vi } from 'vitest';
import AccordionPage from './app/components/accordion/page';
import AvatarPage from './app/components/avatar/page';
import CheckboxPage from './app/components/checkbox/page';
import CollapsiblePage from './app/components/collapsible/page';
import ComboboxPage from './app/components/combobox/page';
import FormPage from './app/components/form/page';
import LabelPage from './app/components/label/page';
import OtpFieldPage from './app/components/otp-field/page';
import SelectPage from './app/components/select/page';
import SeparatorPage from './app/components/separator/page';
import SliderPage from './app/components/slider/page';
import SwitchPage from './app/components/switch/page';
import TabsPage from './app/components/tabs/page';
import ToggleGroupPage from './app/components/toggle-group/page';

/**
 * Server-side rendering smoke tests for the primitives.
 *
 * Each primitive page is rendered through `renderApplication` from `@angular/platform-server` — the
 * same server render path the real SSR app uses. The render runs with `provideClientHydration()` so
 * the hydration-serialization path is exercised too.
 *
 * The headline guarantee these specs protect: **server rendering must not throw**. That is what would
 * regress if a primitive started touching `window` / `document` at render time instead of inside a
 * browser-only hook (`afterNextRender`) or an interaction handler. We also assert that the primitive's
 * visible content actually made it into the server HTML.
 */
interface SsrCase {
    /** The component's host selector (must match the element in the render document). */
    readonly selector: string;
    /** The standalone page component to render. */
    readonly component: Type<unknown>;
    /** Substrings that must appear in the server-rendered HTML (visible text the primitive renders). */
    readonly expects: readonly string[];
}

const cases: readonly SsrCase[] = [
    { selector: 'app-accordion', component: AccordionPage, expects: ['One', 'Four'] },
    { selector: 'app-avatar', component: AvatarPage, expects: ['A'] },
    { selector: 'app-checkbox', component: CheckboxPage, expects: ['data-checked'] },
    // Combobox's popup is portal + presence gated, so on the server (closed) only the input/trigger
    // render — assert the input placeholder and the combobox role.
    { selector: 'app-combobox', component: ComboboxPage, expects: ['Pick a fruit', 'role="combobox"'] },
    { selector: 'app-collapsible', component: CollapsiblePage, expects: ['Trigger', 'Content'] },
    // Form + Field render server-side with the external error already mapped onto the named field.
    { selector: 'app-form', component: FormPage, expects: ['novalidate', 'Email is already taken'] },
    { selector: 'app-label', component: LabelPage, expects: ['Label'] },
    {
        selector: 'app-otp-field',
        component: OtpFieldPage,
        expects: ['role="group"', 'id="server-code"', 'Character 4 of 4']
    },
    // Select's overlay is portal + presence gated, so on the server (closed) only the trigger renders —
    // assert the placeholder the value shows when nothing is selected.
    { selector: 'app-select', component: SelectPage, expects: ['Pick a fruit'] },
    { selector: 'app-separator', component: SeparatorPage, expects: ['***'] },
    { selector: 'app-slider', component: SliderPage, expects: ['Minimum', 'Maximum'] },
    { selector: 'app-switch', component: SwitchPage, expects: ['Switch'] },
    { selector: 'app-tabs', component: TabsPage, expects: ['Tab 1', 'Tab 3'] },
    { selector: 'app-toggle-group', component: ToggleGroupPage, expects: ['Item 1', 'Item 2'] }
];

@Component({
    selector: 'app-autocomplete-defaults',
    imports: [RdxAutocompleteRoot, RdxAutocompleteInput],
    template: `
        <div
            #explicit="rdxAutocompleteRoot"
            [value]="''"
            [open]="false"
            defaultValue="Seed"
            defaultOpen
            rdxAutocompleteRoot
        >
            <input rdxAutocompleteInput aria-label="Explicit" />
            <output id="autocomplete-explicit-value">{{ explicit.value() }}</output>
            <output id="autocomplete-explicit-open">{{ explicit.open() }}</output>
        </div>
        <div #initial="rdxAutocompleteRoot" defaultValue="Seed" defaultOpen rdxAutocompleteRoot>
            <input rdxAutocompleteInput aria-label="Defaults" />
            <output id="autocomplete-default-value">{{ initial.value() }}</output>
            <output id="autocomplete-default-open">{{ initial.open() }}</output>
        </div>
    `
})
class AutocompleteDefaultsPage {}

@Component({
    selector: 'app-number-field-defaults',
    imports: [ReactiveFormsModule, RdxNumberFieldRoot, RdxNumberFieldInput, RdxNumberFieldHiddenInput],
    template: `
        <div [formControl]="amount" [defaultValue]="11" name="reactive-amount" rdxNumberFieldRoot>
            <input rdxNumberFieldInput />
            <input rdxNumberFieldHiddenInput />
        </div>
        <div [value]="null" [defaultValue]="11" rdxNumberFieldRoot>
            <input rdxNumberFieldInput />
        </div>
        <div [defaultValue]="11" rdxNumberFieldRoot>
            <input rdxNumberFieldInput />
        </div>
    `
})
class NumberFieldDefaultsPage {
    readonly amount = new FormControl(0, { nonNullable: true });
}

@Component({
    selector: 'app-toggle-defaults',
    imports: [RdxToggle],
    template: `
        <button rdxToggle defaultPressed>Default</button>
        <button [pressed]="false" rdxToggle defaultPressed>Controlled</button>
    `
})
class ToggleDefaultsPage {}

@Component({
    selector: 'app-switch-defaults',
    imports: [
        ReactiveFormsModule,
        RdxFieldRoot,
        RdxFieldLabel,
        RdxFieldDescription,
        RdxSwitchInput,
        RdxSwitchRoot,
        RdxSwitchThumb
    ],
    template: `
        <button id="explicit" [checked]="false" defaultChecked rdxSwitchRoot>
            <span rdxSwitchThumb></span>
        </button>
        <button id="from-form" [formControl]="control" defaultChecked rdxSwitchRoot>
            <span rdxSwitchThumb></span>
        </button>
        <div rdxFieldRoot name="alerts" required>
            <label id="switch-label" rdxFieldLabel>Alerts</label>
            <p id="switch-description" rdxFieldDescription>Sends email updates.</p>
            <button id="from-default" name="fallback" defaultChecked rdxSwitchRoot>
                <span rdxSwitchThumb></span>
                <input rdxSwitchInput />
            </button>
        </div>
    `
})
class SwitchDefaultsPage {
    readonly control = new FormControl(false, { nonNullable: true });
}

@Component({
    selector: 'app-checkbox-defaults',
    imports: [
        ReactiveFormsModule,
        RdxCheckboxButtonDirective,
        RdxCheckboxGroupDirective,
        RdxCheckboxIndicatorDirective,
        RdxCheckboxIndicatorPresenceDirective,
        RdxCheckboxInputDirective,
        RdxCheckboxRootDirective
    ],
    template: `
        <div [formControl]="terms" defaultChecked rdxCheckboxRoot>
            <button rdxCheckboxButton>
                Form
                <span id="unchecked-indicator" *rdxCheckboxIndicatorPresence rdxCheckboxIndicator></span>
            </button>
            <input rdxCheckboxInput />
        </div>
        <div [checked]="false" defaultChecked rdxCheckboxRoot>
            <button rdxCheckboxButton>
                Explicit
                <span
                    id="retained-indicator"
                    *rdxCheckboxIndicatorPresence="{ keepMounted: true }"
                    rdxCheckboxIndicator
                ></span>
            </button>
            <input rdxCheckboxInput />
        </div>
        <div defaultChecked rdxCheckboxRoot>
            <button rdxCheckboxButton>
                Default
                <span id="checked-indicator" *rdxCheckboxIndicatorPresence rdxCheckboxIndicator></span>
            </button>
            <input rdxCheckboxInput />
        </div>
        <div [defaultValue]="['a']" [allValues]="['a']" rdxCheckboxGroup>
            <div rdxCheckboxRoot parent><button rdxCheckboxButton>All</button></div>
            <div rdxCheckboxRoot value="a"><button rdxCheckboxButton>A</button></div>
        </div>
    `
})
class CheckboxDefaultsPage {
    readonly terms = new FormControl(false, { nonNullable: true });
}

@Component({
    selector: 'app-radio-defaults',
    imports: [ReactiveFormsModule, RdxRadioGroupDirective, RdxRadioItemDirective, RdxRadioItemInputDirective],
    template: `
        <div [value]="null" defaultValue="free" rdxRadioRoot name="model-plan">
            <span rdxRadioItem value="free">
                <input rdxRadioItemInput />
                Free
            </span>
        </div>
        <div [formControl]="plan" defaultValue="free" rdxRadioRoot name="form-plan">
            <span rdxRadioItem value="free">
                <input rdxRadioItemInput />
                Free
            </span>
        </div>
        <div defaultValue="free" rdxRadioRoot name="default-plan">
            <span rdxRadioItem value="free">
                <input rdxRadioItemInput />
                Free
            </span>
        </div>
        <div [value]="null" controlledValue="free" rdxRadioRoot name="parent-plan">
            <span rdxRadioItem value="free">
                <input rdxRadioItemInput />
                Free
            </span>
        </div>
    `
})
class RadioDefaultsPage {
    readonly plan = new FormControl<string | null>(null);
}

@Component({
    selector: 'app-radio-field',
    imports: [
        RdxFieldDescription,
        RdxFieldItem,
        RdxFieldLabel,
        RdxFieldRoot,
        RdxRadioGroupDirective,
        RdxRadioIndicatorDirective,
        RdxRadioIndicatorPresenceDirective,
        RdxRadioItemDirective,
        RdxRadioItemInputDirective
    ],
    template: `
        <div rdxFieldRoot name="plan">
            <span id="plan-label" rdxFieldLabel>Plan</span>
            <p id="plan-description" rdxFieldDescription>Select a plan.</p>
            <div rdxRadioRoot defaultValue="free">
                <div rdxFieldItem>
                    <span id="plan-free" rdxRadioItem value="free">
                        <span id="selected-indicator" *rdxRadioIndicatorPresence rdxRadioIndicator></span>
                        <input rdxRadioItemInput />
                    </span>
                    <label id="plan-free-label" rdxFieldLabel>Free</label>
                </div>
                <button rdxRadioItem value="basic">
                    Basic
                    <span id="inactive-indicator" *rdxRadioIndicatorPresence rdxRadioIndicator></span>
                </button>
                <button rdxRadioItem value="pro">
                    Pro
                    <span
                        id="retained-indicator"
                        *rdxRadioIndicatorPresence="{ keepMounted: true }"
                        rdxRadioIndicator
                    ></span>
                </button>
            </div>
        </div>
    `
})
class RadioFieldPage {}

@Component({
    selector: 'app-native-select',
    imports: [RdxSelectRoot],
    template: `
        <form>
            <ng-container [value]="'apple'" [inputRef]="captureInput" name="fruit" autoComplete="off" rdxSelectRoot />
        </form>
    `
})
class NativeSelectPage {
    readonly captureInput = () => {
        throw new Error('A native input ref must not run during server rendering.');
    };
}

@Component({
    selector: 'app-menu-defaults',
    imports: [RdxMenuRoot, RdxMenuRadioGroup],
    template: `
        <div #explicit="rdxMenuRoot" [open]="false" [defaultOpen]="true" rdxMenuRoot>
            <output id="explicit-open">{{ explicit.open() }}</output>
        </div>
        <div #initial="rdxMenuRoot" [defaultOpen]="true" rdxMenuRoot>
            <output id="default-open">{{ initial.open() }}</output>
        </div>
        <div #group="rdxMenuRadioGroup" value="two" defaultValue="one" rdxMenuRadioGroup>
            <output id="explicit-radio">{{ group.value() }}</output>
        </div>
        <div #fallback="rdxMenuRadioGroup" defaultValue="one" rdxMenuRadioGroup>
            <output id="default-radio">{{ fallback.value() }}</output>
        </div>
    `
})
class MenuDefaultsPage {}

@Component({
    selector: 'app-portal-targets',
    imports: [RdxPortal, RdxMenuRoot, RdxMenuPortal],
    template: `
        <div id="server-target" #target></div>
        <div id="server-origin">
            <span id="server-attribute" [container]="target" rdxPortal>Attribute</span>
            <ng-container [defaultOpen]="true" rdxMenuRoot>
                <ng-template [container]="target" rdxMenuPortal>
                    <section id="server-structural">Structural</section>
                </ng-template>
            </ng-container>
        </div>
    `
})
class PortalTargetsPage {}

@Component({
    selector: 'app-pending-menu',
    imports: [RdxMenuRoot, RdxMenuPortal, RdxMenuGroup, RdxMenuRadioGroup, RdxMenuGroupLabel],
    template: `
        <div [defaultOpen]="true" rdxMenuRoot>
            <ng-template [container]="null" [keepMounted]="true" rdxMenuPortal>
                <span id="server-never-mounted">Pending content</span>
            </ng-template>
        </div>
        <div id="server-group" rdxMenuGroup>
            <span id="server-menu-label" rdxMenuGroupLabel>Commands</span>
        </div>
        <div id="server-radio-group" rdxMenuRadioGroup>
            <span id="server-radio-label" rdxMenuGroupLabel>Planets</span>
        </div>
    `
})
class PendingMenuPage {}

@Component({
    selector: 'app-labelled-select',
    imports: [RdxSelectRoot, RdxSelectTrigger, RdxSelectLabel, RdxFieldRoot, RdxFieldLabel],
    template: `
        <div id="server-country" rdxSelectRoot>
            <div rdxSelectLabel>Country</div>
            <button rdxSelectTrigger>Choose</button>
        </div>
        <div rdxFieldRoot>
            <label id="server-field-label" rdxFieldLabel>Billing country</label>
            <ng-container id="server-billing-country" rdxSelectRoot>
                <button rdxSelectTrigger>Choose</button>
            </ng-container>
        </div>
        <button id="server-same-host" rdxSelectRoot rdxSelectTrigger>Same host</button>
    `
})
class LabelledSelectPage {}

@Component({
    selector: 'app-select-arrows',
    imports: [_importsSelect],
    template: `
        <ng-container [modal]="false" rdxSelectRoot>
            <button rdxSelectTrigger>Fruit</button>
            <div rdxSelectPositioner>
                <div rdxSelectPopup>
                    <div id="server-popper-arrow" rdxSelectArrow></div>
                    <div rdxSelectList></div>
                </div>
            </div>
        </ng-container>
        <ng-container [modal]="false" rdxSelectRoot>
            <button rdxSelectTrigger>Fruit</button>
            <div rdxSelectItemAlignedPosition>
                <div rdxSelectPopup>
                    <div rdxSelectItemAlignedPositionContent>
                        <div id="server-aligned-arrow" rdxSelectArrow></div>
                        <div rdxSelectList></div>
                    </div>
                </div>
            </div>
        </ng-container>
    `
})
class SelectArrowsPage {}

@Component({
    selector: 'app-retained-select',
    imports: [_importsSelect],
    template: `
        <ng-container rdxSelectRoot>
            <button rdxSelectTrigger>Fruit</button>
            <ng-template [keepMounted]="true" rdxSelectPortal>
                <div rdxSelectPositioner>
                    <div rdxSelectPopup>
                        <div rdxSelectList>
                            <div value="Apple" rdxSelectItem><span rdxSelectItemText>Apple</span></div>
                        </div>
                    </div>
                </div>
            </ng-template>
        </ng-container>
    `
})
class RetainedSelectPage {}

@Component({
    selector: 'app-arbitrary-select',
    imports: [_importsSelect],
    template: `
        @for (value of values; track $index) {
            <div [value]="value" [multiple]="false" [itemToStringLabel]="label" rdxSelectRoot>
                <button rdxSelectTrigger>
                    <span #display="rdxSelectedValue" rdxSelectValue>{{ display.slotText() }}</span>
                </button>
            </div>
        }
    `
})
class ArbitrarySelectPage {
    readonly values = [false, new Date('2026-01-01T00:00:00Z'), [10, 20], Symbol('server-token')];
    readonly label = (value: unknown) =>
        typeof value === 'symbol' ? (value.description ?? '') : JSON.stringify(value);
}

function renderToString(selector: string, component: Type<unknown>): Promise<string> {
    return renderApplication(
        (context: BootstrapContext) =>
            bootstrapApplication(
                component,
                {
                    providers: [provideZonelessChangeDetection(), provideClientHydration(), provideServerRendering()]
                },
                context
            ),
        { document: `<!doctype html><html><head></head><body><${selector}></${selector}></body></html>` }
    );
}

@Component({
    selector: 'app-tabs-identities',
    imports: [RdxTabsRoot, RdxTabsList, RdxTabsTab, RdxTabsPanel, RdxTabsPanelPresence],
    template: `
        <div rdxTabsRoot defaultValue="one">
            <div rdxTabsList>
                <button id="server-tabs-tab" data-testid="server-tab-one" rdxTabsTab value="one">One</button>
                <button data-testid="server-tab-two" rdxTabsTab value="two">Two</button>
                <button data-testid="server-tab-three" rdxTabsTab value="three">Three</button>
            </div>
            <div id="server-tabs-panel" *rdxTabsPanelPresence="'one'" data-testid="server-panel-one" rdxTabsPanel>
                One
            </div>
            <div *rdxTabsPanelPresence="'two'" data-testid="server-panel-two" rdxTabsPanel>
                <span>Inactive content</span>
            </div>
            <div *rdxTabsPanelPresence="'three'; keepMounted: true" data-testid="server-panel-three" rdxTabsPanel>
                Retained content
            </div>
        </div>
    `
})
class TabsIdentitiesPage {}

const serverTabFunction = vi.fn(() => {
    throw new Error('Tab function was executed during SSR');
});
@Component({
    selector: 'app-tabs-values',
    imports: [RdxTabsRoot, RdxTabsList, RdxTabsTab, RdxTabsPanel],
    template: `
        @for (group of groups; track group.key) {
            <div [defaultValue]="group.values[0]" rdxTabsRoot>
                <div rdxTabsList>
                    @for (value of group.values; track $index) {
                        <button [value]="value" [attr.data-testid]="group.key + '-tab-' + $index" rdxTabsTab>
                            Tab {{ $index }}
                        </button>
                    }
                </div>
                @for (value of group.values; track $index) {
                    <div [value]="value" [attr.data-testid]="group.key + '-panel-' + $index" keepMounted rdxTabsPanel>
                        Panel {{ $index }}
                    </div>
                }
            </div>
        }
    `
})
class TabsValuesPage {
    readonly groups = [
        { key: 'objects', values: [{ id: 1 }, { id: 1 }] },
        { key: 'functions', values: [serverTabFunction, () => 'other'] },
        { key: 'undefined', values: [undefined, 'other'] }
    ];
}

@Component({
    selector: 'app-accordion-presence',
    imports: [
        RdxAccordionRootDirective,
        RdxAccordionItemDirective,
        RdxAccordionTriggerDirective,
        RdxAccordionPanelDirective,
        RdxAccordionPanelPresenceDirective
    ],
    template: `
        @for (group of groups; track group.key) {
            <div
                [value]="group.controlled ? [] : undefined"
                [defaultValue]="group.open ? ['a'] : []"
                [keepMounted]="group.keep"
                [hiddenUntilFound]="group.find"
                rdxAccordionRoot
            >
                <div rdxAccordionItem value="a">
                    <button [attr.data-testid]="group.key + '-trigger'" rdxAccordionTrigger>{{ group.key }}</button>
                    <div *rdxAccordionPanelPresence [attr.data-testid]="group.key + '-panel'" rdxAccordionPanel>
                        <input aria-label="Server child" value="initial" />
                    </div>
                </div>
            </div>
        }
    `
})
class AccordionPresencePage {
    readonly groups = [
        { key: 'closed', open: false, keep: false, find: false, controlled: false },
        { key: 'kept', open: false, keep: true, find: false, controlled: false },
        { key: 'findable', open: false, keep: false, find: true, controlled: false },
        { key: 'open', open: true, keep: false, find: false, controlled: false },
        { key: 'controlled', open: true, keep: false, find: false, controlled: true }
    ];
}

describe('SSR rendering', () => {
    it('renders complete Accordion Panel views only when open, retained or findable on the server', async () => {
        const html = await renderToString('app-accordion-presence', AccordionPresencePage);
        const panel = (key: string) => html.match(new RegExp(`<div[^>]*data-testid="${key}-panel"[^>]*>`))?.[0];
        expect(panel('closed')).toBeUndefined();
        expect(panel('controlled')).toBeUndefined();
        expect(panel('kept')).toContain('hidden=""');
        expect(panel('findable')).toContain('hidden="until-found"');
        expect(panel('open')).toContain('data-open');
        expect(panel('open')).not.toContain('hidden=');
        expect(html.match(/aria-label="Server child"/g) ?? []).toHaveLength(3);
        expect(html).not.toContain('<!--rdx-collapsible-panel-->');
        expect(html).toContain('ngh=');
    });

    it('renders Accordion array defaults, native disabled buttons and authored relationships', async () => {
        const html = await renderToString('app-accordion', AccordionPage);
        const trigger = html.match(/<button[^>]*id="server-accordion-trigger"[^>]*>/)![0];
        const panel = html.match(/<div[^>]*id="server-accordion-panel"[^>]*>/)![0];
        expect(trigger).toContain('type="button"');
        expect(trigger).toContain('aria-expanded="true"');
        expect(trigger).toContain('aria-controls="server-accordion-panel"');
        expect(panel).toContain('aria-labelledby="server-accordion-trigger"');
        expect(panel).toContain('data-open');
        expect(panel).toMatch(/animation-name:\s*none/);
        expect(panel).toMatch(/--collapsible-panel-height:\s*auto/);
        expect(panel).not.toContain('data-starting-style');
        const disabledButton = html.match(/<button[^>]*>Three<\/button>/)![0];
        expect(disabledButton).toContain('disabled=""');
        expect(disabledButton).not.toContain('aria-disabled');
    });

    it('serializes arbitrary Tabs values with distinct native identities without invoking functions', async () => {
        const html = await renderToString('app-tabs-values', TabsValuesPage);
        const tag = (name: string) => html.match(new RegExp(`<[^>]*data-testid="${name}"[^>]*>`))![0];
        const id = (name: string) => tag(name).match(/ id="([^"]+)"/)![1];
        const ids = new Set<string>();
        for (const group of ['objects', 'functions', 'undefined']) {
            for (const index of [0, 1]) {
                const tab = `${group}-tab-${index}`,
                    panel = `${group}-panel-${index}`;
                ids.add(id(tab));
                ids.add(id(panel));
                expect(tag(tab)).toContain(`aria-controls="${id(panel)}"`);
                expect(tag(panel)).toContain(`aria-labelledby="${id(tab)}"`);
            }
        }
        expect(ids.size).toBe(12);
        expect(tag('objects-tab-0')).toContain('aria-selected="true"');
        expect(tag('objects-tab-1')).toContain('aria-selected="false"');
        expect(tag('functions-tab-0')).toContain('aria-selected="true"');
        expect(serverTabFunction).not.toHaveBeenCalled();
    });

    it('serializes actual Tabs identities for active, absent and kept whole-Panel views', async () => {
        const html = await renderToString('app-tabs-identities', TabsIdentitiesPage);
        const tag = (name: string) => html.match(new RegExp(`<[^>]*data-testid="${name}"[^>]*>`))![0];
        const id = (name: string) => tag(name).match(/ id="([^"]+)"/)![1];
        expect(id('server-tab-one')).toBe('server-tabs-tab');
        expect(id('server-panel-one')).toBe('server-tabs-panel');
        expect(tag('server-tab-one')).toContain('aria-controls="server-tabs-panel"');
        expect(tag('server-panel-one')).toContain('aria-labelledby="server-tabs-tab"');
        expect(tag('server-tab-two')).not.toContain('aria-controls');
        expect(html).not.toContain('data-testid="server-panel-two"');
        expect(tag('server-tab-three')).toContain(`aria-controls="${id('server-panel-three')}"`);
        expect(tag('server-panel-three')).toContain(`aria-labelledby="${id('server-tab-three')}"`);
        expect(tag('server-panel-three')).toContain(' hidden');
        expect(html).toContain('Retained content');
        expect(
            new Set(
                ['server-tab-one', 'server-tab-two', 'server-tab-three', 'server-panel-one', 'server-panel-three'].map(
                    id
                )
            ).size
        ).toBe(5);
        expect(html).not.toContain('Inactive content');
        expect(html).toMatch(/ngh=/);
    });
    it('defers pending Menu portals and serializes authored GroupLabel associations', async () => {
        const html = await renderToString('app-pending-menu', PendingMenuPage);
        expect(html).not.toContain('server-never-mounted');
        for (const [group, label] of [
            ['server-group', 'server-menu-label'],
            ['server-radio-group', 'server-radio-label']
        ]) {
            const tag = html.match(new RegExp(`<div[^>]*id="${group}"[^>]*>`))?.[0];
            expect(tag).toContain(`aria-labelledby="${label}"`);
            expect(html.match(new RegExp(`<span[^>]*id="${label}"[^>]*>`))?.[0]).toContain('aria-hidden="true"');
        }
        expect(html).toMatch(/ngh=/);
    });
    it('keeps custom Portal targets in place without the browser HTMLElement constructor', async () => {
        vi.stubGlobal('HTMLElement', undefined);
        try {
            const html = await renderToString('app-portal-targets', PortalTargetsPage);
            expect(html).toMatch(/<div[^>]*id="server-target"[^>]*><\/div>/);
            const origin = html.slice(html.indexOf('id="server-origin"'));
            expect(origin).toContain('id="server-attribute"');
            expect(origin).toContain('id="server-structural"');
            expect(html).toMatch(/ngh=/);
        } finally {
            vi.unstubAllGlobals();
        }
    });
    it('resolves Autocomplete model/default precedence before server serialization', async () => {
        const html = await renderToString('app-autocomplete-defaults', AutocompleteDefaultsPage);
        const parsed = new DOMParser().parseFromString(html, 'text/html');
        for (const [id, value] of [
            ['autocomplete-explicit-value', ''],
            ['autocomplete-explicit-open', 'false'],
            ['autocomplete-default-value', 'Seed'],
            ['autocomplete-default-open', 'true']
        ])
            expect(parsed.getElementById(id)?.textContent).toBe(value);
        expect(html).toMatch(/ngh=/);
    });
    it('resolves Number Field form and model values before server serialization', async () => {
        const html = await renderToString('app-number-field-defaults', NumberFieldDefaultsPage);
        const parsed = new DOMParser().parseFromString(html, 'text/html');
        const inputs = [...parsed.querySelectorAll<HTMLInputElement>('input[rdxnumberfieldinput]')];
        expect(inputs.map((input) => input.value)).toEqual(['0', '', '11']);
        expect(parsed.querySelector<HTMLInputElement>('input[rdxnumberfieldhiddeninput]')?.value).toBe('0');
        expect(html).toMatch(/ngh=/);
    });
    it('serializes both the Toggle default and the explicit false value', async () => {
        const html = await renderToString('app-toggle-defaults', ToggleDefaultsPage);
        const buttons = [...new DOMParser().parseFromString(html, 'text/html').querySelectorAll('button[rdxtoggle]')];
        expect(buttons.map((button) => button.getAttribute('aria-pressed'))).toEqual(['true', 'false']);
        expect(buttons.map((button) => button.hasAttribute('data-pressed'))).toEqual([true, false]);
    });
    it('resolves Switch defaults, Field associations and the authored input before server serialization', async () => {
        const html = await renderToString('app-switch-defaults', SwitchDefaultsPage);
        const parsed = new DOMParser().parseFromString(html, 'text/html');
        const switches = [...parsed.querySelectorAll('[role="switch"]')];
        expect(switches.map((control) => control.getAttribute('aria-checked'))).toEqual(['false', 'false', 'true']);
        expect(switches[2].querySelector('[rdxswitchthumb]')?.hasAttribute('data-checked')).toBe(true);
        expect(switches[2].querySelector('[rdxswitchthumb]')?.hasAttribute('data-filled')).toBe(true);
        expect(switches[2].getAttribute('aria-labelledby')).toBe('switch-label');
        expect(switches[2].getAttribute('aria-describedby')).toBe('switch-description');
        expect(parsed.querySelector('#switch-label')?.getAttribute('for')).toBe('from-default');
        expect(switches[2].getAttribute('aria-required')).toBe('true');
        const inputs = [...parsed.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')];
        expect(inputs.map((input) => input.checked)).toEqual([true]);
        expect(inputs.map((input) => [input.name, input.required])).toEqual([['alerts', true]]);
        expect(html).toMatch(/ngh=/);
    });
    it('resolves Checkbox form values and the group relationship before server serialization', async () => {
        const html = await renderToString('app-checkbox-defaults', CheckboxDefaultsPage);
        const parsed = new DOMParser().parseFromString(html, 'text/html');
        const controls = [...parsed.querySelectorAll('[role="checkbox"]')];
        const inputs = [...parsed.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')];
        expect(controls.map((control) => control.getAttribute('aria-checked'))).toEqual([
            'false',
            'false',
            'true',
            'true',
            'true'
        ]);
        expect(inputs.map((input) => input.checked)).toEqual([false, false, true]);
        expect(controls[3].getAttribute('aria-controls')).toBe(controls[4].id);
        expect(controls[4].id).toMatch(/^rdx-checkbox-/);
        expect(parsed.querySelector('#unchecked-indicator')).toBeNull();
        expect(parsed.querySelector('#retained-indicator')?.hasAttribute('data-unchecked')).toBe(true);
        expect(parsed.querySelector('#checked-indicator')?.hasAttribute('data-checked')).toBe(true);
        expect(html).toMatch(/ngh=/);
    });
    it('resolves Radio form and model values before server serialization', async () => {
        const html = await renderToString('app-radio-defaults', RadioDefaultsPage);
        const parsed = new DOMParser().parseFromString(html, 'text/html');
        const radios = Array.from(parsed.querySelectorAll('[role="radio"]'));
        const inputs = Array.from(parsed.querySelectorAll<HTMLInputElement>('input[type="radio"]'));
        expect(radios.map((radio) => radio.getAttribute('aria-checked'))).toEqual(['false', 'false', 'true', 'true']);
        expect(inputs.map((input) => input.checked)).toEqual([false, false, true, true]);
        expect(html).toMatch(/ngh=/);
    });
    it('serializes Radio Field labels and the native input association', async () => {
        const html = await renderToString('app-radio-field', RadioFieldPage);
        const parsed = new DOMParser().parseFromString(html, 'text/html');
        const group = parsed.querySelector('[role="radiogroup"]');
        const item = parsed.querySelector('[role="radio"]');
        const input = parsed.querySelector<HTMLInputElement>('input[type="radio"]');

        expect(group?.getAttribute('aria-labelledby')).toBe('plan-label');
        expect(group?.getAttribute('aria-describedby')).toBe('plan-description');
        expect(item?.getAttribute('aria-labelledby')).toBe('plan-free-label');
        expect(item?.getAttribute('aria-describedby')).toBe('plan-description');
        expect(input?.id).toBe('plan-free-input');
        expect(input?.name).toBe('plan');
        expect(parsed.querySelector('label')?.htmlFor).toBe(input?.id);
        expect(input?.checked).toBe(true);
        expect(html).toMatch(/ngh=/);
    });
    it('serializes the settled Radio Indicator view according to selection and keepMounted', async () => {
        const html = await renderToString('app-radio-field', RadioFieldPage);
        const parsed = new DOMParser().parseFromString(html, 'text/html');
        expect(parsed.querySelector('#selected-indicator')?.hasAttribute('data-checked')).toBe(true);
        expect(parsed.querySelector('#inactive-indicator')).toBeNull();
        expect(parsed.querySelector('#retained-indicator')?.hasAttribute('data-unchecked')).toBe(true);
        expect(
            parsed.querySelector('[rdxradioindicator][data-starting-style], [rdxradioindicator][data-ending-style]')
        ).toBeNull();
        expect(html).toMatch(/ngh=/);
    });
    it('resolves Menu model/default precedence before server serialization', async () => {
        const html = await renderToString('app-menu-defaults', MenuDefaultsPage);
        for (const [id, value] of [
            ['explicit-open', 'false'],
            ['default-open', 'true'],
            ['explicit-radio', 'two'],
            ['default-radio', 'one']
        ])
            expect(html).toMatch(new RegExp(`<output[^>]*id="${id}"[^>]*>${value}</output>`));
        expect(html).toMatch(/ngh=/);
    });
    it('renders arbitrary single-item labels without coercing the selection shape', async () => {
        const html = await renderToString('app-arbitrary-select', ArbitrarySelectPage);
        expect(html).toContain('false');
        expect(html).toContain('2026-01-01T00:00:00.000Z');
        expect(html).toContain('[10,20]');
        expect(html).toContain('server-token');
        expect(html).toMatch(/ngh=/);
    });
    it('renders a keep-mounted Select in place without a browser HTMLElement constructor', async () => {
        vi.stubGlobal('HTMLElement', undefined);
        try {
            const html = await renderToString('app-retained-select', RetainedSelectPage);
            expect(html).toContain('role="listbox"');
            expect(html).toContain('Apple');
            expect(html).toContain('inert=""');
            expect(html).toMatch(/ngh=/);
        } finally {
            vi.unstubAllGlobals();
        }
    });
    it('renders decorative Select arrows without running browser geometry on the server', async () => {
        const html = await renderToString('app-select-arrows', SelectArrowsPage);
        expect(html).toContain('id="server-popper-arrow"');
        expect(html).not.toContain('<svg');
        const aligned = /<div[^>]*id="server-aligned-arrow"[^>]*>/.exec(html)?.[0];
        expect(aligned).toContain('hidden=""');
        expect(aligned).toContain('aria-hidden="true"');
        expect(html).toMatch(/ngh=/);
    });
    it('renders label associations and forwarded control ids before hydration', async () => {
        const html = await renderToString('app-labelled-select', LabelledSelectPage);
        expect(html.match(/id="server-country"/g)).toHaveLength(1);
        expect(html).toContain('id="server-country-label"');
        expect(html).toContain('aria-labelledby="server-country-label"');
        expect(html).toContain('for="server-billing-country"');
        expect(html).toContain('aria-labelledby="server-field-label"');
        expect(html.match(/id="server-same-host"/g)).toHaveLength(1);
    });
    for (const { selector, component, expects } of cases) {
        it(`renders <${selector}> on the server without throwing`, async () => {
            const html = await renderToString(selector, component);

            expect(html).toContain(`<${selector}`);
            for (const token of expects) {
                expect(html).toContain(token);
            }
        });
    }

    it('emits hydration annotations so the client can hydrate the server markup', async () => {
        const html = await renderToString('app-tabs', TabsPage);

        // provideClientHydration() serializes hydration metadata into `ngh` attributes during SSR.
        expect(html).toMatch(/ngh=/);
    });

    it('supports a named Select root on ng-container without rendering a native form control on the server', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        let html: string;

        try {
            html = await renderToString('app-native-select', NativeSelectPage);
            expect(consoleError).not.toHaveBeenCalled();
        } finally {
            consoleError.mockRestore();
        }

        expect(html!).not.toContain('data-rdx-native-form-control');
        const form = new DOMParser().parseFromString(html!, 'text/html').querySelector('form')!;
        expect(form.querySelector('input, select, textarea')).toBeNull();
        expect([...new FormData(form).entries()]).toEqual([]);
    });

    it('renders deterministic prefixed ids for native associations', async () => {
        const html = await renderToString('app-tabs', TabsPage);

        // Server allocations are deterministic; client hydration recovers IDs from their native
        // owners instead of depending on a matching global construction sequence (ADR 0085).
        expect(html).toMatch(/id="rdx-[a-z]+-\d+-/);
    });
});
