import { expect } from '@playwright/test';
import { cases } from '../src/contract';
import type { AccordionDriver } from './driver';
import { nativeLinkRepeat } from './native-link';

export const activationScenarios = Object.entries(cases)
    .filter(([, s]) => s.activation)
    .map(([name, s]) => ({
        name,
        async run(d: AccordionDriver) {
            const { page } = d;
            const p = s.activation!;
            const subject = page.getByTestId('a-trigger');
            const key = p.key ?? 'Enter';
            const native = p.host === 'button';
            const pointer = !p.key;
            const linkRepeat =
                p.host === 'link' && p.action === 'repeat' && p.key === 'Enter'
                    ? await nativeLinkRepeat(page.context().browser()!)
                    : undefined;
            if (linkRepeat) d.measurements.push({ name: 'plain HTML link Enter repeat', state: linkRepeat });
            let field = 'initial';
            await expect.poll(() => page.evaluate(() => window.accordionActivation.ready)).toBe(true);
            const checkpoint = async (name: string, count: number, extra: Record<string, unknown> = {}) => {
                const read = () =>
                    page.evaluate(() => {
                        const triggers = ['a', 'b'].map(
                            (id) => document.querySelector<HTMLElement>(`[data-testid="${id}-trigger"]`)!
                        );
                        const trigger = triggers[0];
                        return {
                            open: triggers.map((node) => node.getAttribute('aria-expanded') === 'true'),
                            focus:
                                document.activeElement?.getAttribute('data-testid') ?? document.activeElement?.tagName,
                            hash: location.hash,
                            field: (document.querySelector('[data-testid="field"]') as HTMLInputElement).value,
                            host: {
                                tag: trigger.tagName,
                                type: trigger.getAttribute('type'),
                                role: trigger.getAttribute('role'),
                                tabIndex: trigger.tabIndex,
                                disabled: trigger.hasAttribute('disabled'),
                                ariaDisabled: trigger.getAttribute('aria-disabled'),
                                dataDisabled: trigger.hasAttribute('data-disabled')
                            },
                            controls: triggers.map((node, i) => {
                                const panel = document.querySelector<HTMLElement>(
                                    `[data-testid="${i ? 'b' : 'a'}-panel"]`
                                )!;
                                return {
                                    expanded: node.getAttribute('aria-expanded'),
                                    labelled: panel.getAttribute('aria-labelledby') === node.id,
                                    controls:
                                        node.getAttribute('aria-expanded') === 'true'
                                            ? node.getAttribute('aria-controls') === panel.id
                                            : !node.hasAttribute('aria-controls'),
                                    hidden: panel.getAttribute('hidden')
                                };
                            }),
                            trace: window.accordionParity.trace,
                            observed: window.accordionActivation
                        };
                    });
                const expected = {
                    open: [count % 2 === 1, false],
                    field: count && p.type === 'reset' ? 'initial' : field,
                    ...extra
                };
                await expect.poll(read).toMatchObject(expected);
                let state = await read();
                let previous = '';
                let stable = 0;
                for (let frame = 0; frame < 120; frame++) {
                    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
                    state = await read();
                    const current = JSON.stringify(state);
                    stable = current === previous ? stable + 1 : 0;
                    if (stable >= 3) break;
                    if (frame === 119) throw new Error('Accordion activation did not settle');
                    previous = current;
                }
                expect(state).toMatchObject(expected);
                const target = p.action === 'child-click' ? 'a-child' : 'a-trigger';
                expect(state.trace).toEqual(
                    Array.from({ length: count }, (_, index) => [
                        {
                            part: 'a',
                            next: index % 2 === 0,
                            reason: 'trigger-press',
                            type: 'click',
                            target,
                            shared: true
                        },
                        {
                            part: 'root',
                            next: index % 2 === 0 ? ['a'] : [],
                            reason: 'trigger-press',
                            type: 'click',
                            target,
                            shared: true
                        }
                    ]).flat()
                );
                const trusted = pointer || native || (p.host === 'link' && key === 'Enter');
                const detail =
                    pointer ||
                    (p.host === 'link' &&
                        key === 'Enter' &&
                        page.context().browser()!.browserType().name() === 'firefox')
                        ? 1
                        : 0;
                expect(state.observed.requests).toHaveLength(count * 2);
                for (const event of state.observed.requests) {
                    expect(event).toMatchObject({
                        type: 'click',
                        target,
                        trusted,
                        detail,
                        shift: p.action === 'modified',
                        ctrl: p.action === 'modified',
                        alt: false,
                        meta: false
                    });
                }
                const stoppedClick = p.action === 'stop' && p.event === 'click';
                expect(
                    state.observed.sequence.filter((part) => ['a', 'root', 'ancestor:click'].includes(part))
                ).toEqual(
                    Array.from({ length: count }, () =>
                        stoppedClick ? ['a', 'root'] : ['a', 'root', 'ancestor:click']
                    ).flat()
                );
                // Each consumer click precedes the corresponding Item/Root transaction.
                const clicks = state.observed.sequence.filter(
                    (part) => (part.endsWith(':click') && part !== 'ancestor:click') || part === 'a' || part === 'root'
                );
                expect(clicks).toEqual(
                    Array.from({ length: count }, () => [
                        `${p.binding === 'native' ? 'native' : 'host'}:click`,
                        'a',
                        'root'
                    ]).flat()
                );
                expect(state.observed.submitters).toEqual(
                    count && p.type === 'submit' ? Array(count).fill('a-trigger') : []
                );
                expect(state.observed.resets).toBe(p.type === 'reset' ? count : 0);
                for (const control of state.controls) expect(control).toMatchObject({ labelled: true, controls: true });
                expect(d.errors).toEqual([]);
                d.checkpoints.push({ name, state });
                d.measurements.push({ name, dom: await page.locator('body').innerHTML() });
                return state;
            };
            await checkpoint('initial native semantics', 0, {
                hash: '',
                host: {
                    tag: native ? 'BUTTON' : p.host === 'span' ? 'SPAN' : 'A',
                    type: native ? (p.type ?? 'button') : null,
                    role: native ? null : 'button',
                    tabIndex: 0,
                    disabled: false,
                    ariaDisabled: null,
                    dataDisabled: false
                }
            });
            await page.getByTestId('field').fill('edited');
            field = 'edited';
            if (p.action === 'navigation') {
                await page.getByTestId('field').focus();
                await page.keyboard.press('Tab');
                await checkpoint('Tab enters first trigger', 0, { focus: 'a-trigger' });
                for (const key of ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End']) {
                    await page.keyboard.press(key);
                    await checkpoint(`${key} preserves normal focus ownership`, 0, { focus: 'a-trigger' });
                }
                await page.keyboard.press('Tab');
                await checkpoint('Tab reaches sibling trigger', 0, { focus: 'b-trigger' });
                await page.keyboard.press('Shift+Tab');
                await checkpoint('Shift+Tab returns to first trigger', 0, { focus: 'a-trigger' });
                await page.keyboard.press('Shift+Tab');
                await checkpoint('Shift+Tab leaves the root', 0, { focus: 'field' });
                return;
            }
            if (p.action === 'child-key') {
                await page.getByTestId('a-child').focus();
                await page.keyboard.press(key);
                await checkpoint('descendant key does not activate the owning trigger', 0, { focus: 'a-child' });
                return;
            }
            if (pointer) {
                if (p.action === 'child-click') await page.getByTestId('a-child').click();
                else if (p.action === 'pointer') {
                    await page.getByTestId('field').focus();
                    const box = (await subject.boundingBox())!;
                    await page.mouse.move(box.x + 4, box.y + 4);
                    await page.mouse.down();
                    await checkpoint('prevented pointerdown preserves prior focus', 0, { focus: 'field' });
                    await page.mouse.up();
                } else await subject.click({ position: { x: 4, y: 4 } });
                await checkpoint('pointer activation and native default', 1, {
                    hash: p.host === 'link' && p.action !== 'prevent' ? '#accordion-activated' : ''
                });
                return;
            }
            await subject.focus();
            if (p.action === 'modified') {
                await page.keyboard.down('Control');
                await page.keyboard.down('Shift');
            }
            await page.keyboard.down(key);
            const countOnDown = key === 'Enter' && !(p.action === 'prevent' && p.event === 'keydown') ? 1 : 0;
            await checkpoint('first keydown phase', countOnDown);
            if (p.action === 'disable-held') {
                await checkpoint('disabled state arrives before release', 0, {
                    host: { disabled: native, ariaDisabled: native ? null : 'true', dataDisabled: true }
                });
                await page.keyboard.up(key);
                await checkpoint('release while disabled does not activate', 0);
                await page.getByTestId('enable').click();
                await expect(subject).not.toHaveAttribute('data-disabled');
                await subject.focus();
                await page.keyboard.press('Space');
                await checkpoint('reactivation after interrupted press', 1);
                return;
            }
            if (p.action === 'blur') {
                await page.getByTestId('after').focus();
                await page.keyboard.up(key);
                await checkpoint('Space released after focus leaves', 0, { focus: 'after', hash: '' });
                return;
            }
            let count = countOnDown;
            if (p.action === 'repeat') {
                await page.keyboard.down(key);
                await page.keyboard.down(key);
                count = linkRepeat?.repeated ?? (key === 'Enter' ? 3 : 0);
                const repeated = await checkpoint('repeated keydown phase', count);
                expect(
                    repeated.observed.consumers.filter((event) => event.type === 'keydown').map((event) => event.repeat)
                ).toEqual([false, true, true]);
            }
            await page.keyboard.up(key);
            if (linkRepeat) count = linkRepeat.released;
            if (key === 'Space') {
                const canceled = p.action === 'prevent' && (p.event === 'keyup' || (native && p.event === 'keydown'));
                count = canceled ? 0 : 1;
            }
            if (p.action === 'modified') {
                await page.keyboard.up('Shift');
                await page.keyboard.up('Control');
            }
            await checkpoint('keyup phase and native default', count, {
                hash: count && p.host === 'link' ? '#accordion-activated' : ''
            });
        }
    }));
