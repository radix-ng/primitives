import type { Browser } from '@playwright/test';

/** Probe a plain native button, independently of either primitive. Never skip on a fixture failure. */
export async function contextMenuKeyCapability(browser: Browser, key: string) {
    const page = await browser.newPage();
    try {
        await page.setContent('<button>Native keyboard context area</button>');
        const events = await page.evaluateHandle(() => {
            const events: { type: string; trusted: boolean; x: number; y: number }[] = [];
            document.addEventListener('contextmenu', (event) => {
                event.preventDefault();
                events.push({ type: event.type, trusted: event.isTrusted, x: event.clientX, y: event.clientY });
            });
            return events;
        });
        await page.locator('button').focus();
        await page.keyboard.press(key);
        await page.waitForTimeout(50);
        const observed = await events.jsonValue();
        return {
            key,
            browser: browser.version(),
            supported: observed.some((event) => event.trusted),
            events: observed
        };
    } finally {
        await page.close();
    }
}
