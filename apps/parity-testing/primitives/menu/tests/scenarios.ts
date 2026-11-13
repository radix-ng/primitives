import { expect } from '@playwright/test';
import { rootRemovalScenarios } from '../../../shared/root-removal.scenarios';
import { basicCases } from '../src/contract';
import { collectionScenarios } from './collection.scenarios';
import type { MenuDriver } from './driver';
import { emptyScenarios } from './empty.scenarios';
import { focusBoundaryScenarios } from './focus-boundary.scenarios';
import { highlightScenarios } from './highlight.scenarios';
import { hostScenarios } from './hosts.scenarios';
import { hybridScenarios } from './hybrid.scenarios';
import { initialFocusScenarios } from './initial-focus.scenarios';
import { lifecycleScenarios } from './lifecycle.scenarios';
import { pointerScenarios } from './pointer.scenarios';
import { projectionScenarios } from './projection.scenarios';
import { touchScenarios } from './touch.scenarios';
import { multiTriggerLifecycleScenarios } from './trigger-lifecycle.scenarios';
import { multiTriggerScenarios } from './triggers.scenarios';

export const scenarios = [
    ...multiTriggerLifecycleScenarios,
    ...highlightScenarios,
    ...multiTriggerScenarios,
    ...projectionScenarios,
    ...focusBoundaryScenarios,
    ...basicCases.map((name) => ({
        name,
        async run(d: MenuDriver) {
            if (name === 'disabled-trigger' || name === 'cancel-open') {
                const box = (await d.trigger.boundingBox())!;
                await d.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
                await d.checkpoint('opening blocked', {
                    open: false,
                    mounted: false,
                    completions: { main: [], sub: [] }
                });
                return;
            }
            const pointer = ['pointer-open', 'pointer-tab', 'pointer-highlight', 'pointer-select'].includes(name);
            const key = pointer
                ? 'mouse'
                : name === 'keyboard-up'
                  ? 'ArrowUp'
                  : name === 'keyboard-down'
                    ? 'ArrowDown'
                    : name === 'keyboard-space'
                      ? 'Space'
                      : 'Enter';
            await d.open(key);
            await d.checkpoint('opened', { open: true, visible: true, role: 'menu' });
            if (!pointer) await expect(d.item(name === 'keyboard-up' ? 'omega' : 'alpha')).toBeFocused();

            if (name.endsWith('-ids')) {
                await expect(d.trigger).toHaveAttribute('id', 'custom-trigger');
                await expect(d.popup).toHaveAttribute('id', 'custom-popup');
                if (name === 'dynamic-ids') {
                    // The pin keys trigger registration by id. Change that identity between opens;
                    // Angular's additional live-id behavior is checked independently in unit/browser tests.
                    await d.page.keyboard.press('Escape');
                    await d.closed();
                    await d.page.keyboard.press('F2');
                    await expect(d.trigger).toHaveAttribute('id', 'renamed-trigger');
                    await d.open();
                    await expect(d.popup).toHaveAttribute('id', 'renamed-popup');
                }
                await d.checkpoint('custom associations', { labelled: true, controlsLinked: true });
            }

            if (name === 'focus-out') {
                await d.item('after').focus();
                await d.checkpoint('outside focused', { focus: 'after' });
                return;
            }

            if (name === 'navigation' || name === 'no-loop') {
                await d.page.keyboard.press('ArrowDown');
                await expect(d.item('blocked')).toBeFocused();
                await d.checkpoint('disabled focusable', { selected: [] });
                await d.page.keyboard.press('End');
                await expect(d.item('omega')).toBeFocused();
                await d.page.keyboard.press('ArrowDown');
                await expect(d.item(name === 'no-loop' ? 'omega' : 'alpha')).toBeFocused();
                await d.checkpoint('last edge');
                await d.page.keyboard.press('Home');
                await d.page.keyboard.press('ArrowUp');
                await expect(d.item(name === 'no-loop' ? 'alpha' : 'omega')).toBeFocused();
                await d.checkpoint('first edge');
            }
            if (name === 'typeahead' || name === 'explicit-label') {
                if (name === 'explicit-label') await d.navigateTo('bravo');
                await d.page.keyboard.press(name === 'explicit-label' ? 'z' : 'b');
                await expect(d.item(name === 'explicit-label' ? 'alpha' : 'blocked')).toBeFocused();
                await d.checkpoint('matched');
                if (name === 'typeahead') {
                    await d.page.keyboard.press('b');
                    await expect(d.item('bravo')).toBeFocused();
                    await d.checkpoint('repeated character');
                }
            }
            if (name === 'disabled-item') {
                await d.navigateTo('blocked');
                await d.page.keyboard.press('Enter');
                await d.checkpoint('disabled activation ignored', { open: true, selected: [] });
            }
            if (name === 'pointer-highlight') {
                await d.hoverItem('bravo');
                if (d.framework === 'angular' || d.page.context().browser()?.browserType().name() !== 'webkit') {
                    await expect(d.item('bravo')).toBeFocused();
                }
                await d.checkpoint('pointer highlighted', { selected: [] });
            }
            if (name === 'stay-open') {
                await d.navigateTo('stay');
                await d.page.keyboard.press('Enter');
                await d.checkpoint('selected without closing', { open: true, selected: ['stay'] });
            }
            if (name.startsWith('checkbox') || name.startsWith('radio')) {
                const checkbox = name.startsWith('checkbox'),
                    canceled = name.endsWith('cancel');
                await d.navigateTo(checkbox ? 'check' : 'radio-two');
                await d.page.keyboard.press('Enter');
                await d.checkpoint('value request', {
                    open: true,
                    ...(checkbox
                        ? { checked: canceled ? 'false' : 'true' }
                        : { radio: [canceled ? 'radio-one' : 'radio-two'] })
                });
                const clicks = await d.page.evaluate(
                    () => window.menuParity.gestures.filter((event) => event.type === 'click').length
                );
                if (!checkbox) await d.navigateTo('radio-one');
                await d.page.keyboard.press('Space');
                expect(
                    await d.page.evaluate(
                        () => window.menuParity.gestures.filter((event) => event.type === 'click').length
                    )
                ).toBe(clicks + 1);
                await d.checkpoint('Space activates once on keydown', {
                    open: true,
                    ...(checkbox ? { checked: 'false' } : { radio: ['radio-one'] })
                });
            }
            if (name === 'cancel-close') {
                await d.page.keyboard.press('Escape');
                await d.checkpoint('escape canceled', { open: true, completions: { main: [true], sub: [] } });
                await d.navigateTo('alpha');
                await d.page.keyboard.press('Enter');
                await d.checkpoint('selection close canceled', { open: true, selected: ['alpha'] });
                return;
            }
            if (name.startsWith('submenu')) {
                const rtl = name === 'submenu-rtl';
                await d.openSub(rtl, name === 'submenu-enter' ? 'Enter' : undefined);
                await d.checkpoint('submenu opened', { open: true, subOpen: true, subVisible: true });
                if (name === 'submenu-select') {
                    await d.page.keyboard.press('Enter');
                    await d.closed();
                    await d.checkpoint('whole chain selected', { open: false, selected: ['sub-alpha'] });
                    return;
                }
                await d.page.keyboard.press(rtl ? 'ArrowRight' : 'ArrowLeft');
                await expect(d.subPopup).toHaveCount(0);
                await expect(d.item('more')).toBeFocused();
                await d.checkpoint('submenu back', { open: true, subOpen: false });
                await d.openSub(rtl, name === 'submenu-enter' ? 'Enter' : undefined);
                await d.page.keyboard.press('Escape');
                await expect(d.subPopup).toHaveCount(0);
                await expect(d.item('more')).toBeFocused();
                await d.checkpoint('submenu escaped', { open: true, subOpen: false });
            }

            if (name === 'pointer-select') await d.item('alpha').click();
            else if (name === 'keyboard-select') await d.page.keyboard.press('Enter');
            else if (name === 'space-select') await d.page.keyboard.press('Space');
            else if (name.startsWith('outside-')) await d.outside();
            else if (name === 'tab' || name === 'pointer-tab') await d.page.keyboard.press('Tab');
            else if (name === 'shift-tab') await d.page.keyboard.press('Shift+Tab');
            else await d.page.keyboard.press('Escape');
            await d.closed();
            if (name === 'tab' || name === 'pointer-tab') await expect(d.item('after')).toBeFocused();
            else await expect(d.trigger).toBeFocused();
            await d.checkpoint('closed', {
                open: false,
                mounted: false,
                ...(name.startsWith('outside-') ? { activations: name === 'outside-modal' ? 0 : 1 } : {})
            });
        }
    })),
    ...lifecycleScenarios,
    ...pointerScenarios,
    ...collectionScenarios,
    ...emptyScenarios,
    ...touchScenarios,
    ...hybridScenarios,
    ...hostScenarios,
    ...initialFocusScenarios,
    ...rootRemovalScenarios<MenuDriver>({
        popup: 'popup',
        child: 'sub-popup',
        more: 'more',
        alpha: 'alpha',
        backgroundFocus: 'after',
        open: (d) => d.open()
    })
];
