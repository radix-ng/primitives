import type { Locator, Page } from '@playwright/test';

/** Real Chromium touch input. Browser scrolling/click synthesis and pointercancel remain native. */
export async function touchGesture(page: Page, target: Locator | { x: number; y: number }, kind: 'cancel' | 'pan') {
    let point: { x: number; y: number };
    if ('x' in target) point = target;
    else {
        const box = await target.boundingBox();
        if (!box) throw new Error('Touch target has no bounds');
        point = { x: Math.round(box.x + box.width / 2), y: Math.round(box.y + box.height / 2) };
    }
    const session = await page.context().newCDPSession(page);
    try {
        await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...point, id: 1 }] });
        if (kind === 'pan') {
            for (const delta of [20, 40, 70, 100])
                await session.send('Input.dispatchTouchEvent', {
                    type: 'touchMove',
                    touchPoints: [{ x: point.x, y: point.y - delta, id: 1 }]
                });
        }
        await session.send('Input.dispatchTouchEvent', {
            type: kind === 'cancel' ? 'touchCancel' : 'touchEnd',
            touchPoints: []
        });
    } finally {
        await session.detach();
    }
}
