import { expect } from '@playwright/test';
import { focusBoundaryConfig } from '../src/focus-boundary';
import type { MenuDriver } from './driver';

export async function runFocusTarget(d: MenuDriver, settings: NonNullable<ReturnType<typeof focusBoundaryConfig>>) {
    const target = settings.target!;
    const nested = target.layer === 'sub';
    const targetId = nested ? 'child-final' : 'root-final';
    for (let session = 1; session <= (settings.retained ? 2 : 1); session++) {
        await d.open();
        if (nested) await d.openSub();
        await expect(d.item(targetId)).toBeVisible();
        await d.checkpoint(`session ${session} target policy ready`, { focus: nested ? 'sub-alpha' : 'alpha' });
        if (target.removal === 'before') {
            await d.page.keyboard.press('F3');
            await expect(d.item(targetId)).toHaveCount(0);
            await d.checkpoint(`session ${session} target removed before close`, {
                focus: nested ? 'sub-alpha' : 'alpha',
                open: true,
                subOpen: nested
            });
        }
        if (target.key === 'outside') await d.outside();
        else await d.page.keyboard.press(target.key);
        if (target.removal) await expect(d.item(targetId)).toHaveCount(0);
        const rootClosed = !nested || target.key === 'outside';
        const defaultTarget = rootClosed ? 'primary' : 'more';
        const focus =
            target.key === 'Tab'
                ? 'after'
                : target.key === 'Shift+Tab'
                  ? 'more'
                  : target.policy === 'callback-undefined'
                    ? target.key === 'outside'
                        ? 'outside'
                        : 'body'
                    : target.policy === 'detached' || target.policy === 'callback-detached'
                      ? 'body'
                      : defaultTarget;
        const finalFocusCalls = target.policy.startsWith('callback-')
            ? Array.from({ length: session }, () => ({
                  layer: target.layer,
                  // The pin loses the close type for a child closed by its parent's outside press.
                  // Keep the actual callback payload in observations; exact exceptions audit that pair.
                  type: target.key === 'outside' ? (nested && d.framework === 'react' ? '' : 'mouse') : 'keyboard'
              }))
            : [];
        await d.checkpoint(`session ${session} target policy applied`, {
            open: !rootClosed,
            subOpen: false,
            focus,
            finalFocusCalls
        });
        if (!rootClosed) await d.trigger.click();
        await d.closed();
        await d.checkpoint(`session ${session} target policy settled`, { open: false, finalFocusCalls });
        if (target.removal) {
            await d.page.keyboard.press('F4');
            await expect(d.item('root-final')).toBeVisible();
        }
    }
}
