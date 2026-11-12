import { expect } from '@playwright/test';
import { touchGesture } from '../../../../../tools/playwright/touch';
import { touchCases } from '../src/touch';
import type { MenuDriver } from './driver';
import { assertTrustedTouch, open, tap } from './touch-input';

async function runTouch(d: MenuDriver, name: (typeof touchCases)[number]) {
    if (name === 'touch-trigger-cancel' || name === 'touch-trigger-pan') {
        const scrollEnd = name.endsWith('-pan')
            ? await d.page.evaluateHandle(() => {
                  const state = { ended: false };
                  document.addEventListener(
                      'scrollend',
                      () => {
                          state.ended = true;
                      },
                      { once: true }
                  );
                  return state;
              })
            : undefined;
        await touchGesture(d.page, d.trigger, name.endsWith('-cancel') ? 'cancel' : 'pan');
        if (name.endsWith('-pan')) await expect.poll(() => d.page.evaluate(() => scrollY > 0)).toBe(true);
        await d.checkpoint('trigger gesture ended without opening', { open: false, selected: [] });
        if (scrollEnd) {
            // Chromium consumes a tap during momentum scrolling to stop that scroll. Wait for the
            // native end before asserting the next Menu activation, without retrying the tap.
            await expect.poll(() => scrollEnd.evaluate((state) => state.ended)).toBe(true);
            await scrollEnd.dispose();
        }
        await open(d);
        await d.checkpoint('next tap opens', { open: true });
        return;
    }
    if (name === 'touch-disabled-trigger' || name === 'touch-cancel-open') {
        await tap(d, d.trigger);
        await d.checkpoint('touch opening blocked', { open: false, selected: [] });
        return;
    }
    await open(d);
    await d.checkpoint('touch opened', { open: true, selected: [], highlighted: [] });
    if (name === 'touch-toggle' || name === 'touch-cancel-close') {
        await tap(d, d.trigger);
        if (name === 'touch-toggle') await d.closed();
        await d.checkpoint('touch trigger toggled', { open: name === 'touch-cancel-close' });
        return;
    }
    if (name.startsWith('touch-outside-')) {
        if (name.endsWith('-pan')) {
            await touchGesture(d.page, { x: 700, y: 350 }, 'pan');
            await expect.poll(() => d.page.evaluate(() => scrollY > 0)).toBe(true);
            await d.checkpoint('outside pan dismisses and scrolls the page', {
                open: false,
                selected: [],
                pageScrolled: true
            });
        } else {
            await tap(d, d.item('outside'));
            await d.closed();
            await d.checkpoint('outside touch dismissed');
        }
        return;
    }
    if (name.endsWith('-scroll-policy')) {
        if (name === 'touch-wide-scroll-policy')
            await expect.poll(() => d.popup.evaluate((el) => el.offsetWidth)).toBe(800);
        await d.page.mouse.move(780, 550);
        await d.page.mouse.wheel(0, 200);
        if (name === 'touch-small-scroll-policy')
            await expect.poll(() => d.page.evaluate(() => scrollY > 0)).toBe(true);
        // Observe settled wheel effects while keeping the touch-opened menu alive.
        await d.checkpoint('touch width determines page scroll lock', {
            open: true,
            pageScrolled: name === 'touch-small-scroll-policy'
        });
        return;
    }
    if (name === 'touch-popup-pan') {
        await touchGesture(d.page, d.item('scroll-2'), 'pan');
        await expect.poll(() => d.popup.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
        await d.checkpoint('popup scrolled without selecting', { open: true, selected: [] });
        return;
    }
    if (name.startsWith('touch-submenu')) {
        if (name === 'touch-submenu-cancel') {
            await touchGesture(d.page, d.item('more'), 'cancel');
            await d.checkpoint('submenu gesture canceled', { open: true, subOpen: false, selected: [] });
        }
        await tap(d, d.item('more'));
        await expect(d.subPopup).toBeVisible();
        await d.checkpoint('touch submenu opened', { open: true, subOpen: true });
        if (name === 'touch-submenu-toggle') {
            await tap(d, d.item('more'));
            await expect(d.subPopup).toHaveCount(0);
            await d.checkpoint('touch submenu toggled closed', { open: true, subOpen: false });
            await tap(d, d.item('more'));
            await expect(d.subPopup).toBeVisible();
            await d.checkpoint('touch submenu reopened');
        }
        await tap(d, d.item('sub-alpha'));
        await d.closed();
        await d.checkpoint('touch child selected', { open: false, selected: ['sub-alpha'] });
        return;
    }
    if (name === 'touch-disabled-item' || name === 'touch-stay-open') {
        await tap(d, d.item(name === 'touch-disabled-item' ? 'blocked' : 'stay'));
        await d.checkpoint('touch stays open', {
            open: true,
            selected: name === 'touch-disabled-item' ? [] : ['stay']
        });
        return;
    }
    if (['touch-checkbox', 'touch-radio', 'touch-disabled-checkbox', 'touch-disabled-radio'].includes(name)) {
        const checkbox = name.endsWith('checkbox'),
            disabled = name.includes('disabled');
        await tap(d, d.item(checkbox ? 'check' : 'radio-two'));
        await d.checkpoint('touch value request', {
            open: true,
            ...(checkbox ? { checked: disabled ? 'false' : 'true' } : { radio: [disabled ? 'radio-one' : 'radio-two'] })
        });
        return;
    }
    if (name === 'touch-item-cancel') {
        await touchGesture(d.page, d.item('alpha'), 'cancel');
        await d.checkpoint('item gesture canceled', { open: true, selected: [] });
    }
    await tap(d, d.item('alpha'));
    await d.closed();
    await d.checkpoint('touch command selected', { open: false, selected: ['alpha'] });
    if (name === 'touch-retained') {
        await open(d);
        await tap(d, d.item('bravo'));
        await d.closed();
        await d.checkpoint('retained touch session selected again', { selected: ['alpha', 'bravo'] });
    }
}

export const touchScenarios = touchCases.map((name) => ({
    name,
    async run(d: MenuDriver) {
        await runTouch(d, name);
        const events = await assertTrustedTouch(d);
        if (name.includes('-cancel') && !name.startsWith('touch-cancel-'))
            expect(events.some((event) => event.type === 'pointercancel' && event.trusted)).toBe(true);
    }
}));
