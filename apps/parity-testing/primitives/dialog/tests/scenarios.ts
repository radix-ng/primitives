import { expect } from '@playwright/test';
import type { CaseName } from '../src/contract';
import type { DialogDriver } from './driver';

const closed = { open: false, mounted: false, visible: false, expanded: [] };
const primaryOpen = {
    open: true,
    mounted: true,
    visible: true,
    backdrop: true,
    role: 'dialog',
    backgroundIsolated: true,
    scrollLocked: true,
    expanded: ['primary'],
    controls: ['primary'],
    labelledBy: 'Example dialog',
    describedBy: 'Test a draft edit.'
};

type Scenario = { name: CaseName; run: (driver: DialogDriver) => Promise<void> };

const ownership: Scenario[] = [
    {
        name: 'initial-open',
        async run(d) {
            await d.opened();
            await d.checkpoint('default open', { ...primaryOpen, changes: [] });
            await d.page.keyboard.press('F3');
            await d.checkpoint('changed default is ignored', { ...primaryOpen, changes: [] });
            await d.page.keyboard.press('Escape');
            await d.closed();
            await d.page.keyboard.press('F3');
            await d.checkpoint('default does not reopen', closed);
        }
    },
    {
        name: 'late-default',
        async run(d) {
            await d.checkpoint('initially closed', { ...closed, changes: [], completions: [] });
            await d.page.keyboard.press('F3');
            await d.checkpoint('late default', { ...closed, changes: [], completions: [] });
            await d.open();
            await d.checkpoint('trigger can still open', primaryOpen);
        }
    },
    {
        name: 'controlled-false',
        async run(d) {
            await d.checkpoint('supplied false wins', { ...closed, changes: [], completions: [] });
            await d.trigger().press('Enter');
            await d.checkpoint('parent ignores request', { ...closed, focus: 'primary', completions: [] });
            await d.page.getByTestId('outside').click();
            await d.checkpoint('background stays available', { ...closed, activations: 1 });
        }
    },
    {
        name: 'controlled-deferred',
        async run(d) {
            await d.trigger().press('Enter');
            await d.checkpoint('open requested', { ...closed, focus: 'primary', completions: [] });
            await d.page.keyboard.press('F2');
            await d.opened();
            await d.checkpoint('open accepted', { ...primaryOpen, completions: [true] });

            await d.page.keyboard.press('Escape');
            await d.checkpoint('close requested', { ...primaryOpen, focus: 'field', completions: [true] });
            await d.page.keyboard.press('F2');
            await d.closed();
            await d.checkpoint('close accepted', { ...closed, completions: [true, false] });
        }
    },
    {
        name: 'cancel-open',
        async run(d) {
            await d.trigger().press('Enter');
            await d.checkpoint('opening canceled', {
                ...closed,
                changes: [{ open: true, reason: 'trigger-press', trigger: 'primary', canceled: true }],
                completions: []
            });
            await d.open();
            await d.checkpoint('next request succeeds', primaryOpen);
        }
    },
    {
        name: 'modal-background',
        async run(d) {
            await d.open();
            await d.page.keyboard.press('Tab');
            await d.checkpoint('forward Tab reaches Close', { ...primaryOpen, focus: 'close' });
            await d.page.keyboard.press('Tab');
            await d.checkpoint('forward Tab wraps', { ...primaryOpen, focus: 'field' });

            // macOS WebKit uses Option+Tab for full keyboard navigation. It exercises the
            // native focus guards because the scope's unmodified Tab handler does not run.
            const macWebkit =
                d.page.context().browser()?.browserType().name() === 'webkit' && process.platform === 'darwin';
            if (macWebkit) {
                await d.page.keyboard.press('Alt+Shift+Tab');
                await d.checkpoint('reverse Option+Tab wraps', { ...primaryOpen, focus: 'close' });
                await d.page.keyboard.press('Alt+Tab');
                await d.checkpoint('forward Option+Tab wraps', { ...primaryOpen, focus: 'field' });
            }

            const outside = d.page.getByTestId('outside');
            const box = await outside.boundingBox();
            if (!box) throw new Error('Missing background button layout');
            await d.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
            await d.closed();
            await d.checkpoint('outside press dismisses without activating the background', {
                ...closed,
                activations: 0,
                backgroundIsolated: false,
                scrollLocked: false,
                changes: [
                    { open: true, reason: 'trigger-press', trigger: 'primary', canceled: false },
                    { open: false, reason: 'outside-press', trigger: 'primary', canceled: false }
                ]
            });
            await outside.click();
            await d.checkpoint('background is available again', { ...closed, activations: 1 });
        }
    },
    {
        name: 'trigger-default-fallback',
        async run(d) {
            await d.opened();
            await d.checkpoint('explicit ID takes precedence', {
                open: true,
                expanded: ['secondary'],
                controls: ['secondary'],
                changes: []
            });
            await d.page.keyboard.press('F4');
            await d.checkpoint('null releases trigger override', { ...primaryOpen, changes: [] });
            await d.page.keyboard.press('Escape');
            await d.closed();
            await d.checkpoint('close from fallback trigger', closed);
        }
    },
    {
        name: 'trigger-registration',
        async run(d) {
            await d.open('secondary');
            await d.checkpoint('secondary owns the dialog', { open: true, expanded: ['secondary'] });
            await d.page.keyboard.press('F5');
            await expect(d.trigger('secondary')).toHaveCount(0);
            await d.checkpoint('active trigger removed', { open: true, expanded: [], focus: 'field' });
            await d.page.keyboard.press('F5');
            await d.checkpoint('same ID registered again', { open: true, expanded: ['secondary'], focus: 'field' });
            await d.page.keyboard.press('Escape');
            await d.closed();
            await d.checkpoint('close with replacement trigger', closed);
        }
    }
];

const retention: Scenario[] = (
    ['automatic-disposable', 'automatic-retained', 'held-disposable', 'held-retained'] as const
).map((name) => ({
    name,
    async run(d) {
        const retained = name.endsWith('-retained');
        const held = name.startsWith('held-');
        await d.checkpoint('initial', { open: false, mounted: retained, visible: false });
        await d.open();
        await d.field.fill('edited');
        await d.checkpoint('draft edited', { ...primaryOpen, field: 'edited' });
        await d.page.keyboard.press('Escape');
        if (held) {
            await d.checkpoint('held after close', { open: false, mounted: true, visible: true, completions: [true] });
            await d.page.keyboard.press('F9');
        }
        await d.closed(retained);
        await expect(d.trigger()).toBeFocused();
        await d.checkpoint('close complete', {
            open: false,
            mounted: retained,
            visible: false,
            completions: [true, false]
        });
        await d.page.keyboard.press('F9');
        await d.checkpoint('repeated release ignored', { open: false, mounted: retained, completions: [true, false] });
        await d.page.getByTestId('outside').click();
        await d.checkpoint('background active', { open: false, activations: 1 });
        await d.open();
        await d.checkpoint('reopened', {
            ...primaryOpen,
            field: retained ? 'edited' : 'draft',
            completions: [true, false, true]
        });
    }
}));

const motion: Scenario[] = [
    {
        name: 'held-interruption',
        async run(d) {
            await d.open();
            await d.field.fill('edited');
            await d.page.keyboard.press('Escape');
            await d.checkpoint('held', { open: false, mounted: true, completions: [true] });
            await d.open();
            await d.page.keyboard.press('F9');
            await d.checkpoint('stale release after reopen', {
                ...primaryOpen,
                field: 'edited',
                completions: [true, true]
            });
            await d.page.keyboard.press('Escape');
            await d.closed();
            await d.checkpoint('new close completes', { ...closed, completions: [true, true, false] });
        }
    },
    {
        name: 'same-batch-release',
        async run(d) {
            await d.open();
            await d.page.keyboard.press('F10');
            await d.closed();
            await d.checkpoint('close and release', { ...closed, completions: [true, false] });
        }
    },
    {
        name: 'css-exit',
        async run(d) {
            await d.open();
            await d.page.keyboard.press('Escape');
            await expect.poll(() => d.popup.evaluate((element) => element.getAnimations().length)).toBeGreaterThan(0);
            await d.checkpoint('real exit animation', {
                open: false,
                mounted: true,
                visible: true,
                ending: true,
                completions: [true]
            });
            await d.popup.evaluate((element) => element.getAnimations().forEach((animation) => animation.finish()));
            await d.closed();
            await d.checkpoint('after finishing motion', { ...closed, completions: [true, false] });
        }
    }
];

export const scenarios = [...ownership, ...retention, ...motion];
