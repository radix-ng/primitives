import { expect } from '@playwright/test';
import type { CaseName } from '../src/contract';
import type { DialogDriver } from './driver';
import { mixedScenarios } from './mixed.scenarios';
import { overlapScenarios } from './overlap.scenarios';
import { touchScenarios } from './touch.scenarios';

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

const portalRetarget: Scenario = {
    name: 'portal-retarget',
    async run(d) {
        const { page, popup, field } = d;
        const inContainer = (target: string) => page.getByTestId(target).getByTestId('popup');
        const angular = d.framework === 'angular';
        const open = { ...primaryOpen, backdrop: false };
        const escape = { ...outsideClose, reason: 'escape-key' };
        const isolated = (element: typeof popup) =>
            element.evaluate((node) => !!node.closest('[inert], [aria-hidden="true"]'));
        const checkIsolation = async (outsideContainer: string) => {
            await expect.poll(() => isolated(popup)).toBe(false);
            await expect.poll(() => isolated(page.getByTestId(outsideContainer))).toBe(true);
        };
        await d.goto('portal-retarget');
        await d.open();
        await expect(inContainer('portal-a')).toBeVisible();
        await checkIsolation('portal-b');
        await field.fill('edited draft');
        const originalField = await field.elementHandle();
        const originalIds = await popup.evaluate((element) => [
            element.id,
            element.getAttribute('aria-labelledby'),
            element.getAttribute('aria-describedby')
        ]);
        await d.checkpoint('open in the first container with a draft edit', {
            ...open,
            field: 'edited draft',
            focus: 'field',
            changes: [triggerOpen],
            completions: [true]
        });

        await page.keyboard.press('F8');
        await expect(inContainer('portal-b')).toBeVisible();
        await expect(inContainer('portal-a')).toHaveCount(0);
        await expect(field).toBeFocused();
        await checkIsolation('portal-a');
        const sameField = await field.evaluate((current, original) => current === original, originalField);
        const newIds = await popup.evaluate((element) => [
            element.id,
            element.getAttribute('aria-labelledby'),
            element.getAttribute('aria-describedby')
        ]);
        d.measurements.push({
            name: 'descendant identity after changing the container',
            sameField,
            originalIds,
            newIds
        });
        expect(sameField).toBe(angular);
        if (angular) expect(newIds).toEqual(originalIds);
        const completedOpens = angular ? [true] : [true, true];
        await d.checkpoint('open after changing the container', {
            ...open,
            focus: 'field',
            field: angular ? 'edited draft' : 'draft',
            changes: [triggerOpen],
            completions: completedOpens
        });

        await page.keyboard.press('Tab');
        await expect(page.getByTestId('close')).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(field).toBeFocused();
        await page.keyboard.press('Escape');
        await d.closed();
        await d.checkpoint('Escape restores the Trigger after the move', {
            ...closed,
            backgroundIsolated: false,
            scrollLocked: false,
            focus: 'primary',
            changes: [triggerOpen, escape],
            completions: [...completedOpens, false]
        });

        await d.open();
        await page.keyboard.press('F8');
        await expect(inContainer('portal-a')).toBeVisible();
        await checkIsolation('portal-b');
        await expect(field).toBeFocused();
        const outside = await d.pointAt('outside');
        await page.mouse.click(outside.x, outside.y);
        await d.closed();
        await d.checkpoint('outside click dismisses from the new container', {
            ...closed,
            backgroundIsolated: false,
            activations: 0,
            scrollLocked: false,
            changes: [triggerOpen, escape, triggerOpen, outsideClose],
            completions: [...completedOpens, false, ...completedOpens, false]
        });
    }
};

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

const secondaryOpen = { ...primaryOpen, expanded: ['secondary'], controls: ['secondary'] };
const unassociatedOpen = { ...primaryOpen, expanded: [], controls: [], handleOpen: [true, false] };
const imperativeOpen = { ...triggerOpen, reason: 'imperative-action', trigger: null };
const imperativeClose = { ...escape, reason: 'imperative-action', trigger: null };

const detachedHandles: Scenario[] = [
    {
        name: 'detached-live-payload',
        async run(d) {
            await d.open();
            await d.checkpoint('detached account trigger owns the popup', {
                ...primaryOpen,
                handleOpen: [true, false],
                payload: 'account',
                changes: [triggerOpen]
            });
            await d.page.keyboard.press('F3');
            await d.checkpoint('active payload reacts without a new request', {
                ...primaryOpen,
                payload: 'account updated',
                changes: [triggerOpen],
                completions: [true]
            });
            await d.page.keyboard.press('Escape');
            await d.closed();
            await d.checkpoint('Escape returns focus to the detached trigger', {
                ...closed,
                focus: 'primary',
                handleOpen: [false, false],
                changes: [triggerOpen, escape]
            });
            await d.open('secondary');
            await d.checkpoint('second trigger forwards its own payload', {
                ...secondaryOpen,
                payload: 'billing updated',
                changes: [triggerOpen, escape, { ...triggerOpen, trigger: 'secondary' }]
            });
        }
    },
    {
        name: 'detached-trigger-remount',
        async run(d) {
            await d.page.keyboard.press('F8');
            await d.opened();
            const request = { ...triggerOpen, reason: 'imperative-action', trigger: 'secondary' };
            await d.checkpoint('named imperative open resolves the detached trigger', {
                ...secondaryOpen,
                payload: 'billing',
                changes: [request]
            });
            await d.page.keyboard.press('F5');
            await expect(d.trigger('secondary')).toHaveCount(0);
            await d.checkpoint('removed trigger loses its association while the popup stays open', {
                open: true,
                expanded: [],
                controls: [],
                focus: 'field',
                payload: 'billing',
                changes: [request]
            });
            await d.page.keyboard.press('F3');
            await d.page.keyboard.press('F5');
            await expect(d.trigger('secondary')).toHaveAttribute('aria-expanded', 'true');
            await d.checkpoint('replacement with the same ID forwards its current payload', {
                ...secondaryOpen,
                payload: 'billing updated',
                focus: 'field',
                changes: [request],
                completions: [true]
            });
        }
    },
    {
        name: 'detached-root-remount',
        async run(d) {
            await d.trigger().press('Enter');
            await d.page.keyboard.press('F8');
            await d.page.keyboard.press('F9');
            await d.page.keyboard.press('F10');
            await d.checkpoint('calls made without a root do not queue requests', {
                ...closed,
                handleOpen: [false, false],
                changes: [],
                completions: []
            });
            await d.page.keyboard.press('F6');
            await d.checkpoint('new root starts closed', { ...closed, handleOpen: [false, false], changes: [] });
            await d.page.keyboard.press('F8');
            await d.opened();
            const request = { ...triggerOpen, reason: 'imperative-action' };
            await d.checkpoint('persistent trigger resolves after attachment', {
                ...primaryOpen,
                payload: 'account',
                changes: [request]
            });
            await d.page.keyboard.press('F6');
            await expect(d.popup).toHaveCount(0);
            await d.page.keyboard.press('F8');
            await d.page.keyboard.press('F10');
            await d.checkpoint('unmount drops the association', {
                ...closed,
                handleOpen: [false, false],
                changes: [request]
            });
            await d.page.keyboard.press('F6');
            await d.checkpoint('remounted root starts closed', { ...closed, changes: [request] });
            await d.page.keyboard.press('F8');
            await d.opened();
            await d.checkpoint('imperative open resolves the persistent trigger again', {
                ...primaryOpen,
                payload: 'account',
                changes: [request, request],
                completions: [true, true]
            });
        }
    },
    {
        name: 'detached-handle-swap',
        async run(d) {
            await d.open();
            await d.checkpoint('first handle owns the live dialog', {
                ...primaryOpen,
                handleOpen: [true, false],
                payload: 'account'
            });
            await d.field.fill('draft in live root');
            await d.page.keyboard.press('F7');
            await d.checkpoint('attachment moves to the second handle', {
                open: true,
                handleOpen: [false, true],
                expanded: [],
                controls: []
            });
            await d.page.keyboard.press('F4');
            await d.checkpoint('swapping handle preserves the live view and retires old actions', {
                open: true,
                handleOpen: [false, true],
                field: 'draft in live root',
                payload: 'account',
                expanded: [],
                controls: [],
                changes: [triggerOpen],
                completions: [true]
            });
            await d.page.keyboard.press('F9');
            await d.closed();
            await d.checkpoint('new handle can close the same root', {
                ...closed,
                handleOpen: [false, false],
                changes: [triggerOpen, { ...imperativeClose, trigger: 'primary' }],
                completions: [true, false]
            });
            await d.open('secondary');
            await d.checkpoint('new handle links its registered trigger', {
                ...secondaryOpen,
                handleOpen: [false, true],
                payload: 'billing'
            });
        }
    },
    {
        name: 'detached-unassociated',
        async run(d) {
            await d.page.getByTestId('outside').focus();
            await d.page.keyboard.press('F2');
            await d.opened();
            await d.checkpoint('null opens without claiming the only trigger', {
                ...unassociatedOpen,
                payload: null,
                changes: [imperativeOpen]
            });
            await d.page.keyboard.press('F9');
            await d.closed();
            await d.checkpoint('unassociated close returns to previous focus', {
                ...closed,
                focus: 'outside',
                changes: [imperativeOpen, imperativeClose]
            });
            await d.open();
            await d.checkpoint('normal trigger activation can claim the next session', {
                ...primaryOpen,
                payload: 'account'
            });
            await d.page.keyboard.press('Escape');
            await d.closed();
            await d.page.keyboard.press('F2');
            await d.opened();
            await d.checkpoint('new unassociated session after a named open', {
                ...unassociatedOpen,
                changes: [imperativeOpen, imperativeClose, triggerOpen, escape, imperativeOpen]
            });
        }
    },
    {
        name: 'detached-missing-trigger',
        async run(d) {
            await d.page.keyboard.press('F8');
            await d.opened();
            await d.checkpoint('missing ID falls back to an unassociated open', {
                ...unassociatedOpen,
                payload: null,
                changes: [imperativeOpen],
                completions: [true]
            });
            await d.page.keyboard.press('Escape');
            await d.closed();
            await d.checkpoint('missing ID does not become a close trigger', {
                ...closed,
                changes: [imperativeOpen, { ...escape, trigger: null }]
            });
        }
    },
    {
        name: 'detached-programmatic-payload',
        async run(d) {
            await d.page.keyboard.press('F10');
            await d.opened();
            await d.field.fill('user edit');
            await d.checkpoint('explicit payload does not associate a trigger', {
                ...unassociatedOpen,
                payload: 'programmatic data',
                changes: [imperativeOpen]
            });
            await d.page.keyboard.press('F5');
            await expect(d.trigger('secondary')).toBeAttached();
            await d.checkpoint('new trigger does not steal the explicit payload', {
                ...unassociatedOpen,
                payload: 'programmatic data',
                changes: [imperativeOpen]
            });
            await d.page.keyboard.press('F8');
            await d.checkpoint('imperative selection can move to an existing trigger without remounting', {
                ...secondaryOpen,
                payload: 'billing',
                field: 'user edit',
                changes: [imperativeOpen, { ...imperativeOpen, trigger: 'secondary' }],
                completions: [true]
            });
            await d.page.keyboard.press('F10');
            await d.checkpoint('a new explicit payload can release the current trigger', {
                ...unassociatedOpen,
                payload: 'programmatic data',
                field: 'user edit',
                changes: [imperativeOpen, { ...imperativeOpen, trigger: 'secondary' }, imperativeOpen],
                completions: [true]
            });
        }
    },
    {
        name: 'detached-refused-close',
        async run(d) {
            await d.page.keyboard.press('F10');
            await d.opened();
            await d.page.keyboard.press('F9');
            await d.page.keyboard.press('F5');
            await expect(d.trigger('secondary')).toBeAttached();
            await d.checkpoint('refused close preserves the explicit payload and trigger state', {
                ...unassociatedOpen,
                focus: 'field',
                payload: 'programmatic data',
                changes: [imperativeOpen, imperativeClose],
                completions: [true]
            });
        }
    }
];

const keyboardInitial = { phase: 'initial' as const, interaction: 'keyboard' };
const keyboardFinal = { phase: 'final' as const, interaction: 'keyboard' };
const mouseInitial = { phase: 'initial' as const, interaction: 'mouse' };
const mouseFinal = { phase: 'final' as const, interaction: 'mouse' };

const focusTargets: Scenario[] = [
    {
        name: 'focus-elements',
        async run(d) {
            await d.open('primary', 'close');
            await d.checkpoint('explicit initial target receives focus', { ...primaryOpen, focus: 'close' });
            await d.page.keyboard.press('Escape');
            await d.closed();
            await expect(d.page.getByTestId('final-target')).toBeFocused();
            await d.checkpoint('explicit final target receives focus', { ...closed, focus: 'final-target' });
        }
    },
    {
        name: 'focus-disabled',
        async run(d) {
            await d.open('primary', 'primary');
            await d.checkpoint('initial false leaves focus on the trigger', { ...nonModalOpen, focus: 'primary' });
            await d.field.press('Escape');
            await d.closed();
            await d.checkpoint('final false leaves native focus after removal', { ...closed, focus: 'body' });
        }
    },
    {
        name: 'focus-keyboard-policy',
        async run(d) {
            await d.open('primary', 'close');
            await d.checkpoint('keyboard open calls the initial policy once', {
                ...primaryOpen,
                focus: 'close',
                focusPolicies: [keyboardInitial]
            });
            await d.page.keyboard.press('Escape');
            await d.closed();
            await expect(d.page.getByTestId('final-target')).toBeFocused();
            await d.checkpoint('Escape calls the final policy once', {
                ...closed,
                focus: 'final-target',
                focusPolicies: [keyboardInitial, keyboardFinal]
            });
        }
    },
    {
        name: 'focus-pointer-policy',
        async run(d) {
            await d.trigger().click();
            await d.opened();
            await d.checkpoint('mouse open with true takes the first tabbable element', {
                ...primaryOpen,
                focus: 'field',
                focusPolicies: [mouseInitial]
            });
            await d.page.getByTestId('close').click();
            await d.closed();
            await expect(d.page.getByTestId('final-target')).toBeFocused();
            await d.checkpoint('mouse Close selects the final target', {
                ...closed,
                focus: 'final-target',
                focusPolicies: [mouseInitial, mouseFinal]
            });
        }
    },
    {
        name: 'focus-undefined-policy',
        async run(d) {
            await d.open('primary', 'primary');
            await d.checkpoint('undefined from initial callback keeps focus', {
                ...nonModalOpen,
                focus: 'primary',
                focusPolicies: [keyboardInitial]
            });
            await d.field.press('Escape');
            await d.closed();
            await d.checkpoint('undefined from final callback leaves focus to the browser', {
                ...closed,
                focus: 'body',
                focusPolicies: [keyboardInitial, keyboardFinal]
            });
        }
    },
    {
        name: 'focus-null-policy',
        async run(d) {
            await d.open();
            await d.checkpoint('null from initial callback selects the default', {
                ...primaryOpen,
                focus: 'field',
                focusPolicies: [keyboardInitial]
            });
            await d.page.keyboard.press('Escape');
            await d.closed();
            await expect(d.trigger()).toBeFocused();
            await d.checkpoint('null from final callback selects the default', {
                ...closed,
                focus: 'primary',
                focusPolicies: [keyboardInitial, keyboardFinal]
            });
        }
    },
    {
        name: 'focus-retained-exit',
        async run(d) {
            await d.open('primary', 'close');
            await d.field.fill('retained draft');
            await d.page.keyboard.press('Tab');
            await expect(d.page.getByTestId('close')).toBeFocused();
            await d.page.keyboard.press('Escape');
            await expect.poll(() => d.popup.evaluate((el) => el.getAnimations().length)).toBeGreaterThan(0);
            await d.checkpoint('exit animation keeps focus in the retained view', {
                open: false,
                mounted: true,
                visible: true,
                ending: true,
                focus: 'close',
                focusPolicies: [keyboardInitial],
                completions: [true]
            });
            await d.popup.evaluate((el) => el.getAnimations().forEach((animation) => animation.finish()));
            await d.closed(true);
            await expect(d.page.getByTestId('final-target')).toBeFocused();
            await d.checkpoint('final target receives focus after exit completes', {
                open: false,
                mounted: true,
                visible: false,
                focus: 'final-target',
                focusPolicies: [keyboardInitial, keyboardFinal],
                completions: [true, false]
            });
            await d.open('primary', 'close');
            await d.checkpoint('reopen applies initial focus to the retained view', {
                ...primaryOpen,
                field: 'retained draft',
                focus: 'close',
                focusPolicies: [keyboardInitial, keyboardFinal, keyboardInitial],
                completions: [true, false, true]
            });
        }
    },
    {
        name: 'focus-trigger-removed',
        async run(d) {
            await d.open('primary', 'close');
            await d.page.keyboard.press('F7');
            await expect(d.trigger()).toHaveCount(0);
            await d.checkpoint('focus stays in the popup after trigger removal', {
                open: true,
                expanded: [],
                focus: 'close',
                focusPolicies: [keyboardInitial]
            });
            await d.page.keyboard.press('Escape');
            await d.closed();
            await expect(d.page.getByTestId('final-target')).toBeFocused();
            await d.checkpoint('explicit final target works with no surviving trigger', {
                ...closed,
                focus: 'final-target',
                changes: [triggerOpen, { ...escape, trigger: null }],
                focusPolicies: [keyboardInitial, keyboardFinal]
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

export const scenarios = [
    ...ownership,
    ...modalModes,
    ...nesting,
    ...mixedScenarios,
    ...overlapScenarios,
    portalRetarget,
    ...detachedHandles,
    ...focusTargets,
    ...touchScenarios,
    ...retention,
    ...motion
];
