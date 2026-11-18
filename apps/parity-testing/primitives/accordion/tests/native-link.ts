import { expect, type Browser } from '@playwright/test';

interface NativeLinkRepeat {
    first: number;
    repeated: number;
    released: number;
    keys: { repeat: boolean; target: string | null }[];
    trusted: boolean[];
}
const observations = new WeakMap<Browser, Promise<NativeLinkRepeat>>();

/** Plain HTML establishes the engine's Enter repeat policy without either primitive. */
export function nativeLinkRepeat(browser: Browser): Promise<NativeLinkRepeat> {
    let result = observations.get(browser);
    if (!result) {
        result = (async () => {
            const page = await browser.newPage({ viewport: { width: 640, height: 480 } });
            try {
                await page.route('http://accordion-native.test/**', (route) =>
                    route.fulfill({
                        contentType: 'text/html',
                        body: '<a id="link" href="#accordion-activated"><span>a</span></a>'
                    })
                );
                await page.goto('http://accordion-native.test/');
                const recorded = await page.evaluateHandle(() => {
                    const state = {
                        keys: [] as { repeat: boolean; target: string | null }[],
                        trusted: [] as boolean[]
                    };
                    document.addEventListener('keydown', (event) =>
                        state.keys.push({ repeat: event.repeat, target: (event.target as Element).id || null })
                    );
                    document
                        .querySelector('#link')!
                        .addEventListener('click', (event) => state.trusted.push(event.isTrusted));
                    return state;
                });
                await page.locator('#link').focus();
                await page.keyboard.down('Enter');
                const first = await recorded.evaluate((state) => state.trusted.length);
                await page.evaluate(
                    () =>
                        new Promise<void>((resolve) =>
                            requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
                        )
                );
                await page.keyboard.down('Enter');
                await page.keyboard.down('Enter');
                const repeated = await recorded.evaluate((state) => state.trusted.length);
                await page.keyboard.up('Enter');
                const state = await recorded.jsonValue();
                expect(first).toBe(1);
                expect(state.keys).toEqual([
                    { repeat: false, target: 'link' },
                    { repeat: true, target: 'link' },
                    { repeat: true, target: 'link' }
                ]);
                expect(state.trusted.every(Boolean)).toBe(true);
                await recorded.dispose();
                return { first, repeated, released: state.trusted.length, ...state };
            } finally {
                await page.close();
            }
        })();
        observations.set(browser, result);
    }
    return result;
}
