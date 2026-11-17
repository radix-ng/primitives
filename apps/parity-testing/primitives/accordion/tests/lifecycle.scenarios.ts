import { expect } from '@playwright/test';
import { cases } from '../src/contract';
import type { AccordionDriver } from './driver';

export const lifecycleScenarios = Object.entries(cases)
    .filter(([, s]) => s.lifetime)
    .map(([name, s]) => ({
        name,
        async run(d: AccordionDriver) {
            const { page } = d;
            const mode = s.lifetime;
            if (mode === 'interrupt' || mode === 'remove') {
                // The pin discovers the animation type on open, before it measures a close.
                await page.addStyleTag({
                    content:
                        '@keyframes accordion-enter { from { opacity: 0 } to { opacity: 1 } } @keyframes accordion-exit { from { opacity: 1 } to { opacity: 0 } } [data-testid$="-panel"] { animation: accordion-enter 1ms linear; } [data-testid$="-panel"][data-ending-style] { animation: accordion-exit 1s linear; }'
                });
            }
            let originalId: string | null = null;
            const checkpoint = async (name: string, expected: Record<string, unknown>) => {
                const read = () =>
                    page.evaluate((originalId) => {
                        const panels = ['a', 'b'].map((id) => {
                            const panel = document.querySelector<HTMLElement>(`[data-testid="${id}-panel"]`);
                            const trigger = document.querySelector<HTMLElement>(`[data-testid="${id}-trigger"]`);
                            return {
                                present: !!panel,
                                value: panel?.querySelector('input')?.value ?? null,
                                hidden: panel?.getAttribute('hidden') ?? null,
                                ending: panel?.hasAttribute('data-ending-style') ?? false,
                                expanded: trigger?.getAttribute('aria-expanded') ?? null,
                                controls: !!panel && trigger?.getAttribute('aria-controls') === panel.id,
                                labelled: !!panel && panel.getAttribute('aria-labelledby') === trigger?.id
                            };
                        });
                        return {
                            panels,
                            children: window.accordionParity.children,
                            trace: window.accordionParity.trace,
                            stableId: originalId
                                ? document.querySelector<HTMLElement>('[data-testid="a-panel"]')?.id === originalId
                                : null
                        };
                    }, originalId);
                // Lifecycle cleanup and zero-motion exits may finish on the following render/frame.
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
                    if (frame === 119) throw new Error('Accordion lifecycle did not settle');
                    previous = current;
                }
                expect(state).toMatchObject(expected);
                expect(d.errors).toEqual([]);
                d.checkpoints.push({ name, state });
                d.measurements.push({ name, dom: await page.locator('body').innerHTML() });
            };
            const initialOpen = mode === 'reorder' || mode === 'conditional';
            const initialCount = mode === 'retain' || mode === 'search' ? 2 : initialOpen ? 1 : 0;
            await checkpoint('initial lifetime', { children: { created: initialCount, destroyed: 0 } });
            if (mode === 'override') {
                await page.getByTestId('override').click();
                await checkpoint('inherit root retention', { children: { created: 2, destroyed: 0 } });
                await page.getByTestId('keep').click();
                await checkpoint('remove retained closed views', { children: { created: 2, destroyed: 2 } });
                return;
            }
            if (!initialOpen) await page.getByTestId('a-trigger').click();
            await expect(page.getByTestId('a-panel')).toBeVisible();
            originalId = await page.getByTestId('a-panel').getAttribute('id');
            await page.getByTestId('a-panel').locator('input').fill('edited');
            await checkpoint('live child', {
                stableId: true,
                children: { created: Math.max(initialCount, 1), destroyed: 0 }
            });
            if (mode === 'reorder') {
                await page.getByTestId('reorder').click();
                await checkpoint('moved item preserves view', {
                    stableId: true,
                    children: { created: 1, destroyed: 0 }
                });
                await page.getByTestId('remove-a').click();
                await checkpoint('removed item disposes view', { children: { created: 1, destroyed: 1 } });
                return;
            }
            if (mode === 'conditional') {
                await page.getByTestId('toggle-panel').click();
                await checkpoint('conditional removal', { children: { created: 1, destroyed: 1 } });
                await page.getByTestId('toggle-panel').click();
                await checkpoint('conditional return', { stableId: true, children: { created: 2, destroyed: 1 } });
                return;
            }
            await page.getByTestId('a-trigger').click();
            if (mode === 'interrupt' || mode === 'remove') {
                await expect(page.getByTestId('a-panel')).toHaveAttribute('data-ending-style', '');
                await checkpoint('exit holds child', { stableId: true, children: { created: 1, destroyed: 0 } });
                if (mode === 'remove') {
                    await page.getByTestId('remove-root').click();
                    await checkpoint('root removal during exit', { children: { created: 1, destroyed: 1 } });
                    return;
                }
                await page.getByTestId('a-trigger').click();
                await checkpoint('reopen cancels exit', { stableId: true, children: { created: 1, destroyed: 0 } });
                return;
            }
            const retained = mode === 'retain' || mode === 'search';
            await checkpoint('closed lifetime', {
                children: { created: retained ? 2 : 1, destroyed: retained ? 0 : 1 }
            });
            await page.getByTestId('a-trigger').click();
            await checkpoint('returned lifetime', {
                stableId: true,
                children: { created: 2, destroyed: retained ? 0 : 1 }
            });
            await expect(page.getByTestId('a-panel').locator('input')).toHaveValue(retained ? 'edited' : 'initial');
        }
    }));
