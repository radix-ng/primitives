import type { Browser, Page } from '@playwright/test';

export const searchNeedle = 'Accordion search needle a';

/** Use the engine's find operation; never dispatch beforematch or remove hidden here. */
export function findInPage(page: Page, text: string) {
    return page.evaluate((text) => {
        getSelection()?.removeAllRanges();
        // Wrap without a browser prompt when the previous match is already selected.
        const nativeWindow = window as unknown as {
            find(text: string, caseSensitive: boolean, backwards: boolean, wrapAround: boolean): boolean;
        };
        return nativeWindow.find(text, false, false, true);
    }, text);
}

/** Capability is established on plain HTML, independently of either Accordion fixture. */
export async function searchCapability(browser: Browser) {
    const page = await browser.newPage();
    try {
        await page.setContent('<div hidden="until-found">Accordion search needle a</div>');
        const events = await page.evaluateHandle(() => {
            const events: { trusted: boolean; hidden: string | null }[] = [];
            document.querySelector('div')!.addEventListener('beforematch', (event) => {
                events.push({ trusted: event.isTrusted, hidden: (event.target as HTMLElement).getAttribute('hidden') });
            });
            return events;
        });
        const found = await findInPage(page, searchNeedle);
        const observed = await events.jsonValue();
        const hidden = await page.locator('div').getAttribute('hidden');
        return {
            browser: browser.version(),
            found,
            events: observed,
            hidden,
            supported: found && hidden === null && observed.some((event) => event.trusted)
        };
    } finally {
        await page.close();
    }
}
