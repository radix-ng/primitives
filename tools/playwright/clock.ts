import { test, type Page } from '@playwright/test';

/** Install the clock before navigation; call this while idle, before the measured interaction. */
export async function pauseClockBeforeInteraction(page: Page): Promise<void> {
    // pauseAt requires a future timestamp. A short lead can expire in transit on a busy runner.
    // The full test budget cannot elapse before this call without the test itself timing out.
    const at = await page.evaluate((budget) => Date.now() + budget, test.info().timeout);
    await page.clock.pauseAt(at);
}
