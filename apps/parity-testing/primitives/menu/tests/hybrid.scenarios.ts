import { expect } from '@playwright/test';
import { hybridCases } from '../src/hybrid';
import type { MenuDriver } from './driver';
import { assertTrustedTouch, open, tap } from './touch-input';

async function escape(d: MenuDriver) {
    await d.page.keyboard.press('Escape');
    await d.closed();
}
async function hoverOpened(d: MenuDriver, submenu = false) {
    if (submenu) await d.hoverItem('more');
    else await d.trigger.hover();
    await d.page.clock.runFor(300);
    await expect(submenu ? d.subPopup : d.popup).toBeVisible();
}
async function runHybrid(d: MenuDriver, name: (typeof hybridCases)[number]) {
    if (name.startsWith('hybrid-hover-')) {
        await d.page.clock.install();
        await hoverOpened(d);
        await d.checkpoint('mouse hover opened', { open: true, selected: [] });
        await tap(d, d.trigger);
        await d.checkpoint('touch requested promotion', { open: true });
        await d.page.mouse.move(700, 550);
        await d.page.clock.runFor(300);
        if (name.endsWith('-cancel')) {
            await d.closed();
            await d.checkpoint('canceled promotion retains hover dismissal', { open: false });
            return;
        }
        await d.checkpoint('touch promotion survives pointer leave', { open: true });
        if (name.endsWith('-scroll-policy')) {
            if (name.includes('-wide-')) await expect.poll(() => d.popup.evaluate((el) => el.offsetWidth)).toBe(800);
            await d.page.mouse.wheel(0, 200);
            // The pin keeps the original opening method for this already-open hover session.
            await d.checkpoint('promoted hover session keeps its scroll policy', { open: true, pageScrolled: false });
            await escape(d);
            await open(d);
            // As on the first open, let native placement/effect work settle before testing wheel input.
            await d.checkpoint('fresh touch session opened', { open: true, pageScrolled: false });
            if (name.includes('-wide-')) await expect.poll(() => d.popup.evaluate((el) => el.offsetWidth)).toBe(800);
            await d.page.mouse.wheel(0, 200);
            const scrolls = !name.includes('-wide-');
            if (scrolls) await expect.poll(() => d.page.evaluate(() => scrollY > 0)).toBe(true);
            await d.checkpoint('fresh touch session uses its own scroll policy', { open: true, pageScrolled: scrolls });
        }
        await escape(d);
        await d.checkpoint('keyboard closes promoted menu');
        return;
    }
    if (name.startsWith('hybrid-submenu-')) {
        const rtl = name.endsWith('-rtl');
        if (name.startsWith('hybrid-submenu-keyboard-touch')) {
            await d.open();
            await d.openSub();
            await tap(d, d.item('more'));
            await expect(d.subPopup).toBeVisible();
            if (name.endsWith('-cancel')) {
                await d.checkpoint('canceled touch promotion preserves keyboard child', { open: true, subOpen: true });
                await d.page.keyboard.press('ArrowRight');
                await expect(d.item('sub-alpha')).toBeFocused();
                await tap(d, d.item('sub-alpha'));
                await d.closed();
                await d.checkpoint('child remains usable after promotion veto', { selected: ['sub-alpha'] });
                return;
            }
            await d.checkpoint('touch promotes keyboard child', { open: true, subOpen: true });
            await tap(d, d.item('more'));
            await expect(d.subPopup).toHaveCount(0);
            await d.checkpoint('second touch closes keyboard child', { open: true, subOpen: false });
            await tap(d, d.item('more'));
            await expect(d.subPopup).toBeVisible();
        } else {
            await open(d);
            if (name === 'hybrid-submenu-hover-touch') {
                await d.page.clock.install();
                await hoverOpened(d, true);
            }
            await tap(d, d.item('more'));
            await expect(d.subPopup).toBeVisible();
        }
        await d.checkpoint('touch child activation', { open: true, subOpen: true });
        if (name.includes('-touch-keyboard')) {
            await d.page.keyboard.press(rtl ? 'ArrowLeft' : 'ArrowRight');
            await expect(d.item('sub-alpha')).toBeFocused();
            await d.checkpoint('keyboard enters touch child');
            await d.page.keyboard.press('Enter');
        } else if (name.endsWith('-enter') || name.endsWith('-space')) {
            await d.page.keyboard.press(name.endsWith('-enter') ? 'Enter' : 'Space');
            await expect(d.subPopup).toHaveCount(0);
            await d.checkpoint('keyboard activates touch child trigger', { open: true, subOpen: false });
            await escape(d);
            return;
        } else await tap(d, d.item('sub-alpha'));
        await d.closed();
        await d.checkpoint('mixed input selects child', { open: false, selected: ['sub-alpha'] });
        return;
    }
    if (name.startsWith('hybrid-sessions')) {
        for (const method of ['touch', 'mouse', 'keyboard'] as const) {
            if (method === 'touch') await open(d);
            else await d.open(method === 'mouse' ? 'mouse' : 'Enter');
            await d.checkpoint(`${method} session opened`, { open: true });
            await escape(d);
            await d.checkpoint(`${method} session closed`, { open: false });
        }
        return;
    }
    if (name.startsWith('hybrid-touch-')) await open(d);
    else await d.open(name.startsWith('hybrid-mouse-') ? 'mouse' : 'Enter');
    await d.checkpoint('first input opened', { open: true, selected: [] });
    if (name === 'hybrid-touch-keyboard-select') {
        await d.page.keyboard.press('ArrowDown');
        await expect(d.item('alpha')).toBeFocused();
        await d.page.keyboard.press('Enter');
    } else if (name === 'hybrid-touch-mouse-select') {
        await d.hoverItem('alpha');
        await d.item('alpha').click();
    } else await tap(d, d.item('alpha'));
    await d.closed();
    await d.checkpoint('second input selects', { open: false, selected: ['alpha'] });
}

export const hybridScenarios = hybridCases.map((name) => ({
    name,
    async run(d: MenuDriver) {
        await runHybrid(d, name);
        // Inputs are trusted; Base UI may create an untrusted click from a composite Space key.
        // Preserve and compare that callback metadata rather than rewriting it.
        await assertTrustedTouch(d, { nativeCallbacks: false });
    }
}));
