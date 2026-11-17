import { expect } from '@playwright/test';
import { interactionCases } from '../src/interaction';
import type { ButtonDriver } from './driver';

export const interactionScenarios = Object.entries(interactionCases).map(([name, settings]) => ({
    name,
    async run(d: ButtonDriver) {
        const p = settings.interaction!;
        const native = settings.host === 'button';
        const key = settings.key!;
        const target = d.page.getByTestId('subject');
        const zero = { clicks: [], submits: [], resets: 0, hash: '', scrolled: false };
        if (p.scope === 'standalone') {
            await d.focusSubject();
            await d.page.keyboard.down(key);
            const count = key === 'Enter' && p.cancel !== 'keydown' ? 1 : 0;
            await d.checkpoint('consumer handles keydown', {
                ...zero,
                clicks: count ? [expect.objectContaining({ target: 'subject' })] : [],
                handlers: [`keydown:${key}`, ...(count ? ['click'] : [])]
            });
            await d.page.keyboard.up(key);
            const finalCount = key === 'Space' ? (p.cancel === 'keyup' ? 0 : 1) : count;
            await d.checkpoint('consumer handles keyup', {
                ...zero,
                clicks: finalCount ? [expect.objectContaining({ target: 'subject' })] : [],
                handlers: [
                    `keydown:${key}`,
                    ...(count ? ['click'] : []),
                    `keyup:${key}`,
                    ...(key === 'Space' && finalCount ? ['click'] : [])
                ]
            });
            return;
        }
        await d.checkpoint('one composite entry', { ...zero, tabStops: [0, -1, -1] });
        await d.page.getByTestId('field').focus();
        await d.page.keyboard.press('Tab');
        await expect(d.page.getByTestId('first')).toBeFocused();
        await d.page.keyboard.press('ArrowRight');
        if (settings.disabled && !settings.focusableWhenDisabled) {
            await d.checkpoint('unfocusable disabled item skipped', { ...zero, focus: 'last', tabStops: [-1, -1, 0] });
            await d.pointerClick();
            await d.checkpoint('skipped disabled pointer remains inert', { ...zero, focus: 'last' });
            return;
        }
        await expect(target).toBeFocused();
        await d.checkpoint('composite owns focus', { ...zero, focus: 'subject', tabStops: [-1, 0, -1] });
        if (settings.modified) {
            await d.page.keyboard.down('Control');
            await d.page.keyboard.down('Shift');
        }
        await d.page.keyboard.down(key);
        const disabled = !!settings.disabled || !!p.disabledOwner;
        const count = disabled || (key === 'Enter' && p.cancel === 'keydown') ? 0 : 1;
        const click = expect.objectContaining({
            target: 'subject',
            trusted: key === 'Enter' && (native || settings.host === 'link'),
            shift: !!settings.modified,
            ctrl: !!settings.modified,
            alt: false,
            meta: false
        });
        await d.checkpoint('composite activates on keydown', {
            clicks: count ? [click] : [],
            submits: [],
            resets: 0,
            scrolled: false,
            hash: count && settings.host === 'link' ? '#activated' : ''
        });
        if (p.repeat) {
            await d.page.keyboard.down(key);
            await d.page.keyboard.down(key);
        }
        await d.page.keyboard.up(key);
        if (settings.modified) {
            await d.page.keyboard.up('Shift');
            await d.page.keyboard.up('Control');
        }
        const finalCount = count && p.repeat ? 3 : count;
        await d.checkpoint('composite keyup adds no activation', {
            clicks: Array.from({ length: finalCount }, () => click),
            submits: [],
            resets: 0,
            scrolled: false,
            hash: finalCount && settings.host === 'link' ? '#activated' : ''
        });
        await d.page.keyboard.press('ArrowRight');
        await d.checkpoint('arrow leaves item', {
            focus: 'last',
            tabStops: [-1, -1, 0],
            clicks: Array.from({ length: finalCount }, () => click)
        });
        await d.page.keyboard.press('Tab');
        await expect(d.page.getByTestId('after')).toBeFocused();
    }
}));
