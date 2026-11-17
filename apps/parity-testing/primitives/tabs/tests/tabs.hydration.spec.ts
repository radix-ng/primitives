import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { compareObservations, type Checkpoint, type ExpectedDifference } from '../../../shared/compare';
import { validateExpectedDifferences } from '../../../shared/validate-differences';
import { hydrationCases, hydrationNonce } from '../hydration/cases';

const expected: ExpectedDifference[] = JSON.parse(
    readFileSync(new URL('../hydration/expected-differences.json', import.meta.url), 'utf8')
);
const reference = JSON.parse(readFileSync(new URL('../../../reference.json', import.meta.url), 'utf8'));
validateExpectedDifferences(expected, Object.keys(hydrationCases));

async function snapshot(page: Page) {
    return page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('[data-hydration-root]')].map((root) => {
            const tabs = [...root.querySelectorAll<HTMLElement>('[role="tab"]')];
            const panels = [...root.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
            const indicator = root.querySelector<HTMLElement>('[data-part="indicator"]');
            const selected = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true');
            const relation = (part: Element, attribute: string) => {
                const id = part.getAttribute(attribute);
                if (!id) return null;
                const target = document.getElementById(id);
                return target && root.contains(target) ? target.getAttribute('data-part') : 'dangling';
            };
            const rect = (element: Element) => {
                const bounds = element.getBoundingClientRect();
                return { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height };
            };
            const visible = (element: HTMLElement) => !element.hidden && element.getClientRects().length > 0;
            return {
                state: {
                    selected: tabs
                        .filter((tab) => tab.getAttribute('aria-selected') === 'true')
                        .map((tab) => tab.dataset.part),
                    tabs: tabs.map((tab) => ({ key: tab.dataset.part, tabIndex: tab.tabIndex })),
                    panels: panels.map((panel) => ({
                        key: panel.dataset.part,
                        hidden: panel.hidden,
                        inert: panel.inert,
                        tabIndex: panel.tabIndex
                    })),
                    relationships: Object.fromEntries([
                        ...tabs.map((tab) => [tab.dataset.part, relation(tab, 'aria-controls')]),
                        ...panels.map((panel) => [panel.dataset.part, relation(panel, 'aria-labelledby')])
                    ]),
                    visiblePanels: panels.filter(visible).map((panel) => panel.dataset.part),
                    indicatorVisible: !!indicator && visible(indicator),
                    variables:
                        indicator && visible(indicator)
                            ? Object.fromEntries(
                                  ['top', 'right', 'bottom', 'left', 'width', 'height'].map((key) => [
                                      key,
                                      Number.parseFloat(indicator.style.getPropertyValue('--active-tab-' + key))
                                  ])
                              )
                            : null,
                    fields: panels.map((panel) => ({
                        key: panel.dataset.part,
                        value: panel.querySelector('input')!.value
                    }))
                },
                ids: Object.fromEntries([...tabs, ...panels].map((part) => [part.dataset.part, part.id])),
                dom: root.outerHTML,
                bounds: {
                    tab: selected ? rect(selected) : null,
                    indicator: indicator && visible(indicator) ? rect(indicator) : null
                }
            };
        })
    );
}
type Snapshot = Awaited<ReturnType<typeof snapshot>>;
interface HydrationWindow extends Window {
    tabsServerNodes: Element[];
    tabsHiddenMutations: { previous: string | null }[];
    tabsHiddenObservers: MutationObserver[];
}
interface Observation {
    checkpoints: Checkpoint[];
    measurements: { name: string; groups: Snapshot }[];
    reference?: { commit: string; packageVersion: string; digest: string };
    errors: string[];
    reused?: boolean;
    hiddenMutations?: { previous: string | null }[];
}
async function frames(page: Page) {
    await page.evaluate(
        () =>
            new Promise<void>((resolve) =>
                requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
            )
    );
}
function record(observation: Observation, name: string, groups: Snapshot) {
    observation.checkpoints.push({
        name,
        state: Object.fromEntries(
            Object.keys(groups[0].state).map((key) => [
                key,
                groups.map((group) => group.state[key as keyof typeof group.state])
            ])
        )
    });
    observation.measurements.push({ name, groups });
}
for (const [name, settings] of Object.entries(hydrationCases)) {
    test(name, async ({ browser, baseURL, request }, info) => {
        const failures: string[] = [];
        const observations: Record<'angular' | 'react', Observation> = {
            angular: { checkpoints: [], measurements: [], errors: [] },
            react: { checkpoints: [], measurements: [], errors: [] }
        };
        for (const framework of ['angular', 'react'] as const) {
            const observation = observations[framework];
            const url = `/${framework}-hydration.html?case=${name}`;
            // Repeated requests exercise a long-lived SSR process before a fresh browser starts.
            for (let warmup = 0; warmup < 2; warmup++) {
                const response = await request.get(url);
                expect(response.ok(), await response.text()).toBe(true);
                if (settings.csp) {
                    expect(response.headers()['content-security-policy']).toContain(`'nonce-${hydrationNonce}'`);
                    expect(await response.text()).toContain(`nonce="${hydrationNonce}"`);
                }
            }
            const page = await browser.newPage({ baseURL, viewport: { width: 640, height: 480 } });
            page.on('pageerror', (error) => observation.errors.push(error.message));
            page.on('console', (message) => {
                if (message.type() === 'error') observation.errors.push(message.text());
            });
            let release!: () => void;
            const gate = new Promise<void>((resolve) => {
                release = resolve;
            });
            await page.route('**/assets/*.js', async (route) => {
                await gate;
                await route.continue();
            });
            try {
                await page.goto(url, { waitUntil: 'commit' });
                await expect(page.getByRole('tab').first()).toBeVisible();
                await frames(page);
                expect(await page.evaluate(() => window.tabsHydration)).toBeUndefined();
                const before = await snapshot(page);
                record(observation, 'before hydration', before);
                await page.evaluate(() => {
                    const probe = window as HydrationWindow;
                    probe.tabsServerNodes = [...document.querySelectorAll('[data-hydration-root], [data-part]')];
                    probe.tabsHiddenMutations = [];
                    probe.tabsHiddenObservers = [...document.querySelectorAll('[data-part="indicator"]')].map(
                        (indicator) => {
                            const observer = new MutationObserver((records) => {
                                for (const record of records)
                                    probe.tabsHiddenMutations.push({ previous: record.oldValue });
                            });
                            observer.observe(indicator, {
                                attributes: true,
                                attributeFilter: ['hidden'],
                                attributeOldValue: true
                            });
                            return observer;
                        }
                    );
                });
                if (settings.value !== null)
                    await page
                        .locator(`[data-hydration-root="0"] [data-part="field-${settings.value}"]`)
                        .fill('before hydration');
                release();
                await expect.poll(() => page.evaluate(() => window.tabsHydration?.ready)).toBe(true);
                await frames(page);
                const after = await snapshot(page);
                record(observation, 'after hydration', after);
                observation.reused = await page.evaluate(() => {
                    const before = (window as unknown as { tabsServerNodes: Element[] }).tabsServerNodes;
                    const after = [...document.querySelectorAll('[data-hydration-root], [data-part]')];
                    return before.length === after.length && before.every((node, index) => node === after[index]);
                });
                observation.hiddenMutations = await page.evaluate(() => {
                    const probe = window as HydrationWindow;
                    probe.tabsHiddenObservers.forEach((observer) => observer.disconnect());
                    return probe.tabsHiddenMutations;
                });
                if (settings.prepaint && !settings.transformed && !settings.zero)
                    expect(
                        observation.hiddenMutations,
                        `${framework}: preserves the visible Indicator during hydration`
                    ).toEqual([]);
                const probe = await page.evaluate(() => window.tabsHydration);
                observation.reference = probe.reference;
                expect(probe.reference.commit).toBe(reference.commit);
                expect(probe.reference.packageVersion).toBe(reference.packageVersion);
                expect(observation.reused, `${framework}: server nodes reused`).toBe(true);
                expect(
                    after.map((group) => group.ids),
                    `${framework}: native IDs survive hydration`
                ).toEqual(before.map((group) => group.ids));
                expect(probe.changes, `${framework}: initialization notifications`).toEqual(
                    settings.implicit ? [{ group: 0, value: 0, reason: 'initial' }] : []
                );
                for (let group = 0; group < before.length; group++) {
                    expect(before[group].state.selected).toEqual(
                        settings.value === null ? [] : [`tab-${settings.value}`]
                    );
                    expect(before[group].state.indicatorVisible, `${framework}: before client bootstrap`).toBe(
                        !!settings.prepaint && settings.value !== null && !settings.transformed && !settings.zero
                    );
                    expect(after[group].state.visiblePanels).toEqual(
                        settings.value === null ? [] : [`panel-${settings.value}`]
                    );
                    expect(after[group].state.indicatorVisible).toBe(settings.value !== null && !settings.zero);
                    for (const phase of [before[group], after[group]]) {
                        if (phase.bounds.indicator) {
                            for (const key of ['x', 'y', 'width', 'height'] as const)
                                expect(phase.bounds.indicator[key]).toBeCloseTo(phase.bounds.tab![key], 1);
                        }
                    }
                }
                if (settings.value !== null) {
                    await expect(
                        page.locator(`[data-hydration-root="0"] [data-part="field-${settings.value}"]`)
                    ).toHaveValue('before hydration');
                    await expect(
                        page.locator(`[data-hydration-root="0"] [data-part="field-${settings.value}"]`)
                    ).toBeFocused();
                }
                await page.locator('[data-hydration-root="0"] [data-part="tab-2"]').click();
                await frames(page);
                const tab =
                    browser.browserType().name() === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab';
                await page.keyboard.press(tab);
                await expect(page.locator('[data-hydration-root="0"] [data-part="panel-2"]')).toBeFocused();
                record(observation, 'after native activation', await snapshot(page));
                const changes = await page.evaluate(() => window.tabsHydration.changes);
                expect(changes).toEqual([...probe.changes, { group: 0, value: 2, reason: 'none' }]);
                observation.checkpoints.push({ name: 'notifications', state: { changes } });
                expect(observation.errors).toEqual([]);
                expect(await page.evaluate(() => window.tabsHydration.errors)).toEqual([]);
            } catch (error) {
                failures.push(`${framework}: ${String(error)}`);
            } finally {
                release();
                await page.close();
            }
        }
        const comparison = compareObservations(
            name,
            observations.angular.checkpoints,
            observations.react.checkpoints,
            expected,
            browser.browserType().name()
        );
        for (const category of new Set(comparison.differences.map((diff) => diff.category)))
            info.annotations.push({ type: 'recorded-difference', description: category });
        await info.attach('observations', {
            contentType: 'application/json',
            body: JSON.stringify(
                {
                    scenario: name,
                    browser: { name: browser.browserType().name(), version: browser.version() },
                    reference: observations.react.reference,
                    angular: observations.angular,
                    react: observations.react,
                    failures,
                    ...comparison
                },
                null,
                2
            )
        });
        expect(failures).toEqual([]);
        expect(observations.angular.reference?.digest).toBe(observations.react.reference?.digest);
        expect(comparison.unexpected, 'New or changed differences').toEqual([]);
        expect(comparison.stale, 'Disappeared differences require review').toEqual([]);
    });
}
