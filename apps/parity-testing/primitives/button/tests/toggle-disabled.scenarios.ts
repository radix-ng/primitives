import { expect } from '@playwright/test';
import { toggleCases } from '../src/toggle';
import type { ButtonDriver } from './driver';

export const toggleDisabledScenarios = Object.entries(toggleCases)
    .filter(([, settings]) => settings.toggle?.action === 'disabled')
    .map(([name, settings]) => ({
        name,
        async run(d: ButtonDriver) {
            const p = settings.toggle!;
            const native = settings.host === 'button';
            const target = d.page.getByTestId('subject');
            let focusable = p.focusable!;
            let epoch = 0;
            const command = async (key: string) => {
                await d.page.keyboard.press(key);
                await expect(d.page.getByTestId('toggle-epoch')).toHaveText(String(++epoch));
            };
            const semantic = (disabled: boolean) => ({
                host: expect.objectContaining({
                    disabled: native && disabled && !focusable,
                    ariaDisabled: disabled,
                    dataDisabled: disabled
                })
            });
            const zero = {
                clicks: [],
                submits: [],
                resets: 0,
                hash: '',
                scrolled: false,
                pressed: false,
                toggleChanges: []
            };
            await d.checkpoint('disabled Toggle has composed button semantics', {
                ...zero,
                ...semantic(true),
                tabStops: [0, -1, -1]
            });
            const inspectDisabled = async (expected: Record<string, unknown>) => {
                await d.page.getByTestId('before').focus();
                await d.pointerClick();
                await expect(d.page.getByTestId('before')).toBeFocused();
                await d.page.getByTestId('first').focus();
                await d.page.keyboard.press('ArrowRight');
                if (focusable) {
                    await expect(target).toBeFocused();
                    await d.page.keyboard.press('Enter');
                    await d.page.keyboard.press('Space');
                    await d.checkpoint('focusable disabled Toggle stays inert', {
                        ...expected,
                        ...semantic(true),
                        focus: 'subject',
                        tabStops: [-1, 0, -1]
                    });
                    await d.page.keyboard.press('ArrowRight');
                }
                await expect(d.page.getByTestId('last')).toBeFocused();
                await d.checkpoint('disabled Toggle retains navigation or is skipped', {
                    ...expected,
                    ...semantic(true),
                    focus: 'last',
                    tabStops: [-1, -1, 0]
                });
                await d.page.keyboard.press('Tab');
                await expect(d.page.getByTestId('after')).toBeFocused();
            };
            await inspectDisabled(zero);
            await command('F6');
            await expect(target).not.toHaveAttribute('data-disabled');
            await target.focus();
            await d.page.keyboard.press('Space');
            const change = (pressed: boolean, trusted: boolean) => ({
                pressed,
                type: 'click',
                reason: 'none',
                trusted,
                shift: false,
                ctrl: false
            });
            const one = {
                ...zero,
                pressed: true,
                toggleChanges: [change(true, false)],
                clicks: [expect.objectContaining({ target: 'subject', trusted: false })]
            };
            await d.checkpoint('enabled Toggle resumes activation', { ...one, ...semantic(false) });
            await command('F6');
            await expect(target).toHaveAttribute('data-disabled');
            // The pin may briefly set native disabled before its layout repair, blurring a button.
            // Re-enter focus explicitly to test the resulting focusable policy on both frameworks.
            if (focusable) {
                await expect(target).not.toHaveAttribute('disabled');
                await target.focus();
                await expect(target).toBeFocused();
            }
            await d.checkpoint('disabled Toggle supports focus re-entry', {
                ...one,
                ...semantic(true),
                ...(focusable ? { focus: 'subject' } : {})
            });
            await inspectDisabled(one);
            // The pin can retain a stale native disabled attribute when this flag changes while
            // already disabled. Change policy between enabled cycles to compare the stable contract.
            await command('F6');
            await expect(target).not.toHaveAttribute('data-disabled');
            await command('F7');
            focusable = !focusable;
            await command('F6');
            await expect(target).toHaveAttribute('data-disabled');
            await d.checkpoint('next disabled cycle uses the updated focusable policy', { ...one, ...semantic(true) });
            await inspectDisabled(one);
            await command('F6');
            await expect(target).not.toHaveAttribute('data-disabled');
            await target.focus();
            await d.page.keyboard.press('Enter');
            await d.checkpoint('reenabled Toggle preserves pressed and changes once', {
                ...zero,
                ...semantic(false),
                pressed: false,
                toggleChanges: [change(true, false), change(false, native)],
                clicks: [
                    expect.objectContaining({ target: 'subject', trusted: false }),
                    expect.objectContaining({ target: 'subject', trusted: native })
                ]
            });
        }
    }));
