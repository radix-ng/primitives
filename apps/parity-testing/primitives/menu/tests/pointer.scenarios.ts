import { expect } from '@playwright/test';
import { pauseClockBeforeInteraction } from '../../../../../tools/playwright/clock';
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
        const patientClick = name === 'hover-root-click';
        const cancelHover = name.endsWith('-cancel');
        if (patientClick || cancelHover) {
            await d.page.clock.install();
            await pauseClockBeforeInteraction(d.page);
        }
        if (submenu) await d.hoverItem('more');
        else await reference.hover();
        if (patientClick) await d.page.clock.runFor(300);
        if (name.endsWith('-cancel') || name.endsWith('-disabled')) {
            if (cancelHover) {
                // The native leave must precede the 180ms open delay, even when protocol calls
                // are slow. Advance the real component timers only after that trusted gesture.
                await d.page.mouse.move(700, 520);
                await d.page.clock.runFor(260);
                await d.page.clock.resume();
            } else await d.page.waitForTimeout(260);
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
        const opened = d.checkpoint('hover opened', { open: true, ...(submenu ? { subOpen: true } : {}) });
        // Keep the trusted click within the pin's real 500ms promotion window. Slow actionability
        // or checkpoint polling must not silently turn this into a different, patient-close gesture.
        if (patientClick) await d.page.clock.runFor(64);
        await opened;
        if (name.endsWith('-click')) {
            await reference.click();
            if (patientClick) await d.page.clock.resume();
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
            const start = await d.page.evaluate(() => window.menuParity.pointerMoves.length);
            await d.page.mouse.move(700, 520);
            // The element was measured above. Locator.hover() adds actionability frame waits to
            // this deliberately short return gesture, sometimes exceeding the actual close delay.
            const back = { x: from.x + from.width / 2, y: from.y + from.height / 2 };
            await d.page.mouse.move(back.x, back.y);
            const gesture = await d.page.evaluate(
                (start) => ({
                    moves: window.menuParity.pointerMoves.slice(start),
                    closeDelay: window.menuParity.config.pointer.closeDelay!
                }),
                start
            );
            const away = gesture.moves.findIndex((move) => move.clientX === 700 && move.clientY === 520);
            const returned = gesture.moves
                .slice(away + 1)
                .find((move) => Math.abs(move.clientX - back.x) <= 1 && Math.abs(move.clientY - back.y) <= 1);
            expect(away).toBeGreaterThanOrEqual(0);
            expect(returned).toBeDefined();
            const elapsed = returned!.timeStamp - gesture.moves[away].timeStamp;
            d.measurements.push({ name: 'native hover return', bounds: { ...gesture, elapsed } });
            expect(gesture.moves.every((move) => move.trusted)).toBe(true);
            expect(elapsed).toBeLessThan(gesture.closeDelay);
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
