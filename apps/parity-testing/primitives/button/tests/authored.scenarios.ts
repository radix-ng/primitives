import { expect } from '@playwright/test';
import { authoredCases } from '../src/authored';
import type { ButtonDriver } from './driver';

export const authoredScenarios = Object.entries(authoredCases).map(([name, settings]) => ({
    name,
    async run(d: ButtonDriver) {
        const p = settings.authored!;
        const target = d.page.getByTestId('subject');
        const native = settings.host === 'button';
        const zero = { clicks: [], submits: [], resets: 0, hash: '', scrolled: false };
        let epoch = 0;
        const command = async (key: string) => {
            await d.page.keyboard.press(key);
            await expect(d.page.getByTestId('epoch')).toHaveText(String(++epoch));
        };
        const authored = (role: string | null, tabIndex: number, attribute: string | null) => ({
            host: expect.objectContaining({ role, tabIndex }),
            tabIndexAttribute: attribute
        });
        await d.checkpoint('authored initial attributes', {
            ...zero,
            ...authored(p.role, p.tabIndex, String(p.tabIndex))
        });
        if (p.action === 'initial') return;
        if (p.action === 'dynamic') {
            await d.page.getByTestId('before').focus();
            await command('F9');
            await d.checkpoint('authored attributes updated', { ...zero, ...authored('option', 0, '0') });
            await command('F10');
            await d.checkpoint('explicit null removes attributes', {
                ...zero,
                ...authored(null, settings.host === 'span' ? -1 : 0, null)
            });
            await command('F11');
            await d.checkpoint('undefined restores defaults', {
                ...zero,
                ...authored(
                    native ? null : 'button',
                    p.scope === 'standalone' ? 0 : -1,
                    p.scope === 'standalone' ? '0' : '-1'
                )
            });
            return;
        }
        if (p.action === 'disabled') {
            await d.page.getByTestId('before').focus();
            await command('F6');
            await expect(target).toHaveAttribute('data-disabled');
            await d.checkpoint('disabled keeps authored attributes', {
                ...zero,
                ...authored(p.role, p.tabIndex, String(p.tabIndex))
            });
            await command('F7');
            await expect(target).not.toHaveAttribute('disabled');
            await d.checkpoint('focusable disabled keeps authored attributes', {
                ...zero,
                ...authored(p.role, p.tabIndex, String(p.tabIndex))
            });
            await target.focus();
            await d.page.keyboard.press('Enter');
            await d.page.keyboard.press('Space');
            await d.checkpoint('authored tabindex does not bypass disabled activation', zero);
            await command('F6');
            await expect(target).not.toHaveAttribute('data-disabled');
            await command('F7');
            await d.checkpoint('enabled attributes restored', {
                ...zero,
                ...authored(p.role, p.tabIndex, String(p.tabIndex))
            });
            await d.pointerClick();
            await d.checkpoint('enabled authored host activates', {
                clicks: [expect.objectContaining({ target: 'subject', trusted: true })],
                ...authored(p.role, p.tabIndex, String(p.tabIndex)),
                hash: settings.host === 'link' ? '#activated' : ''
            });
            return;
        }
        if (p.action === 'roving') {
            await d.page.getByTestId('first').focus();
            await d.page.keyboard.press('ArrowRight');
            await d.checkpoint('authored tabindex overrides selected roving value', {
                ...zero,
                focus: 'subject',
                tabStops: [-1, 0, -1]
            });
            await d.page.keyboard.press('ArrowRight');
            await d.checkpoint('authored tabindex survives leaving item', {
                ...zero,
                focus: 'last',
                tabStops: [-1, 0, 0]
            });
            await command('F11');
            await d.checkpoint('cleared override rejoins roving ownership', {
                ...zero,
                ...authored(native ? null : 'button', -1, '-1'),
                tabStops: [-1, -1, 0]
            });
            await d.page.getByTestId('after').focus();
            await d.page.keyboard.press('Shift+Tab');
            await expect(d.page.getByTestId('last')).toBeFocused();
            return;
        }
        await target.focus();
        await d.page.keyboard.down('Space');
        await d.checkpoint('text-navigation role preserves prevented Space', zero);
        await d.page.keyboard.up('Space');
        await d.checkpoint('text-navigation keyup stays inert', zero);
    }
}));
