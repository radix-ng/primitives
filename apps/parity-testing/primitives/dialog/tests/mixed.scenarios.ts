import type { Probe } from '../src/contract';
import type { DialogDriver } from './driver';

type NestedLayer = Probe['nestedChanges'][number]['layer'];
const nestedChange = (layer: NestedLayer, open: boolean, reason: string) => ({
    layer,
    open,
    reason,
    trigger: `${layer}-trigger`,
    canceled: false
});

export const mixedScenarios = (['mixed-drawers-dialog', 'mixed-drawers-alert-dialog'] as const).map((name) => ({
    name,
    async run(driver: DialogDriver) {
        const alert = name === 'mixed-drawers-alert-dialog';
        const changes: Probe['nestedChanges'] = [nestedChange('child', true, 'trigger-press')];
        const completions: Probe['nestedCompletions'] = [{ layer: 'child', open: true }];
        const parentDrawer = {
            open: true,
            scrollLocked: true,
            backgroundIsolated: true,
            backdrop: true,
            changes: [{ open: true, reason: 'trigger-press', trigger: 'primary', canceled: false }]
        };
        const childDrawer = {
            ...parentDrawer,
            openNestedLayers: ['child' as const],
            drawerCounts: [1, 0, null],
            parentsWithOpenDrawers: ['root'],
            linkedNestedTriggers: ['child' as const],
            nestedRoles: ['dialog', null],
            focus: 'child-popup',
            nestedChanges: changes,
            nestedCompletions: completions
        };
        const openLeaf = async () => {
            await driver.openNested('grandchild');
            changes.push(nestedChange('grandchild', true, 'trigger-press'));
            completions.push({ layer: 'grandchild', open: true });
            await driver.checkpoint('only the nested Drawer contributes to Drawer styling', {
                ...childDrawer,
                openNestedLayers: ['child', 'grandchild'],
                linkedNestedTriggers: ['child', 'grandchild'],
                nestedRoles: ['dialog', alert ? 'alertdialog' : 'dialog'],
                visibleNestedBackdrops: [],
                focus: 'grandchild-field'
            });
        };
        const leafClosed = async (reason: string) => {
            await driver.waitForNestedCompletion('grandchild', false);
            changes.push(nestedChange('grandchild', false, reason));
            completions.push({ layer: 'grandchild', open: false });
            await driver.checkpoint('closing the leaf restores its trigger inside the nested Drawer', {
                ...childDrawer,
                mountedNestedLayers: ['child'],
                focus: 'grandchild-trigger'
            });
        };

        await driver.goto(name);
        await driver.open('primary', 'popup');
        await driver.openNested('child', 'child-popup');
        await driver.checkpoint('two Drawers establish their own count', childDrawer);
        await openLeaf();
        await driver.pointerAt('outside');
        await driver.page.mouse.down();
        await driver.page.mouse.up();
        if (alert) {
            await driver.checkpoint('an outside click preserves the AlertDialog and both Drawers', {
                ...childDrawer,
                openNestedLayers: ['child', 'grandchild'],
                linkedNestedTriggers: ['child', 'grandchild'],
                nestedRoles: ['dialog', 'alertdialog'],
                focus: 'body',
                activations: 0
            });
        } else {
            await leafClosed('outside-press');
            await openLeaf();
        }

        await driver.page.keyboard.press('Escape');
        await leafClosed('escape-key');
        await driver.page.keyboard.press('Escape');
        await driver.waitForNestedCompletion('child', false);
        changes.push(nestedChange('child', false, 'escape-key'));
        completions.push({ layer: 'child', open: false });
        await driver.checkpoint('the next Escape closes only the nested Drawer', {
            ...parentDrawer,
            openNestedLayers: [],
            mountedNestedLayers: [],
            drawerCounts: [0, null, null],
            parentsWithOpenDrawers: [],
            focus: 'child-trigger',
            nestedChanges: changes,
            nestedCompletions: completions
        });
        await driver.page.keyboard.press('Escape');
        await driver.closed();
        await driver.checkpoint('the final Escape restores the original trigger and releases the background', {
            open: false,
            scrollLocked: false,
            backgroundIsolated: false,
            focus: 'primary',
            drawerCounts: [null, null, null],
            changes: [
                ...parentDrawer.changes,
                { open: false, reason: 'escape-key', trigger: 'primary', canceled: false }
            ],
            nestedChanges: changes,
            nestedCompletions: completions,
            activations: 0
        });
    }
}));
