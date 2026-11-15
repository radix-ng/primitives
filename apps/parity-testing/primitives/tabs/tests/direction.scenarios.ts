import { expect } from '@playwright/test';
import type { Change } from '../src/contract';
import { directionCases, type DirectionCaseName } from '../src/direction';
import type { TabsDriver } from './driver';

export const directionScenarios = (Object.keys(directionCases) as DirectionCaseName[]).map((name) => ({
    name,
    async run(driver: TabsDriver) {
        const settings = directionCases[name];
        const options = settings.options;
        const direction = settings.direction!;
        const changes: Change[] = [];
        const forward =
            direction.kind === 'equal'
                ? 'none'
                : direction.orientation === 'vertical'
                  ? 'down'
                  : direction.dir === 'rtl'
                    ? 'left'
                    : 'right';
        const backward = direction.orientation === 'vertical' ? 'up' : direction.dir === 'rtl' ? 'right' : 'left';
        const checkpoint = (label: string, movement: string, value: string | number | null) =>
            driver.directionCheckpoint(label, movement, value, changes);
        const command = async (key: string) => {
            await driver.resetDirectionFrames();
            await driver.page.keyboard.press(key);
        };
        await checkpoint('initial direction', 'none', settings.value ?? options[0].value);

        if (direction.kind === 'equal') {
            await driver.resetDirectionFrames();
            await driver.page.getByTestId(`tab-${options[1].value}`).press('Enter');
            changes.push({ value: options[1].value, reason: 'none', activationDirection: 'none', canceled: false });
            await checkpoint('native activation at equal coordinates has no direction', 'none', options[1].value);
        }

        if (direction.kind === 'cancel') {
            await driver.resetDirectionFrames();
            await driver.page.getByTestId(`tab-${options[1].value}`).click();
            changes.push({ value: options[1].value, reason: 'none', activationDirection: forward, canceled: true });
            await checkpoint('canceled request leaves direction unchanged', 'none', options[0].value);
        }
        if (direction.kind?.startsWith('insert-')) {
            await command('F6');
            await checkpoint(
                'new tab selected in the same update',
                forward,
                direction.kind === 'insert-number' ? 0 : 'Account'
            );
            await command('F3');
            await checkpoint('return from inserted tab', backward, options[0].value);
            return;
        }
        if (direction.kind === 'initial-missing') {
            await command('F10');
            await checkpoint('both initially missing endpoints have no direction', 'none', 'Unknown');
            await command('F3');
            await checkpoint('registered destination resolves initial missing origin', 'right', options[0].value);
            return;
        }
        if (direction.kind === 'missing') {
            await command('F9');
            await checkpoint('missing destination falls back to comparable values', 'left', 'Missing');
            await command('F10');
            await checkpoint('pending destination keeps last registered origin', 'right', 'Unknown');
            await command('F3');
            await checkpoint('return to pending origin preserves last direction', 'right', options[0].value);
            return;
        }
        if (direction.kind === 'focus-inside') await driver.page.getByTestId(`tab-${options[0].value}`).focus();
        else await driver.page.getByTestId('outside').focus();
        if (direction.kind === 'fallback') {
            await driver.resetDirectionFrames();
            await driver.page.getByTestId(`tab-${options[1].value}`).press('Enter');
            changes.push({ value: options[1].value, reason: 'none', activationDirection: forward, canceled: false });
            await checkpoint('accepted request establishes direction', forward, options[1].value);
            await command('F8');
            changes.push({ value: options[0].value, reason: 'disabled', activationDirection: 'none', canceled: false });
            await checkpoint('automatic fallback resets direction', 'none', options[0].value);
            return;
        }
        await command('F2');
        await checkpoint('external forward selection', forward, options[1].value);
        if (direction.kind === 'focus-inside') {
            await expect(driver.page.getByTestId(`tab-${options[0].value}`)).toBeFocused();
            await command('ArrowRight');
            await expect(driver.page.getByTestId(`tab-${options[1].value}`)).toBeFocused();
            await checkpoint('navigation continues from actual focus', forward, options[1].value);
        }
        if (direction.kind === 'focus-outside') {
            await expect(driver.page.getByTestId('outside')).toBeFocused();
            await expect(driver.page.getByTestId(`tab-${options[1].value}`)).toHaveAttribute('tabindex', '0');
        }
        if (direction.kind === 'null') {
            await command('F4');
            await checkpoint('clear selection resets direction', 'none', null);
            await command('F5');
            await checkpoint('restore after null has no direction', 'none', options[1].value);
        }
        await command('F3');
        await checkpoint(
            'external backward selection',
            direction.kind === 'equal' ? 'none' : backward,
            options[0].value
        );
        if (!direction.kind) {
            await driver.resetDirectionFrames();
            await driver.page.getByTestId(`tab-${options[1].value}`).press('Enter');
            changes.push({ value: options[1].value, reason: 'none', activationDirection: forward, canceled: false });
            await checkpoint('accepted native request establishes the next origin', forward, options[1].value);
            await command('F3');
            await checkpoint('external change after accepted request', backward, options[0].value);
        }
    }
}));
