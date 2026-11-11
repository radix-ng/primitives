import { expect } from '@playwright/test';
import { orientationConfig, type orientationCases } from '../src/orientation';
import type { MenubarDriver } from './scenarios';

export async function runOrientation(d: MenubarDriver, name: (typeof orientationCases)[number]) {
    const settings = orientationConfig(name);
    const rtl = name.endsWith('-rtl');
    const verticalBar = name.includes('-vertical-bar');
    const file = d.page.getByTestId('file-trigger');
    const popup = d.page.getByTestId('file-popup');
    const openKey = verticalBar ? (rtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown';
    const forward = (orientation: string) =>
        orientation === 'horizontal' ? (rtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown';
    const backward = (orientation: string) =>
        orientation === 'horizontal' ? (rtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp';
    const crossOpen = (orientation: string) =>
        orientation === 'horizontal' ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
    const crossReturn = (orientation: string) =>
        orientation === 'horizontal' ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
    await file.press(openKey);
    await expect(popup).toBeVisible();
    await d.checkpoint('oriented root opened', { open: ['file'] });

    if (name.startsWith('orientation-horizontal')) {
        for (const key of [
            forward(settings.popupOrientation),
            backward(settings.popupOrientation),
            'End',
            'Home',
            backward(settings.popupOrientation)
        ]) {
            await d.page.keyboard.press(key);
            await d.checkpoint(`root ${key}`, { open: ['file'] });
        }
        await d.page.keyboard.press(crossReturn(settings.popupOrientation));
        await d.checkpoint('root cross-axis return');
        await file.press(openKey);
        await d.checkpoint('root reopened after return', { open: ['file'] });
        const candidates = await d.page.locator('[data-menu-popup] [role="menuitem"]').evaluateAll((items) =>
            items.map((item) => ({
                id: item.getAttribute('data-testid'),
                tabIndex: (item as HTMLElement).tabIndex,
                highlighted: item.hasAttribute('data-highlighted')
            }))
        );
        d.measurements.push({ name: 'Tab entry candidates after return', items: candidates });
        d.checkpoints.at(-1)!.state.itemTabStops = candidates;
        // Keep the pin's stale DOM attribute compared, then test Tab in a fresh open session.
        await d.page.keyboard.press('Escape');
        await d.checkpoint('closed navigation-return session', { open: [] });
        await file.press(openKey);
        await d.checkpoint('fresh oriented root for Tab', { open: ['file'] });
        await d.page.keyboard.press('Tab');
        await d.checkpoint('Tab from oriented root');
        await file.press(openKey);
        await d.checkpoint('oriented root ready for selection', { open: ['file'] });
        await d.page.getByTestId('file-alpha').press('Enter');
        await d.checkpoint('oriented root selected', { open: [], selected: ['file-alpha'] });
        return;
    }

    await d.page.keyboard.press('End');
    await expect(d.page.getByTestId('file-more')).toBeFocused();
    await d.checkpoint('oriented child trigger ready', { focus: 'file-more' });
    await d.page.keyboard.press(crossOpen(settings.popupOrientation));
    await expect(d.page.getByTestId('file-sub-popup')).toBeVisible();
    await d.checkpoint('oriented child opened', { open: ['file', 'file-sub'] });
    for (const key of [forward(settings.childOrientation), 'End', 'Home']) {
        await d.page.keyboard.press(key);
        await d.checkpoint(`child ${key}`, { open: ['file', 'file-sub'] });
    }
    await d.page.keyboard.press(crossReturn(settings.childOrientation));
    await d.checkpoint('child cross-axis return');
    await d.page.keyboard.press('Escape');
    await d.checkpoint('closed parent after oriented return', { open: [] });
    await file.press(openKey);
    await d.checkpoint('oriented parent reentered', { open: ['file'] });
    await d.page.getByTestId('file-more').press(crossOpen(settings.popupOrientation));
    await expect(d.page.getByTestId('file-sub-popup')).toBeVisible();
    await d.checkpoint('oriented child reopened', { open: ['file', 'file-sub'] });
    await d.page.keyboard.press('End');
    await d.page.keyboard.press('Enter');
    await d.checkpoint('oriented child selected', { open: [], selected: ['file-sub-bravo'] });
}
