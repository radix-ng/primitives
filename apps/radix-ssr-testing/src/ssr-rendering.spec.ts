// `@angular/platform-server` ships partially-compiled code; load the compiler so JIT is available
// as a fallback in the test environment (otherwise PlatformLocation fails to compile).
import '@angular/compiler';
import AccordionPage from './app/components/accordion/page';
import AvatarPage from './app/components/avatar/page';
import CheckboxPage from './app/components/checkbox/page';
import CollapsiblePage from './app/components/collapsible/page';
import ComboboxPage from './app/components/combobox/page';
import FormPage from './app/components/form/page';
import LabelPage from './app/components/label/page';
import SelectPage from './app/components/select/page';
import SeparatorPage from './app/components/separator/page';
import SliderPage from './app/components/slider/page';
import SwitchPage from './app/components/switch/page';
import TabsPage from './app/components/tabs/page';
import ToggleGroupPage from './app/components/toggle-group/page';
import { provideZonelessChangeDetection, Type } from '@angular/core';
import { bootstrapApplication, BootstrapContext, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { describe, expect, it } from 'vitest';

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
    // Select's overlay is portal + presence gated, so on the server (closed) only the trigger renders —
    // assert the placeholder the value shows when nothing is selected.
    { selector: 'app-select', component: SelectPage, expects: ['Pick a fruit'] },
    { selector: 'app-separator', component: SeparatorPage, expects: ['***'] },
    { selector: 'app-slider', component: SliderPage, expects: ['Minimum', 'Maximum'] },
    { selector: 'app-switch', component: SwitchPage, expects: ['Switch'] },
    { selector: 'app-tabs', component: TabsPage, expects: ['Tab 1', 'Tab 3'] },
    { selector: 'app-toggle-group', component: ToggleGroupPage, expects: ['Item 1', 'Item 2'] }
];

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

describe('SSR rendering', () => {
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

    it('generates SSR-stable ids (deterministic prefixed counter, not random)', async () => {
        const html = await renderToString('app-tabs', TabsPage);

        // injectId() folds a deterministic counter into the prefix (e.g. `rdx-tabs-2-tab-one`), so
        // server and client share the same id sequence and hydration does not mismatch.
        expect(html).toMatch(/id="rdx-[a-z]+-\d+-/);
    });
});
