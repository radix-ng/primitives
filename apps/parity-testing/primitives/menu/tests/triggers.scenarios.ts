import { expect } from '@playwright/test';
import { multiTriggerLifecycleConfig } from '../src/trigger-lifecycle';
import { multiTriggerCases, multiTriggerConfig } from '../src/triggers';
import type { MenuDriver } from './driver';

export const multiTriggerScenarios = multiTriggerCases
    .filter((name) => !multiTriggerLifecycleConfig(name))
    .map((name) => ({
        name,
        async run(d: MenuDriver) {
            const p = multiTriggerConfig(name)!;
            const secondary = d.item('secondary');
            const action = (label: string) => d.page.getByRole('menuitem', { name: label, exact: true });
            const snapshotsGone = () =>
                expect(d.page.locator('[data-testid="viewport"] > [data-previous]')).toHaveCount(0);
            const opened = (label: string) => expect(action(label)).toBeVisible();
            if (p.disabled) {
                const bounds = (await secondary.boundingBox())!;
                await d.page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
                await d.checkpoint('disabled trigger ignored', { open: false, payloadLabel: '' });
            }
            if (p.defaultOpen) {
                await opened('Bravo action');
                await d.checkpoint('initially associated', { open: true, payloadLabel: 'Bravo' });
                await d.page.keyboard.press('Escape');
                await d.closed();
                await d.checkpoint('initial menu closed', { open: false, focus: 'secondary' });
                return;
            }
            if (p.controlled || name === 'multi-handle-open') await d.page.keyboard.press(p.controlled ? 'F8' : 'F6');
            else if (name.endsWith('-keyboard')) await d.trigger.press('Enter');
            else await d.trigger.click();
            if (p.cancelOpen) {
                await d.checkpoint('open canceled', { open: false, payloadLabel: '' });
                return;
            }
            await opened(p.controlled || name === 'multi-handle-open' ? 'Bravo action' : 'Alpha action');
            await d.checkpoint('first trigger opened', { open: true });
            if (name === 'multi-payload-update') {
                await d.page.keyboard.press('F3');
                await opened('Updated action');
                await d.checkpoint('active payload updated', { open: true, payloadLabel: 'Updated' });
            } else if (name === 'multi-replace-root') {
                await d.page.keyboard.press('F4');
                await expect(d.popup).toHaveCount(0);
                await d.checkpoint('root removed with external triggers', { open: false });
                await d.page.keyboard.press('F6');
                await d.checkpoint('unattached handle ignored', { open: false });
                await d.page.keyboard.press('F4');
                await expect(d.item('active-payload')).toBeAttached();
                await d.checkpoint('replacement root mounted', { open: false });
                await d.page.keyboard.press('F6');
                await opened('Bravo action');
                await d.checkpoint('replacement root connected', { open: true, payloadLabel: 'Bravo' });
            } else if (name === 'multi-remove-active') {
                await d.page.keyboard.press('F10');
                await expect(d.trigger).toHaveCount(0);
                await d.checkpoint('active trigger removed');
                await secondary.press('Enter');
                await opened('Bravo action');
                await snapshotsGone();
                await d.checkpoint('surviving trigger entered', { open: true, payloadLabel: 'Bravo' });
            } else if (name === 'multi-controlled-switch') {
                await d.page.keyboard.press('F9');
                await opened('Alpha action');
                await snapshotsGone();
                await d.checkpoint('external trigger switch', { open: true, payloadLabel: 'Alpha' });
            } else if (
                !p.disabled &&
                !['multi-handle-open', 'multi-handle-close', 'multi-controlled-open', 'multi-cancel-close'].includes(
                    name
                )
            ) {
                if (name.endsWith('-keyboard')) await secondary.press('Enter');
                else await secondary.click();
                if (p.cancelSwitch || p.disabled) {
                    await d.checkpoint('second trigger rejected', { open: true, payloadLabel: 'Alpha' });
                } else {
                    await opened('Bravo action');
                    if (p.animated) {
                        const previous = d.page.locator('[data-testid="viewport"] > [data-previous]');
                        await expect(previous).toHaveCount(1);
                        await expect(previous).toHaveAttribute('data-ending-style', '');
                        await d.checkpoint('content transition pending', { open: true, payloadLabel: 'Bravo' });
                        await d.page.evaluate(() =>
                            document.getAnimations().forEach((animation) => animation.finish())
                        );
                    }
                    await snapshotsGone();
                    await d.checkpoint('second trigger owns popup', { open: true, payloadLabel: 'Bravo' });
                }
            }
            if (name === 'multi-handle-close' || name === 'multi-handle-open') await d.page.keyboard.press('F7');
            else await d.page.keyboard.press('Escape');
            if (p.cancelClose) {
                await d.checkpoint('close canceled', { open: true, payloadLabel: 'Alpha' });
                return;
            }
            if (name === 'multi-remove-active') {
                await expect(d.popup).toHaveCount(0);
            } else await d.closed();
            await d.checkpoint('closed with active trigger');
            if (p.retained) {
                await d.trigger.press('Enter');
                await opened('Alpha action');
                await d.checkpoint('retained session changed trigger', { open: true, payloadLabel: 'Alpha' });
                await action('Alpha action').press('Enter');
                await d.closed();
                await d.checkpoint('selected from retained popup', {
                    open: false,
                    selected: ['Alpha action'],
                    focus: 'primary'
                });
            }
        }
    }));
