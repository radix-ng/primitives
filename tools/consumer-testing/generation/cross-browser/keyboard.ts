import type { Page } from '@playwright/test';

/** Match the repository's macOS WebKit full-keyboard-navigation convention. */
export function navigationKey(key: string, browserName: string, platform = process.platform): string {
    if (browserName !== 'webkit' || platform !== 'darwin') return key;
    if (key === 'Tab') return 'Alt+Tab';
    if (key === 'Shift+Tab') return 'Alt+Shift+Tab';
    return key;
}

export async function pressKey(page: Page, browserName: string, key: string) {
    await page.keyboard.press(navigationKey(key, browserName));
}
