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

const triggerOpen = { open: true, reason: 'trigger-press', trigger: 'primary', canceled: false };
const outsideClose = { open: false, reason: 'outside-press', trigger: 'primary', canceled: false };

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

            await d.pointerAt('outside');
            await d.page.mouse.down();
            await d.page.mouse.up();
            await d.closed();
            await d.checkpoint('outside press dismisses without activating the background', {
                ...closed,
                activations: 0,
                backgroundIsolated: false,
                scrollLocked: false,
                changes: [triggerOpen, outsideClose]
            });
            await d.page.getByTestId('outside').click();
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

const nonModalOpen = { ...primaryOpen, backdrop: false, scrollLocked: false, backgroundIsolated: false };
const trapFocusOpen = { ...nonModalOpen, backgroundIsolated: true };
const focusOut = { open: false, reason: 'focus-out', trigger: 'primary', canceled: false };
const escape = { open: false, reason: 'escape-key', trigger: 'primary', canceled: false };

const modalModes: Scenario[] = [
    {
        name: 'non-modal-tab-out',
        async run(d) {
            await d.open();
            await d.page.keyboard.press('Tab');
            await d.checkpoint('Tab reaches Close', { ...nonModalOpen, focus: 'close' });
            await d.page.keyboard.press('Tab');
            await d.closed();
            await d.checkpoint('Tab leaves at the trigger position', {
                ...closed,
                focus: 'outside-field',
                changes: [triggerOpen, focusOut],
                completions: [true, false]
            });
        }
    },
    {
        name: 'non-modal-pointer',
        async run(d) {
            await d.open();
            await d.pointerAt('outside-surface');
            await d.page.mouse.down();
            await d.checkpoint('press starts with open content', { ...nonModalOpen, changes: [triggerOpen] });
            await d.page.mouse.up();
            await d.closed();
            await d.checkpoint('completed primary press dismisses', {
                ...closed,
                changes: [triggerOpen, outsideClose]
            });
        }
    },
    {
        name: 'non-modal-pointer-focus',
        async run(d) {
            await d.open();
            await d.pointerAt('outside-field');
            await d.page.mouse.down();
            await d.closed();
            await d.checkpoint('pointer focus leaves and dismisses before release', {
                ...closed,
                focus: 'outside-field',
                changes: [triggerOpen, focusOut],
                completions: [true, false]
            });
            await d.page.mouse.up();
            await d.checkpoint('release keeps the new focus', {
                ...closed,
                focus: 'outside-field',
                changes: [triggerOpen, focusOut]
            });
        }
    },
    {
        name: 'non-modal-dismissal-disabled',
        async run(d) {
            await d.open();
            await d.page.getByTestId('outside-field').focus();
            await d.checkpoint('focus can leave without closing', { ...nonModalOpen, focus: 'outside-field' });
            await d.page.getByTestId('outside').click();
            await d.checkpoint('background activation leaves open', {
                ...nonModalOpen,
                activations: 1,
                changes: [triggerOpen]
            });
            await d.field.press('Escape');
            await d.closed();
            await d.checkpoint('Escape still dismisses', { ...closed, changes: [triggerOpen, escape] });
        }
    },
    {
        name: 'trap-focus-pointer',
        async run(d) {
            await d.open();
            await d.page.keyboard.press('Tab');
            await d.checkpoint('Tab reaches Close', { ...trapFocusOpen, focus: 'close' });
            await d.page.keyboard.press('Tab');
            await d.checkpoint('Tab wraps without scroll lock', { ...trapFocusOpen, focus: 'field' });
            await d.pointerAt('outside');
            await d.page.mouse.down();
            await d.closed();
            await d.checkpoint('pointer down releases the trap before click', {
                ...closed,
                backgroundIsolated: false,
                activations: 0,
                changes: [triggerOpen, outsideClose]
            });
            await d.page.mouse.up();
            await d.checkpoint('same press activates the background', { ...closed, activations: 1 });

            // WebKit can open a native context menu, so leave the secondary press until last.
            await d.open();
            await d.pointerAt('outside-surface');
            await d.page.mouse.down({ button: 'right' });
            await d.page.mouse.up({ button: 'right' });
            await d.checkpoint('secondary press does not release the trap', {
                ...trapFocusOpen,
                changes: [triggerOpen, outsideClose, triggerOpen]
            });
        }
    },
    {
        name: 'trap-focus-dismissal-disabled',
        async run(d) {
            await d.open();
            await d.page.getByTestId('outside-field').click();
            await d.checkpoint('pointer can focus outside without closing', {
                ...trapFocusOpen,
                focus: 'outside-field',
                changes: [triggerOpen]
            });
            await d.page.getByTestId('outside').click();
            await d.checkpoint('background activation leaves the trap open', {
                ...trapFocusOpen,
                changes: [triggerOpen],
                activations: 1
            });
            await d.field.press('Escape');
            await d.closed();
            await d.checkpoint('Escape releases the trap', { ...closed, changes: [triggerOpen, escape] });
        }
    },
    {
        name: 'trap-focus-authored-backdrop',
        async run(d) {
            await d.open();
            const position = await d.pointerAt('outside');
            expect(
                await d.page.evaluate(
                    ({ x, y }) => document.elementFromPoint(x, y)?.getAttribute('data-testid'),
                    position
                )
            ).toBe('backdrop');
            await d.page.mouse.down();
            await d.checkpoint('author backdrop waits for a completed press', {
                ...trapFocusOpen,
                backdrop: true,
                changes: [triggerOpen]
            });
            await d.page.mouse.up();
            await d.closed();
            await d.checkpoint('backdrop intercepts activation and dismisses', {
                ...closed,
                activations: 0,
                changes: [triggerOpen, outsideClose]
            });
        }
    }
];

const childOpen = { layer: 'child' as const, ...triggerOpen, trigger: 'child-trigger' };
const grandchildOpen = { layer: 'grandchild' as const, ...triggerOpen, trigger: 'grandchild-trigger' };
const childShown = {
    ...primaryOpen,
    openNestedLayers: ['child' as const],
    visibleNestedLayers: ['child' as const],
    linkedNestedTriggers: ['child' as const],
    nestedMarkers: ['child' as const],
    visibleNestedBackdrops: [],
    parentsWithOpenDescendants: ['root'],
    dialogCounts: [1, 0, null]
};
const childDismissed = {
    ...primaryOpen,
    openNestedLayers: [],
    mountedNestedLayers: [],
    visibleNestedLayers: [],
    parentsWithOpenDescendants: [],
    dialogCounts: [0, null, null],
    focus: 'child-trigger'
};

const nesting: Scenario[] = [
    {
        name: 'nested-escape',
        async run(d) {
            await d.open();
            await d.field.fill('outer draft');
            await d.openNested('child');
            await d.checkpoint('child traps focus with no second visible backdrop', {
                ...childShown,
                focus: 'child-field',
                nestedChanges: [childOpen],
                changes: [triggerOpen]
            });
            await d.page.keyboard.press('Tab');
            await d.checkpoint('Tab stays inside the child dialog', { ...childShown, focus: 'child-close' });
            await d.page.keyboard.press('Tab');
            await d.checkpoint('child wrap bypasses the parent', { ...childShown, focus: 'child-field' });

            await d.page.keyboard.press('Escape');
            await d.waitForNestedCompletion('child', false);
            await d.checkpoint('Escape dismisses only the child and restores its trigger', {
                ...childDismissed,
                field: 'outer draft',
                nestedChanges: [childOpen, { layer: 'child', ...escape, trigger: 'child-trigger' }],
                changes: [triggerOpen]
            });
            await d.page.keyboard.press('Escape');
            await d.closed();
            await d.checkpoint('next Escape dismisses the outer dialog', {
                ...closed,
                focus: 'primary',
                changes: [triggerOpen, escape]
            });
        }
    },
    {
        name: 'nested-outside-press',
        async run(d) {
            await d.open();
            await d.openNested('child');
            await d.pointerAt('outside');
            await d.page.mouse.down();
            await d.checkpoint('both remain open until click', { ...childShown, nestedChanges: [childOpen] });
            await d.page.mouse.up();
            await d.waitForNestedCompletion('child', false);
            await d.checkpoint('first press dismisses only the child', {
                ...childDismissed,
                activations: 0,
                changes: [triggerOpen],
                nestedChanges: [childOpen, { layer: 'child', ...outsideClose, trigger: 'child-trigger' }]
            });
            await d.page.mouse.down();
            await d.page.mouse.up();
            await d.closed();
            await d.checkpoint('next press dismisses the outer dialog', {
                ...closed,
                focus: 'primary',
                activations: 0,
                changes: [triggerOpen, outsideClose]
            });
        }
    },
    {
        name: 'nested-depth',
        async run(d) {
            await d.open();
            await d.openNested('child');
            await d.openNested('grandchild');
            await d.checkpoint('outer styles count both open descendants', {
                ...primaryOpen,
                focus: 'grandchild-field',
                openNestedLayers: ['child', 'grandchild'],
                visibleNestedLayers: ['child', 'grandchild'],
                visibleNestedBackdrops: [],
                nestedMarkers: ['child', 'grandchild'],
                dialogCounts: [2, 1, 0],
                parentsWithOpenDescendants: ['root', 'child'],
                linkedNestedTriggers: ['child', 'grandchild'],
                nestedChanges: [childOpen, grandchildOpen]
            });
            await d.page.getByTestId('grandchild-close').press('Enter');
            await d.waitForNestedCompletion('grandchild', false);
            await d.checkpoint('deepest Close updates both ancestors', { ...childShown, focus: 'grandchild-trigger' });
            await d.page.getByTestId('child-close').press('Enter');
            await d.waitForNestedCompletion('child', false);
            await d.checkpoint('child Close clears the last descendant', {
                ...childDismissed,
                nestedChanges: [
                    childOpen,
                    grandchildOpen,
                    { ...grandchildOpen, open: false, reason: 'close-press' },
                    { ...childOpen, open: false, reason: 'close-press' }
                ]
            });
        }
    },
    {
        name: 'nested-remove',
        async run(d) {
            await d.open();
            await d.openNested('child');
            await d.openNested('grandchild');
            await d.page.keyboard.press('F6');
            await expect(d.page.getByTestId('child-trigger')).toHaveCount(0);
            await d.checkpoint('owner removal clears descendant layers without a close request', {
                ...primaryOpen,
                dialogCounts: [0, null, null],
                openNestedLayers: [],
                mountedNestedLayers: [],
                parentsWithOpenDescendants: [],
                nestedChanges: [childOpen, grandchildOpen],
                nestedCompletions: [
                    { layer: 'child', open: true },
                    { layer: 'grandchild', open: true }
                ]
            });
            await d.page.keyboard.press('Escape');
            await d.closed();
            await d.checkpoint('remaining dialog can dismiss', {
                ...closed,
                focus: 'primary',
                changes: [triggerOpen, escape]
            });
        }
    },
    {
        name: 'nested-retained-exit',
        async run(d) {
            await d.open();
            await d.openNested('child');
            await d.page.getByTestId('child-field').fill('child edit');
            await d.checkpoint('forceRender displays a second backdrop', {
                ...childShown,
                visibleNestedBackdrops: ['child']
            });
            await d.page.keyboard.press('Escape');
            const child = d.page.getByTestId('child-popup');
            await expect.poll(() => child.evaluate((element) => element.getAnimations().length)).toBeGreaterThan(0);
            await d.checkpoint('logical close clears descendant styling during the exit', {
                ...primaryOpen,
                openNestedLayers: [],
                mountedNestedLayers: ['child'],
                visibleNestedLayers: ['child'],
                visibleNestedBackdrops: ['child'],
                parentsWithOpenDescendants: [],
                dialogCounts: [0, 0, null],
                nestedCompletions: [{ layer: 'child', open: true }]
            });
            await child.evaluate((element) => element.getAnimations().forEach((animation) => animation.finish()));
            await d.waitForNestedCompletion('child', false);
            await d.checkpoint('close completes once and retains the hidden form', {
                ...childDismissed,
                mountedNestedLayers: ['child'],
                dialogCounts: [0, 0, null],
                childField: 'child edit',
                nestedCompletions: [
                    { layer: 'child', open: true },
                    { layer: 'child', open: false }
                ]
            });
            await d.openNested('child');
            await d.checkpoint('reopened retained child restores styling and draft', {
                ...childShown,
                visibleNestedBackdrops: ['child'],
                childField: 'child edit'
            });
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

export const scenarios = [...ownership, ...modalModes, ...nesting, ...retention, ...motion];
