import { expect } from '@playwright/test';
import { overlappingLayers, type CaseName, type OverlappingLayer, type Probe } from '../src/contract';
import type { DialogDriver } from './driver';

async function observe(driver: DialogDriver) {
    return driver.page.evaluate((layers) => {
        const popups = layers.map((layer) => ({
            layer,
            popup: document.querySelector<HTMLElement>(`[data-testid="${layer}-popup"]`)
        }));
        const isolated = (element: Element | null) => !!element?.closest('[inert], [aria-hidden="true"]');
        const active = document.activeElement;
        const { overlappingChanges, overlappingCompletions, activations } = window.dialogParity;
        return {
            state: {
                open: popups.filter(({ popup }) => popup?.hasAttribute('data-open')).map(({ layer }) => layer),
                mounted: popups.filter(({ popup }) => popup).map(({ layer }) => layer),
                nested: popups.filter(({ popup }) => popup?.hasAttribute('data-nested')).map(({ layer }) => layer),
                counts: popups.flatMap(({ popup }) =>
                    popup ? [Number(getComputedStyle(popup).getPropertyValue('--nested-dialogs'))] : []
                ),
                isolatedPopups: popups
                    .filter(({ popup }) => popup?.hasAttribute('data-open') && isolated(popup))
                    .map(({ layer }) => layer),
                backgroundIsolated: isolated(document.querySelector('[data-testid="outside"]')),
                scrollLocked: [document.documentElement, document.body].some((element) =>
                    getComputedStyle(element).overflow.includes('hidden')
                ),
                focus: active?.getAttribute('data-testid') ?? active?.tagName.toLowerCase() ?? null,
                overlappingChanges,
                overlappingCompletions,
                activations
            },
            raw: popups.map(({ layer, popup }) => ({
                layer,
                popup: popup?.outerHTML ?? null,
                parentInert: !!popup?.closest('[inert]'),
                parentAriaHidden: !!popup?.closest('[aria-hidden="true"]')
            }))
        };
    }, overlappingLayers);
}

async function checkpoint(
    driver: DialogDriver,
    name: string,
    expected: Partial<Awaited<ReturnType<typeof observe>>['state']>
) {
    let result = await observe(driver);
    try {
        await expect
            .poll(async () => (result = await observe(driver)).state, { message: name })
            .toMatchObject(expected);
        expect(driver.errors).toEqual([]);
    } finally {
        const { isolatedPopups, ...state } = result.state;
        driver.checkpoints.push({ name, state });
        driver.measurements.push({ name, isolatedPopups, popups: result.raw });
    }
}

async function pointAtBackdrop(driver: DialogDriver, layer: OverlappingLayer) {
    const point = { x: 12, y: 12 };
    await driver.page.mouse.move(point.x, point.y);
    const target = await driver.page.evaluate(
        ({ point, layer }) => {
            const hit = document.elementFromPoint(point.x, point.y);
            const popup = document.querySelector(`[data-testid="${layer}-popup"]`);
            const authored = hit?.getAttribute('data-testid') === `${layer}-backdrop`;
            const angularInternal =
                hit?.hasAttribute('data-rdx-dialog-internal-backdrop') && hit.nextElementSibling === popup;
            const reactPortal = popup?.closest('[data-base-ui-portal]');
            const reactInternal =
                !!reactPortal && reactPortal.contains(hit) && hit?.getAttribute('role') === 'presentation';
            return { owned: authored || angularInternal || reactInternal, target: hit?.outerHTML ?? null };
        },
        { point, layer }
    );
    driver.measurements.push({ name: `${layer} backdrop pointer target`, ...target });
    expect(target.owned).toBe(true);
}

const reasons = {
    'overlap-authored-backdrops': 'outside-press',
    'overlap-internal-backdrops': 'outside-press',
    'overlap-escape': 'escape-key',
    'overlap-retained-escape': 'escape-key',
    'overlap-retained-backdrops': 'outside-press'
} as const satisfies Partial<Record<CaseName, string>>;

export const overlapScenarios = (Object.keys(reasons) as (keyof typeof reasons)[]).map((name) => ({
    name,
    async run(driver: DialogDriver) {
        const reason = reasons[name];
        const retained = name.startsWith('overlap-retained-');
        const changes: Probe['overlappingChanges'] = [
            { layer: 'first', open: true, reason: 'trigger-press', trigger: 'primary', canceled: false }
        ];
        const completions: { layer: OverlappingLayer; open: boolean }[] = [];
        await driver.goto(name);
        for (const [index, layer] of overlappingLayers.entries()) {
            const launcher = layer === 'first' ? 'primary' : `open-${layer}`;
            await driver.trigger(launcher).press('Enter');
            completions.push({ layer, open: true });
            await checkpoint(driver, `${layer} sibling opens independently`, {
                open: overlappingLayers.slice(0, index + 1),
                mounted: retained ? [...overlappingLayers] : overlappingLayers.slice(0, index + 1),
                nested: [],
                counts: Array(retained ? overlappingLayers.length : index + 1).fill(0),
                backgroundIsolated: true,
                scrollLocked: true,
                focus: `${layer}-field`,
                // The pinned ARIA-only pass can leave a retained popup aria-hidden after opening.
                ...(!retained || driver.framework === 'angular'
                    ? { isolatedPopups: overlappingLayers.slice(0, index) }
                    : {}),
                overlappingChanges: changes,
                overlappingCompletions: completions
            });
        }

        await driver.page.keyboard.press('Tab');
        await checkpoint(driver, 'top sibling keeps keyboard focus', {
            focus: 'third-close',
            overlappingChanges: changes
        });
        await driver.page.keyboard.press('Tab');
        await checkpoint(driver, 'Tab wraps in the top sibling', { focus: 'third-field', overlappingChanges: changes });

        for (const [index, layer] of Array.from(overlappingLayers.entries()).reverse()) {
            const remaining = overlappingLayers.slice(0, index);
            if (reason === 'outside-press') {
                await pointAtBackdrop(driver, layer);
                await driver.page.mouse.down();
                await checkpoint(driver, `${layer} waits for a completed backdrop press`, {
                    open: overlappingLayers.slice(0, index + 1),
                    overlappingChanges: changes,
                    activations: 0
                });
                await driver.page.mouse.up();
            } else {
                await driver.page.keyboard.press('Escape');
            }
            changes.push({
                layer,
                open: false,
                reason,
                trigger: layer === 'first' ? 'primary' : null,
                canceled: false
            });
            completions.push({ layer, open: false });
            await checkpoint(driver, `${layer} closes and leaves the other Roots alone`, {
                open: remaining,
                mounted: retained ? [...overlappingLayers] : remaining,
                backgroundIsolated: remaining.length > 0,
                scrollLocked: remaining.length > 0,
                ...(!retained || driver.framework === 'angular' ? { isolatedPopups: remaining.slice(0, -1) } : {}),
                focus: layer === 'first' ? 'primary' : `open-${layer}`,
                overlappingChanges: changes,
                overlappingCompletions: completions,
                activations: 0
            });
        }
        await driver.page.getByTestId('outside').click();
        await checkpoint(driver, 'background accepts input after the last close', { activations: 1 });
    }
}));
