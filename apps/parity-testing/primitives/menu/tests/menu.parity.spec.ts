import { test } from '@playwright/test';
import { createParityRunner } from '../../../shared/run-scenario.ts';
import { touchConfig } from '../src/touch';
import { MenuDriver } from './driver';
import { scenarios } from './scenarios';

const run = createParityRunner({
    differences: new URL('../expected-differences.json', import.meta.url),
    scenarios,
    viewport: { width: 800, height: 600 },
    pageOptions: (name) => ({ hasTouch: !!touchConfig(name) }),
    createDriver: (page, framework) => new MenuDriver(page, framework),
    readNativeEvents: (driver) =>
        driver.page.evaluate(() => ({
            changes: window.menuParity?.nativeEvents,
            pointerMoves: window.menuParity?.pointerMoves,
            gestures: window.menuParity?.gestures,
            inputEvents: window.menuParity?.inputEvents,
            dialogEvents: window.menuParity?.dialog?.nativeEvents,
            popoverEvents: window.menuParity?.popover?.nativeEvents,
            highlightEvents: window.menuParity?.highlights && {
                sequence: window.menuParity.highlights.changes,
                nativeEvents: window.menuParity.highlights.raw
            },
            ...(window.menuParity?.config.multiTrigger?.animated
                ? {
                      viewportDirection:
                          document
                              .querySelector('[data-testid="viewport"]')
                              ?.getAttribute('data-activation-direction') ?? null
                  }
                : {}),
            ...(window.menuParity?.config.projection
                ? {
                      portalDocumentOrder: [...document.querySelectorAll('[role^="menuitem"]')].map((element) => ({
                          id: element.getAttribute('data-testid'),
                          popup: element.closest('[role="menu"]')?.getAttribute('data-testid')
                      }))
                  }
                : {})
        }))
});
for (const scenario of scenarios)
    test(scenario.name, async ({ browser, baseURL }, info) => {
        const touch = touchConfig(scenario.name);
        const engine = browser.browserType().name();
        test.skip(!!touch && engine === 'firefox', 'Playwright Firefox does not support hasTouch contexts');
        test.skip(
            !!touch?.gesture && engine !== 'chromium',
            'Trusted move/cancel gestures use Chromium CDP; no public WebKit gesture API'
        );
        await run(scenario, { browser, baseURL }, info);
    });
