import { expect } from '@playwright/test';
import { handleOverlapCases } from '../src/handle-overlap';
import type { MenuDriver } from './driver';

async function open(d: MenuDriver, owner: 'older' | 'newer', native = false) {
    if (native) await d.trigger.press('Enter');
    else await d.page.keyboard.press('F6');
    await expect(owner === 'older' ? d.popup : d.subPopup).toBeVisible();
    await expect
        .poll(() =>
            d.page.evaluate((layer) => window.menuParity.completions[layer].at(-1), owner === 'older' ? 'main' : 'sub')
        )
        .toBe(true);
    await d.checkpoint(`${owner} opened`, { handleOpen: true, expanded: 'true' });
}
async function close(d: MenuDriver, owner: 'older' | 'newer') {
    await d.page.keyboard.press('F7');
    await expect(owner === 'older' ? d.popup : d.subPopup).toHaveCount(0);
    await expect
        .poll(() =>
            d.page.evaluate((layer) => window.menuParity.completions[layer].at(-1), owner === 'older' ? 'main' : 'sub')
        )
        .toBe(false);
    await d.checkpoint(`${owner} closed`, { handleOpen: false });
}

export const handleOverlapScenarios = handleOverlapCases.map((name) => ({
    name,
    async run(d: MenuDriver) {
        if (name === 'handle-overlap-open-owner') {
            await open(d, 'older');
            await d.page.keyboard.press('F4');
            await expect(d.item('newer-payload')).toHaveCount(1);
            await expect(d.popup).toBeVisible();
            await d.checkpoint('new owner is closed while previous owner stays open', {
                handleOpen: false,
                expanded: 'false'
            });
            await d.page.keyboard.press('F4');
            await expect(d.item('newer-payload')).toHaveCount(0);
            await d.checkpoint('open owner restored', { handleOpen: true, expanded: 'true' });
            await close(d, 'older');
            return;
        }
        await d.page.keyboard.press('F4');
        await expect(d.item('newer-payload')).toHaveCount(1);
        await d.checkpoint('newest owner attached', { handleOpen: false });
        await open(d, 'newer');
        await close(d, 'newer');
        let owner: 'older' | 'newer' = 'older';
        if (name === 'handle-overlap-remove-older') {
            await d.page.keyboard.press('F5');
            await expect(d.item('older-payload')).toHaveCount(0);
            owner = 'newer';
        } else if (name === 'handle-overlap-rebind') {
            await d.page.keyboard.press('F2');
        } else if (name === 'handle-overlap-detach-all') {
            await d.page.keyboard.press('F8');
            await expect(d.item('older-payload')).toHaveCount(0);
            await expect(d.item('newer-payload')).toHaveCount(0);
            await d.page.keyboard.press('F6');
            await d.page.keyboard.press('F7');
            await d.checkpoint('no owner ignores actions', { handleOpen: false });
            await d.page.keyboard.press('F9');
            await expect(d.item('older-payload')).toHaveCount(1);
        } else {
            if (name === 'handle-overlap-replace-trigger') {
                await d.page.keyboard.press('F3');
                await expect(d.trigger).toHaveText('Updated');
                const old = await d.trigger.elementHandle();
                await d.page.keyboard.press('F10');
                await expect.poll(() => old!.evaluate((element) => element.isConnected)).toBe(false);
                await expect(d.trigger).toBeVisible();
            }
            await d.page.keyboard.press('F4');
            await expect(d.item('newer-payload')).toHaveCount(0);
        }
        await d.checkpoint('surviving owner connected', { handleOpen: false });
        await open(d, owner, true);
        await expect(d.item(`${owner}-payload`)).toHaveText(
            name === 'handle-overlap-replace-trigger' ? 'Updated' : 'Alpha'
        );
        await close(d, owner);
        if (name === 'handle-overlap-rebind') {
            await d.page.keyboard.press('F2');
            await d.checkpoint('newest owner reattached', { handleOpen: false });
            await open(d, 'newer');
            await close(d, 'newer');
        }
    }
}));
