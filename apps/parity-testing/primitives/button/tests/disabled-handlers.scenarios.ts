import { expect } from '@playwright/test';
import { interactionCases } from '../src/interaction';
import type { ButtonDriver } from './driver';

export const disabledHandlerScenarios = Object.entries(interactionCases)
    .filter(([, settings]) => settings.interaction?.disabledHandlers)
    .map(([name, settings]) => ({
        name,
        async run(d: ButtonDriver) {
            const p = settings.interaction!;
            const target = d.page.getByTestId('subject');
            const composite = p.scope !== 'standalone';
            const native = settings.host === 'button';
            const focusable = !!settings.focusableWhenDisabled;
            const zero = { clicks: [], submits: [], resets: 0, hash: '', scrolled: false, handlers: [] };
            const tryDisabled = async () => {
                await d.page.getByTestId('before').focus();
                await d.pointerClick();
                await expect(d.page.getByTestId('before')).toBeFocused();
                if (!native || focusable) {
                    await target.focus();
                    await d.page.keyboard.press('Enter');
                    if (focusable) await d.page.keyboard.press('Space');
                }
            };
            await tryDisabled();
            await d.checkpoint('disabled suppresses consumer pointer and keyboard handlers', zero);
            await d.page.keyboard.press('F6');
            await expect(target).not.toHaveAttribute('data-disabled');
            await target.focus();
            await d.page.keyboard.press('Enter');
            await d.page.keyboard.press('Space');
            await d.pointerClick();
            const handlers = [
                'keydown:Enter',
                'click',
                'keyup:Enter',
                'keydown:Space',
                ...(composite ? ['click', 'keyup:Space'] : ['keyup:Space', 'click']),
                'pointerdown',
                'mousedown',
                'click'
            ];
            const enabled = {
                handlers,
                clicks: Array.from({ length: 3 }, () => expect.objectContaining({ target: 'subject' })),
                hash: settings.host === 'link' ? '#activated' : '',
                submits: [],
                resets: 0,
                scrolled: false
            };
            await d.checkpoint('reenabled consumer handlers and activation resume', enabled);
            await d.page.keyboard.press('F6');
            await expect(target).toHaveAttribute('data-disabled');
            await tryDisabled();
            await d.checkpoint('new disabled state suppresses the same handlers', enabled);
            if (focusable) {
                await target.focus();
                if (composite) {
                    await d.page.keyboard.press('ArrowRight');
                    await expect(d.page.getByTestId('last')).toBeFocused();
                    await d.checkpoint('disabled item retains arrow navigation without consumer callback', enabled);
                }
                await d.page.keyboard.press('Tab');
                await expect(d.page.getByTestId('after')).toBeFocused();
                await d.checkpoint('Tab exits without a disabled consumer callback', enabled);
            }
        }
    }));
