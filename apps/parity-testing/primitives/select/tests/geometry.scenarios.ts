import { expect } from '@playwright/test';
import { geometryNames, sizingNames } from '../src/geometry';
import type { Scenario } from './scenario';

export const geometryScenarios: Scenario[] = geometryNames
    .filter((name) => !sizingNames.some((sizing) => sizing === name))
    .map((fixture) => ({
        name: `geometry: ${fixture.slice('geometry-'.length)}`,
        fixture,
        viewport: { width: 640, height: 480 },
        async run(d) {
            if (fixture.endsWith('-scroll')) await d.scrollAncestor();
            await d.open();
            await d.geometry('initial layout');
            if (fixture === 'geometry-aligned-middle' || fixture === 'geometry-aligned-rtl')
                await d.alignment('selected text in constrained viewport', 'item', fixture === 'geometry-aligned-rtl');
            await d.checkpoint('positioned', { open: true });
            if (fixture === 'geometry-anchor-scroll') {
                await d.scrollAncestor();
                await d.anchorGap('follows scrolling anchor');
                await d.checkpoint('ancestor scrolled', { open: true });
            }
            if (fixture.endsWith('-portal')) {
                await expect(d.page.getByTestId('portal-host').getByTestId('positioner')).toHaveCount(1);
            } else if (fixture.endsWith('-clipped')) {
                // The portal must escape the clipping ancestor, not merely fit inside it.
                await expect(d.page.getByTestId('scroller').getByTestId('positioner')).toHaveCount(0);
            }
            await d.key('End');
            await d.highlighted('item-39');
            await d.geometry('last option visible', 'item-39');
            await d.key('Home');
            await d.highlighted('item-0');
            await d.geometry('first option visible', 'item-0');
            await d.key('Enter');
            await d.closed(true);
            await d.checkpoint('selected', { open: false, label: 'Item 00', entries: [['choice', 'item-0']] });
        }
    }));

geometryScenarios.push({
    name: 'geometry: scroll arrows start and stop',
    fixture: 'geometry-aligned-top',
    viewport: { width: 640, height: 480 },
    async run(d) {
        await d.page.clock.install();
        await d.open();
        await d.key('Home');
        await d.geometry('first option', 'item-0');
        await expect(d.page.getByTestId('scroll-up')).toBeHidden();
        const down = d.page.getByTestId('scroll-down');
        await expect(down).toBeVisible();
        const before = await d.page.getByTestId('list').evaluate((el) => el.scrollTop);
        await d.page.evaluate(() => {
            const moves: { x: number; y: number; dx: number; dy: number; trusted: boolean }[] = [];
            Object.assign(window, { parityMoves: moves });
            document.addEventListener(
                'mousemove',
                (event) =>
                    moves.push({
                        x: event.clientX,
                        y: event.clientY,
                        dx: event.movementX,
                        dy: event.movementY,
                        trusted: event.isTrusted
                    }),
                { passive: true }
            );
        });
        await down.hover();
        const bounds = (await down.boundingBox())!;
        // Base UI ignores the stationary entry move; exercise real travel over the button.
        await d.page.mouse.move(bounds.x + bounds.width / 2 + 3, bounds.y + bounds.height / 2);
        await d.page.clock.runFor(150);
        d.measurements.push({
            name: 'native hover moves',
            bounds: await d.page.evaluate(() => Reflect.get(window, 'parityMoves'))
        });
        // The pin rejects all zero-delta MouseEvents from native WebKit input. Keep the
        // Angular contract asserted there and record the precise reference failure below.
        const referenceHoverGap =
            d.framework === 'react' && d.page.context().browser()!.browserType().name() === 'webkit';
        if (!referenceHoverGap)
            await expect.poll(() => d.page.getByTestId('list').evaluate((el) => el.scrollTop)).toBeGreaterThan(before);
        await d.page.mouse.move(0, 0);
        await d.page.clock.runFor(100);
        const stopped = await d.page.getByTestId('list').evaluate((el) => el.scrollTop);
        await d.page.clock.runFor(300);
        expect(await d.page.getByTestId('list').evaluate((el) => el.scrollTop)).toBe(stopped);
        await d.checkpoint(
            'hover scrolled',
            { open: true, entries: [['choice', 'item-1']], listScrolled: !referenceHoverGap },
            before
        );
        await d.key('End');
        await d.geometry('last option', 'item-39');
        // The reference's nearest-focus scroll can leave its 4px bottom padding unscrolled.
        // A native wheel reaches the actual scroll edge on both implementations.
        const listBounds = (await d.page.getByTestId('list').boundingBox())!;
        await d.page.mouse.move(listBounds.x + listBounds.width / 2, listBounds.y + listBounds.height / 2);
        await d.page.mouse.wheel(0, 200);
        await d.page.clock.runFor(200);
        await expect(d.page.getByTestId('scroll-down')).toBeHidden();
        await expect(d.page.getByTestId('scroll-up')).toBeVisible();
    }
});
