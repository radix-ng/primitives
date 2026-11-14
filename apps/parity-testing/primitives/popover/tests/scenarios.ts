import { expect } from '@playwright/test';
import { basicCases, type CaseName } from '../src/contract';
import type { PopoverDriver } from './driver';
import { lifecycleScenarios } from './lifecycle.scenarios';

export const scenarios = [
    ...basicCases.map((name) => ({
        name,
        async run(d: PopoverDriver) {
            if (name === 'disabled') {
                const box = (await d.trigger.boundingBox())!;
                await d.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
                await d.checkpoint('ignored', { open: false, disabled: true, changes: [], completions: [] });
                return;
            }
            if (name === 'cancel-open') {
                await d.trigger.press('Enter');
                await d.checkpoint('canceled', { open: false, mounted: false, completions: [] });
                return;
            }
            await d.open(['pointer-close', 'trigger-toggle', 'outside', 'modal'].includes(name));
            await d.checkpoint('opened', {
                open: true,
                visible: true,
                role: 'dialog',
                labelled: true,
                described: true,
                value: 'draft'
            });
            if (name === 'cancel-close') {
                await d.page.keyboard.press('Escape');
                await d.checkpoint('escape canceled', { open: true, completions: [true] });
                await d.page.getByTestId('close').click();
                await d.checkpoint('close canceled', { open: true, completions: [true] });
                return;
            }
            if (name.startsWith('secondary-outside')) {
                await d.page.mouse.click(5, 5, { button: 'right' });
                if (name === 'secondary-outside-trap-focus') {
                    await d.closed();
                    await d.checkpoint('secondary outside press closes trapping popup', { open: false });
                } else {
                    await d.checkpoint('secondary outside press awaits intentional click', { open: true });
                }
                return;
            }
            if (name === 'trap-focus') {
                await expect(d.page.getByTestId('field')).toBeFocused();
                await d.page.keyboard.press('Shift+Tab');
                await expect(d.page.getByTestId('close')).toBeFocused();
                await d.page.keyboard.press('Tab');
                await expect(d.page.getByTestId('field')).toBeFocused();
                await d.checkpoint('trapped', { open: true, focus: 'field' });
            }
            if (name === 'initial-focus') await expect(d.page.getByTestId('field')).toBeFocused();
            if (name === 'switch-trigger') {
                await d.page.getByTestId('secondary').press('Enter');
                await d.checkpoint('switched', { open: true, expanded: ['secondary'] });
            }
            if (name === 'edit') {
                await d.page.getByTestId('field').fill('edited');
                await d.checkpoint('edited', { open: true, value: 'edited', focus: 'field' });
            }
            if (name === 'tracking' || name === 'frozen') {
                const initial = await d.bounds('initial layout');
                await d.page.keyboard.press('F6');
                await expect
                    .poll(async () => (await d.bounds('live layout')).trigger.x)
                    .toBeGreaterThan(initial.trigger.x + 20);
                await expect
                    .poll(async () => {
                        const now = await d.bounds('settled layout');
                        return Math.abs(now.popup.x - initial.popup.x - (name === 'frozen' ? 0 : 32));
                    })
                    .toBeLessThanOrEqual(2);
                await d.page.keyboard.press('F2');
                await d.checkpoint('layout changed', { open: true });
            }
            if (name === 'clipping') {
                const scroller = d.page.getByTestId('scroller');
                const r = (await scroller.boundingBox())!;
                await d.page.mouse.move(r.x + r.width - 20, r.y + 10);
                await expect
                    .poll(
                        async () => {
                            await d.page.mouse.wheel(0, 20);
                            const b = (await d.trigger.boundingBox())!;
                            return b.y + b.height < r.y;
                        },
                        { intervals: [100] }
                    )
                    .toBe(true);
                await d.checkpoint('clipped', { open: true, visible: true, anchorHidden: true });
                await expect
                    .poll(
                        async () => {
                            await d.page.mouse.wheel(0, -40);
                            return scroller.evaluate((el) => el.scrollTop);
                        },
                        { intervals: [100] }
                    )
                    .toBe(0);
                await d.checkpoint('restored', { open: true, anchorHidden: false });
            }
            if (['outside', 'modal', 'trap-focus'].includes(name)) {
                await d.outside();
                await d.closed();
                await d.checkpoint('outside closed', { open: false, activations: name === 'modal' ? 0 : 1 });
                return;
            }
            if (name === 'pointer-close') await d.page.getByTestId('close').click();
            else if (name === 'trigger-toggle') await d.trigger.click();
            else await d.page.keyboard.press('Escape');
            await d.closed();
            await d.checkpoint('closed', { open: false, mounted: false });
        }
    })),
    ...lifecycleScenarios
] satisfies { name: CaseName; run(d: PopoverDriver): Promise<void> }[];
