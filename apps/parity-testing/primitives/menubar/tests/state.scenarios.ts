import { expect } from '@playwright/test';
import type { stateCases } from '../src/state';
import type { MenubarDriver } from './scenarios';

export async function runState(d: MenubarDriver, name: (typeof stateCases)[number]) {
    const file = d.page.getByTestId('file-trigger');
    if (name.startsWith('state-default-open') || name === 'state-controlled-initial-open') {
        await expect(d.page.getByTestId('file-popup')).toBeVisible();
        await expect.poll(() => d.page.evaluate(() => window.menubarParity.completions.file.at(-1))).toBe(true);
        await d.checkpoint('initial open settled', { open: ['file'] });
        await d.page.keyboard.press('Escape');
        await d.checkpoint('initial menu closed', { open: [] });
        await file.press(name.endsWith('-vertical') ? 'ArrowRight' : 'ArrowDown');
        await d.checkpoint('reopened after initial close', { open: ['file'] });
        await d.page.keyboard.press('Escape');
        await d.checkpoint('closed after input initialization', { open: [] });
        return;
    }
    if (name === 'state-controlled-external-open') {
        await d.page.getByTestId('before').focus();
        await d.page.keyboard.press('F6');
        await d.checkpoint('externally opened menu', { open: ['file'] });
        await d.page.keyboard.press('F6');
        await d.checkpoint('external close settled');
        await file.press('ArrowDown');
        await d.checkpoint('native opening updates binding', { open: ['file'] });
        await d.page.keyboard.press('Escape');
        await d.checkpoint('native closing updates binding', { open: [] });
        return;
    }
    await file.press('ArrowDown');
    if (name === 'state-controlled-cancel-open') {
        await d.checkpoint('controlled opening canceled', { open: [] });
        await d.page.keyboard.press('F6');
        await d.checkpoint('external open overrides request veto', { open: ['file'] });
        await d.page.keyboard.press('Escape');
        await d.checkpoint('closed externally opened menu', { open: [] });
        await d.page.keyboard.press('F5');
        await file.press('ArrowDown');
        await d.checkpoint('controlled opening allowed', { open: ['file'] });
    } else if (name === 'state-controlled-cancel-close') {
        await d.checkpoint('controlled menu opened', { open: ['file'] });
        await d.page.keyboard.press('Escape');
        await d.checkpoint('controlled closing canceled', { open: ['file'] });
        await d.page.keyboard.press('F8');
        await d.checkpoint('external close after request veto');
        await d.page.keyboard.press('F5');
    } else {
        await d.checkpoint('controlled source opened', { open: ['file'] });
        await d.page.keyboard.press('F7');
        await d.checkpoint('externally opened sibling');
        await d.page.keyboard.press('Escape');
        await d.checkpoint('closed external sibling');
        await d.page.keyboard.press('F6');
        await d.checkpoint('externally reopened source');
        await d.page.keyboard.press('F8');
        await d.checkpoint('external reset settled');
    }
    await d.page.keyboard.press('Escape');
    await d.checkpoint('closed controlled menu', { open: [] });
}
