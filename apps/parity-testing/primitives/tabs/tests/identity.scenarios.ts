import { expect } from '@playwright/test';
import { identityCases, type IdentityCaseName } from '../src/identity';
import type { TabsDriver } from './driver';

export const identityScenarios = (Object.keys(identityCases) as IdentityCaseName[]).map((name) => ({
    name,
    async run(driver: TabsDriver) {
        const kind = identityCases[name].identity!;
        const roots = kind === 'roots' ? ['a', 'b'] : ['a'];
        const links = (part: 'tab' | 'panel', entries: Record<string, string | null>) =>
            Object.fromEntries(
                roots.flatMap((root) =>
                    Object.entries(entries).map(([key, target]) => [
                        `${root}-${part}-${key}`,
                        target === null ? null : `${root}-${part === 'tab' ? 'panel' : 'tab'}-${target}`
                    ])
                )
            );
        const controls = (entries: Record<string, string | null> = { zero: 'zero', one: 'one' }) =>
            links('tab', entries);
        const labels = (entries: Record<string, string | null> = { zero: 'zero', one: 'one' }) =>
            links('panel', entries);
        let c: Record<string, string | null> = { zero: 'zero', one: 'one' };
        let l: Record<string, string | null> = { zero: 'zero', one: 'one' };
        if (kind === 'absent-panel') {
            c.one = null;
            l = { zero: 'zero' };
        }
        if (kind === 'absent-tab') {
            c = { zero: 'zero' };
            l.one = null;
        }
        if (kind === 'shadowed' || kind === 'owner-remove') {
            c.one = 'owner';
            l = { zero: 'zero', shadowed: 'one', owner: 'one' };
        }
        if (kind === 'insert-owner') {
            c.one = 'owner';
            l = { zero: 'zero', owner: 'one' };
        }
        if (kind === 'panel-value') c.two = null;
        if (kind === 'tab-value') {
            l.two = null;
        }
        if (kind === 'presence') l = { zero: 'zero' };
        const initialControls =
            kind === 'panel-id'
                ? {
                      'a-tab-zero': driver.framework === 'react' ? 'dangling' : 'a-panel-zero',
                      'a-tab-one': 'a-panel-one'
                  }
                : kind === 'presence'
                  ? { 'a-tab-zero': 'a-panel-zero', 'a-tab-one': null }
                  : controls(c);
        await driver.identityCheckpoint('initial identities', {
            controls: initialControls,
            labels: labels(l),
            changes: [],
            ...(kind === 'tab-id' || kind === 'indicator' ? { authored: { 'a-tab-zero': 'a-authored-tab' } } : {}),
            ...(kind === 'panel-id' ? { authored: { 'a-panel-zero': 'a-authored-panel' } } : {}),
            ...(kind === 'indicator' ? { indicatorFollowsActiveTab: true } : {})
        });
        if (kind === 'mixed-values' || kind === 'roots' || kind === 'presence') {
            const root = kind === 'roots' ? 'b' : 'a';
            await driver.page.getByTestId(`${root}-tab-one`).press('Enter');
            await expect(driver.page.getByTestId(`${root}-tab-one`)).toHaveAttribute('aria-selected', 'true');
            await driver.identityCheckpoint('selection preserves identity ownership', {
                controls:
                    kind === 'presence'
                        ? {
                              'a-tab-zero': null,
                              'a-tab-one': 'a-panel-one'
                          }
                        : controls(),
                labels: kind === 'presence' ? labels({ one: 'one' }) : labels(),
                selected: kind === 'roots' ? { a: [0], b: [1] } : { a: [kind === 'mixed-values' ? '1' : 1] }
            });
            if (kind === 'presence') {
                await driver.page.getByTestId('a-tab-zero').press('Enter');
                await driver.identityCheckpoint('remounted Panel preserves its owner identity', {
                    controls: { 'a-tab-zero': 'a-panel-zero', 'a-tab-one': null },
                    labels: labels({ zero: 'zero' }),
                    idStatus: { 'a-tab-zero': 'same', 'a-tab-one': 'same', 'a-panel-zero': 'same' }
                });
            }
            return;
        }
        await driver.page.keyboard.press('F2');
        if (kind === 'retained') {
            c.one = null;
            delete l.one;
        }
        if (kind === 'absent-panel') {
            c.one = 'one';
            l.one = 'one';
        }
        if (kind === 'absent-tab') {
            c = {};
            l = { zero: null, one: null };
        }
        if (kind === 'replace') {
            c.one = 'replacement';
            l = { zero: 'zero', replacement: 'one' };
        }
        if (kind === 'shadowed') delete l.shadowed;
        if (kind === 'owner-remove') {
            c.one = null;
            delete l.owner;
        }
        if (kind === 'insert-owner') {
            c.one = 'new-owner';
            l['new-owner'] = 'one';
        }
        if (kind === 'panel-value') {
            c.one = null;
            c.two = 'one';
            l.one = 'two';
        }
        if (kind === 'tab-value') {
            c.one = 'two';
            l.one = null;
            l.two = 'one';
        }
        await driver.identityCheckpoint('updated identities', {
            controls:
                kind === 'panel-id'
                    ? {
                          'a-tab-zero': driver.framework === 'react' ? 'dangling' : 'a-panel-zero',
                          'a-tab-one': 'a-panel-one'
                      }
                    : controls(c),
            labels: labels(l),
            ...(kind === 'tab-id' || kind === 'indicator' ? { authored: { 'a-tab-zero': 'a-renamed-tab' } } : {}),
            ...(kind === 'panel-id' ? { authored: { 'a-panel-zero': 'a-renamed-panel' } } : {}),
            ...(kind === 'indicator' ? { indicatorFollowsActiveTab: true } : {})
        });
        if (['retained', 'tab-id', 'panel-id', 'insert-owner', 'indicator'].includes(kind)) {
            await driver.page.keyboard.press('F3');
            if (kind === 'retained') {
                c.one = 'one';
                l.one = 'one';
            }
            if (kind === 'insert-owner') delete l.owner;
            await driver.identityCheckpoint('restored or cleared identities', {
                controls: controls(c),
                labels: labels(l),
                ...(kind === 'indicator' ? { indicatorFollowsActiveTab: true } : {})
            });
        }
    }
}));
