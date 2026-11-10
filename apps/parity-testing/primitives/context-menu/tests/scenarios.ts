import { expect } from '@playwright/test';
import { MenuFamilyDriver } from '../../../shared/menu-family-driver';
import { cases } from '../src/contract';
export class ContextMenuDriver extends MenuFamilyDriver {
    constructor(page: ConstructorParameters<typeof MenuFamilyDriver>[0], framework: 'angular' | 'react') {
        super(page, framework, 'contextMenuParity');
    }
    override async checkpoint(name: string, expected: Record<string, unknown> = {}) {
        await super.checkpoint(name, expected);
        this.checkpoints.at(-1)!.state.pressed =
            (await this.page.getByTestId('area').getAttribute('data-pressed')) !== null;
    }
    async touch(name: string) {
        const area = this.page.getByTestId('area'),
            popup = this.page.getByTestId('context-popup');
        if (name === 'touch-tap') {
            await area.tap();
            await this.page.waitForTimeout(650);
            await this.checkpoint('short tap canceled', { open: [], mounted: [] });
            return;
        }
        const b = (await area.boundingBox())!;
        const origin = { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2), id: 1 };
        const session = await this.page.context().newCDPSession(this.page);
        try {
            await session.send('Input.dispatchTouchEvent', {
                type: 'touchStart',
                touchPoints: name === 'touch-multitouch' ? [origin, { ...origin, x: origin.x + 20, id: 2 }] : [origin]
            });
            if (name === 'touch-drift' || name === 'touch-diagonal-slop') {
                await session.send('Input.dispatchTouchEvent', {
                    type: 'touchMove',
                    touchPoints: [
                        {
                            ...origin,
                            x: origin.x + (name === 'touch-drift' ? 20 : 9),
                            y: origin.y + (name === 'touch-drift' ? 0 : 9)
                        }
                    ]
                });
            }
            if (name === 'touch-cancel')
                await session.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
            const opens = name === 'touch-long-press' || name === 'touch-diagonal-slop';
            if (opens) {
                await expect(popup).toBeVisible();
                await expect
                    .poll(() => this.page.evaluate(() => window.contextMenuParity.completions.context.at(-1)))
                    .toBe(true);
                await this.checkpoint('long press opened', {
                    open: ['context'],
                    focus: 'context-popup',
                    highlighted: [],
                    selected: []
                });
                const box = (await popup.boundingBox())!;
                this.measurements.push({ name: 'touch anchor', origin, popup: box });
                expect(Math.abs(box.x - (origin.x + 14))).toBeLessThanOrEqual(2);
                expect(Math.abs(box.y - origin.y)).toBeLessThanOrEqual(2);
            } else {
                await this.page.waitForTimeout(650);
                await this.checkpoint('long press canceled', { open: [], mounted: [] });
            }
            if (name !== 'touch-cancel')
                await session.send('Input.dispatchTouchEvent', {
                    type: name === 'touch-diagonal-slop' ? 'touchCancel' : 'touchEnd',
                    touchPoints: []
                });
            await this.checkpoint('touch released', { open: opens ? ['context'] : [], selected: [] });
            if (opens) {
                await this.page.keyboard.press('Escape');
                await expect(popup).toHaveCount(0);
                await this.checkpoint('closed', { open: [] });
            }
        } finally {
            await session
                .send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
                .catch(() => undefined);
            await session.detach();
        }
    }
}
export const scenarios = cases.map((name) => ({
    name,
    async run(d: ContextMenuDriver) {
        const area = d.page.getByTestId('area'),
            popup = d.page.getByTestId('context-popup');
        if (name.startsWith('touch-')) {
            await d.touch(name);
            return;
        }
        if (name.startsWith('keyboard-')) {
            // No preceding pointer gesture: test keyboard opening after the old pointer window.
            await d.page.waitForTimeout(350);
            await area.focus();
            await d.page.keyboard.press(name === 'keyboard-context' ? 'ContextMenu' : 'Shift+F10');
            await expect(popup).toBeVisible();
            await d.checkpoint('keyboard opened', { open: ['context'], focus: 'context-popup', highlighted: [] });
            await d.page.keyboard.press('ArrowDown');
            await d.checkpoint('keyboard navigated', {
                open: ['context'],
                focus: 'context-alpha',
                highlighted: ['context-alpha']
            });
            await d.page.keyboard.press('Escape');
            await expect(popup).toHaveCount(0);
            await d.checkpoint('closed', { open: [], focus: 'area' });
            return;
        }
        if (name === 'return-focus') {
            await d.page.getByTestId('before').focus();
            await d.checkpoint('previous focus', { focus: 'before' });
        }
        if (name === 'right-release') {
            const box = (await area.boundingBox())!;
            await d.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await d.page.mouse.down({ button: 'right' });
            await expect(popup).toBeVisible();
            await d.page.waitForTimeout(240);
            const item = (await d.page.getByTestId('context-alpha').boundingBox())!;
            await d.page.mouse.move(item.x + item.width / 2, item.y + item.height / 2, { steps: 3 });
            await d.page.mouse.up({ button: 'right' });
            const selects = process.platform === 'darwin';
            if (selects) await expect(popup).toHaveCount(0);
            await d.checkpoint('right release', {
                open: selects ? [] : ['context'],
                selected: selects ? ['context-alpha'] : []
            });
            return;
        }
        const origin = (await area.boundingBox())!;
        await d.page.mouse.click(origin.x + 30, origin.y + 15, { button: 'right' });
        if (name === 'disabled' || name === 'cancel-open') {
            await d.checkpoint('opening blocked', { open: [], mounted: [] });
            return;
        }
        await expect(popup).toBeVisible();
        await expect.poll(() => d.page.evaluate(() => window.contextMenuParity.completions.context.at(-1))).toBe(true);
        await d.checkpoint('opened', { open: ['context'], selected: [] });
        if (name === 'point-anchor' || name === 'repeat-open') {
            const areaBox = (await area.boundingBox())!;
            const box = (await popup.boundingBox())!;
            d.measurements.push({
                name: 'point anchor',
                pointer: { x: areaBox.x + 30, y: areaBox.y + 15 },
                popup: box
            });
            expect(Math.abs(box.x - (areaBox.x + 34))).toBeLessThanOrEqual(2);
            expect(Math.abs(box.y - (areaBox.y + 15))).toBeLessThanOrEqual(2);
            if (name === 'repeat-open') {
                await d.page.keyboard.press('Escape');
                await expect(popup).toHaveCount(0);
                await d.page.mouse.click(areaBox.x + 60, areaBox.y + 30, { button: 'right' });
                await expect
                    .poll(async () => Math.round((await popup.boundingBox())!.x))
                    .toBe(Math.round(areaBox.x + 64));
                await d.checkpoint('repositioned', { open: ['context'] });
            }
        }
        if (name === 'select') await d.page.getByTestId('context-alpha').press('Enter');
        else if (name === 'outside') {
            const box = (await d.page.getByTestId('outside').boundingBox())!;
            await d.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        } else await d.page.keyboard.press('Escape');
        if (name === 'cancel-close') {
            await d.checkpoint('close canceled', { open: ['context'] });
            return;
        }
        if (name === 'keep-mounted') await expect(popup).toBeHidden();
        else await expect(popup).toHaveCount(0);
        await d.checkpoint('closed', {
            open: [],
            mounted: name === 'keep-mounted' ? ['context'] : [],
            selected: name === 'select' ? ['context-alpha'] : []
        });
    }
}));
