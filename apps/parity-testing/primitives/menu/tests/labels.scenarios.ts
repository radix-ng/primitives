import { expect } from '@playwright/test';
import { labelCases, labelConfig } from '../src/labels';
import type { MenuDriver } from './driver';

export const labelScenarios = labelCases.map((name) => ({
    name,
    async run(d: MenuDriver) {
        const p = labelConfig(name)!;
        await d.open('Enter');
        const group = d.item('group');
        const record = async (phase: string, expectedId: string | undefined, expectedName: string) => {
            const label = expectedName === 'Alternative' ? d.item('secondary-label') : d.item('label');
            if (expectedName) {
                await expect(label).toHaveAttribute('aria-hidden', 'true');
                if (expectedId) await expect(label).toHaveAttribute('id', expectedId);
                else {
                    await expect(label).toHaveAttribute('id', /.+/);
                    await expect(label).not.toHaveAttribute('id', 'renamed-label');
                }
                await expect
                    .poll(
                        async () => (await group.getAttribute('aria-labelledby')) === (await label.getAttribute('id'))
                    )
                    .toBe(true);
            } else await expect(group).not.toHaveAttribute('aria-labelledby');
            await expect(group).toHaveAccessibleName(expectedName);
            const raw = await group.evaluate((node) => ({
                labelId: node.getAttribute('aria-labelledby'),
                labels: [...node.querySelectorAll('[data-testid$="label"]')].map((label) => ({
                    id: label.id,
                    hidden: label.getAttribute('aria-hidden'),
                    text: label.textContent
                }))
            }));
            d.measurements.push({ name: phase, bounds: raw });
            d.checkpoints.push({
                name: phase,
                state: {
                    role: await group.getAttribute('role'),
                    labelId: expectedName && !expectedId ? !!raw.labelId : raw.labelId,
                    associated: !!raw.labelId && raw.labels.some((label) => label.id === raw.labelId),
                    labels: raw.labels.map((label) => ({ hidden: label.hidden, text: label.text }))
                }
            });
        };
        await record('initial group name', p.generated ? undefined : 'custom-label', 'Planets');
        await d.page.keyboard.press('F3');
        await record('reactive label id', 'renamed-label', 'Planets');
        if (p.replace) {
            await d.page.keyboard.press('F6');
            await record('new label owns association', 'secondary-label', 'Alternative');
            await d.page.keyboard.press('F4');
            await record('older label removed', 'secondary-label', 'Alternative');
            await d.page.keyboard.press('F6');
            await record('last label removed', undefined, '');
            await d.page.keyboard.press('F4');
            await record('label recreated', 'renamed-label', 'Planets');
        } else {
            await d.page.keyboard.press('F3');
            await record('generated fallback restored', undefined, 'Planets');
        }
        await expect(d.item('alpha')).toBeFocused();
        await d.page.keyboard.press('Escape');
        await d.closed();
        await d.checkpoint('closed after label changes');
        expect(d.errors).toEqual([]);
    }
}));
