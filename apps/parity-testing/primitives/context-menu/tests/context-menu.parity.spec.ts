import { test } from '@playwright/test';
import { createParityRunner } from '../../../shared/run-scenario';
import { contextMenuKeyCapability } from './keyboard-capability';
import { ContextMenuDriver, scenarios } from './scenarios';
const run = createParityRunner({
    differences: new URL('../expected-differences.json', import.meta.url),
    scenarios,
    viewport: { width: 800, height: 600 },
    pageOptions: (name) => ({ hasTouch: name.startsWith('touch-') }),
    createDriver: (page, framework) => new ContextMenuDriver(page, framework),
    readNativeEvents: (driver) =>
        driver.page.evaluate(() => ({
            changes: window.contextMenuParity.nativeEvents,
            pointerMoves: window.contextMenuParity.pointerMoves,
            gestures: window.contextMenuParity.gestures,
            inputEvents: window.contextMenuParity.inputEvents
        }))
});
for (const scenario of scenarios)
    test(scenario.name, async ({ browser, baseURL }, info) => {
        const engine = browser.browserType().name();
        test.skip(
            scenario.name.startsWith('touch-') && engine === 'firefox',
            'Playwright Firefox does not support hasTouch contexts'
        );
        test.skip(
            scenario.name.startsWith('touch-') && scenario.name !== 'touch-tap' && engine !== 'chromium',
            'Trusted long-press/move/cancel/multi-touch uses Chromium CDP; no public WebKit gesture API'
        );
        if (scenario.name.startsWith('keyboard-')) {
            const capability = await contextMenuKeyCapability(
                browser,
                scenario.name === 'keyboard-context' ? 'ContextMenu' : 'Shift+F10'
            );
            await info.attach('native-keyboard-capability', {
                contentType: 'application/json',
                body: JSON.stringify(capability)
            });
            test.skip(!capability.supported, 'This browser/OS does not emit a trusted contextmenu for this native key');
        }
        await run(scenario, { browser, baseURL }, info);
    });
