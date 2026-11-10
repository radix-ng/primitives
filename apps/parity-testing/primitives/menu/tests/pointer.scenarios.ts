import { expect } from '@playwright/test';
import { pointerCases } from '../src/pointer';
import type { MenuDriver } from './driver';

export const pointerScenarios = pointerCases.map((name) => ({
    name,
    async run(d: MenuDriver) {
        if (name === 'hover-root-press-before-delay') {
            await d.trigger.click();
            await expect(d.popup).toBeVisible();
            await d.page.waitForTimeout(260);
            await d.page.mouse.move(700, 520);
            await d.page.waitForTimeout(160);
            await d.checkpoint('press owns lifetime', { open: true });
            await d.page.keyboard.press('Escape');
            await d.closed();
            await d.checkpoint('closed', { open: false });
            return;
        }
        if (name.startsWith('drag-')) {
            const trigger = (await d.trigger.boundingBox())!;
            await d.page.mouse.move(trigger.x + trigger.width / 2, trigger.y + trigger.height / 2);
            await d.page.mouse.down();
            await expect(d.popup).toBeVisible();
            const target =
                name === 'drag-disabled'
                    ? 'blocked'
                    : name === 'drag-stay'
                      ? 'stay'
                      : name === 'drag-checkbox'
                        ? 'check'
                        : name === 'drag-radio'
                          ? 'radio-two'
                          : 'alpha';
            const item = (await d.item(target).boundingBox())!;
            if (name !== 'drag-too-soon') await d.page.waitForTimeout(240); // The native 200ms mouse-up guard.
            if (name === 'drag-outside') await d.page.mouse.move(700, 520);
            else await d.page.mouse.move(item.x + item.width / 2, item.y + item.height / 2, { steps: 2 });
            await d.page.mouse.up();
            const stays = ['drag-too-soon', 'drag-disabled', 'drag-stay', 'drag-checkbox', 'drag-radio'].includes(name);
            if (!stays) await d.closed();
            await d.checkpoint('released', {
                open: stays,
                selected: name === 'drag-select' ? ['alpha'] : name === 'drag-stay' ? ['stay'] : [],
                ...(name === 'drag-checkbox' ? { checked: 'true' } : {}),
                ...(name === 'drag-radio' ? { radio: ['radio-two'] } : {})
            });
            return;
        }

        const submenu = name.startsWith('hover-submenu');
        if (submenu) await d.open('mouse');
        const reference = submenu ? d.item('more') : d.trigger;
        if (submenu) await d.hoverItem('more');
        else await reference.hover();
        if (name.endsWith('-cancel') || name.endsWith('-disabled')) {
            if (name.endsWith('-cancel')) await d.page.mouse.move(700, 520);
            await d.page.waitForTimeout(260); // Let the canceled/disabled 180ms request expire naturally.
            await d.checkpoint('hover did not open', {
                open: submenu,
                subOpen: false,
                ...(submenu ? {} : { mounted: false })
            });
            if (submenu) await expect(d.subPopup).toHaveCount(0);
            return;
        }
        const content = submenu ? d.subPopup : d.popup;
        await expect(content).toBeVisible();
        await expect
            .poll(() =>
                d.page.evaluate((layer) => window.menuParity.completions[layer].at(-1), submenu ? 'sub' : 'main')
            )
            .toBe(true);
        await d.checkpoint('hover opened', { open: true, ...(submenu ? { subOpen: true } : {}) });
        if (name.endsWith('-click')) {
            await reference.click();
            await d.checkpoint('hover click', { open: true, ...(submenu ? { subOpen: true } : {}) });
        }
        const from = (await reference.boundingBox())!;
        const to = (await content.boundingBox())!;
        if (submenu) {
            const rtl = name.endsWith('-rtl');
            await d.page.mouse.move(from.x + (rtl ? 4 : from.width - 4), from.y + from.height / 2);
            await d.page.mouse.move(to.x + (rtl ? to.width - 8 : 8), to.y + to.height - 8, { steps: 10 });
        } else {
            await d.page.mouse.move(from.x + from.width / 2, from.y + from.height - 2);
            await d.page.mouse.move(to.x + to.width / 2, to.y + 8, { steps: 5 });
        }
        await d.checkpoint('landed through grace area', { open: true, ...(submenu ? { subOpen: true } : {}) });
        if (name.endsWith('-sibling')) {
            await d.page.mouse.move(to.x + to.width / 2, to.y + to.height + 40);
            await d.hoverItem('bravo');
            await expect(d.subPopup).toHaveCount(0);
            await d.checkpoint('sibling owns highlight', { open: true, subOpen: false });
            return;
        }
        if (name.endsWith('-reenter')) {
            await d.page.mouse.move(700, 520);
            await reference.hover();
            await d.page.waitForTimeout(160);
            await d.checkpoint('reentered before close', { open: true });
        }
        await d.page.mouse.move(700, 520);
        if (submenu) {
            await d.page.waitForTimeout(160);
            await d.checkpoint('left floating content', { open: true, subOpen: true });
            await d.hoverItem('bravo');
            await expect(d.subPopup).toHaveCount(0);
            await d.checkpoint('left grace area', { open: true, subOpen: false });
        } else {
            if (name.endsWith('-click')) {
                await d.page.waitForTimeout(160);
                await d.checkpoint('press owns lifetime', { open: true });
                await d.page.keyboard.press('Escape');
            }
            await d.closed();
            await d.checkpoint('left grace area', { open: false, mounted: false });
        }
    }
}));
