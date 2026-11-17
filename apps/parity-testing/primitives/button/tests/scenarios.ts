import { expect } from '@playwright/test';
import { cases } from '../src/contract';
import { authoredScenarios } from './authored.scenarios';
import { disabledHandlerScenarios } from './disabled-handlers.scenarios';
import type { ButtonDriver } from './driver';
import { interactionScenarios } from './interaction.scenarios';
import { toggleScenarios } from './toggle.scenarios';

const standaloneScenarios = Object.entries(cases)
    .filter(([, settings]) => !settings.interaction && !settings.authored && !settings.toggle)
    .map(([name, settings]) => ({
        name,
        async run(d: ButtonDriver) {
            const native = settings.host === 'button';
            const subject = d.page.getByTestId('subject');
            const key = settings.key ?? 'Enter';
            const zero = { clicks: [], submits: [], resets: 0, hash: '', scrolled: false };
            await d.checkpoint('initial semantics', {
                ...zero,
                host: {
                    tag: native ? 'BUTTON' : settings.host === 'div' ? 'DIV' : settings.host === 'span' ? 'SPAN' : 'A',
                    role: native ? null : 'button',
                    type: native ? (settings.type ?? 'button') : null,
                    disabled: native && !!settings.disabled && !settings.focusableWhenDisabled,
                    ariaDisabled: !!settings.disabled && (!native || !!settings.focusableWhenDisabled),
                    dataDisabled: !!settings.disabled,
                    tabIndex: !native && settings.disabled && !settings.focusableWhenDisabled ? -1 : 0
                }
            });
            if (settings.action === 'disabled') {
                await d.page.getByTestId('field').focus();
                await d.page.keyboard.press('Tab');
                await expect(d.page.getByTestId(settings.focusableWhenDisabled ? 'subject' : 'after')).toBeFocused();
                await d.checkpoint('disabled tab order', zero);
                await d.pointerClick();
                // A non-native tabindex=-1 host remains programmatically focusable.
                if (!native || settings.focusableWhenDisabled) {
                    await subject.focus();
                    await d.page.keyboard.press('Enter');
                    await d.page.keyboard.press('Space');
                }
                await d.checkpoint('disabled activation suppressed', {
                    ...zero,
                    // The pin leaves Space's native scroll intact on a programmatically focused,
                    // disabled non-native host when focusableWhenDisabled is false.
                    scrolled: !native && !settings.focusableWhenDisabled
                });
                return;
            }
            if (settings.action === 'dynamic') {
                await d.focusSubject();
                await d.page.keyboard.press('F7');
                await d.page.keyboard.press('F6');
                await d.checkpoint('becomes disabled while focused', { ...zero, focus: 'subject' });
                await d.page.keyboard.press('Enter');
                await d.page.keyboard.press('Space');
                await d.pointerClick();
                await d.checkpoint('new disabled state blocks activation', zero);
                await d.page.keyboard.press('F6');
                await expect(subject).not.toHaveAttribute('data-disabled');
                await d.focusSubject();
                await d.page.keyboard.press('Enter');
                await d.checkpoint('reactivated', {
                    clicks: [
                        expect.objectContaining({ target: 'subject', trusted: native || settings.host === 'link' })
                    ],
                    hash: settings.host === 'link' ? '#activated' : '',
                    submits: [],
                    resets: 0,
                    scrolled: false
                });
                if (native) {
                    await d.page.keyboard.press('F8');
                    await expect(subject).toHaveAttribute('type', 'submit');
                    await d.page.keyboard.press('Enter');
                    await d.checkpoint('type changes to submit', { submits: ['subject'], resets: 0 });
                }
                return;
            }
            if (settings.action === 'descendant') {
                await d.page.getByTestId('child').focus();
                await d.page.keyboard.press(key);
                await d.checkpoint('descendant keeps keyboard defaults', {
                    ...zero,
                    focus: 'child',
                    scrolled: key === 'Space'
                });
                return;
            }
            await d.page.getByTestId('field').fill('edited');
            if (settings.action === 'pointer') {
                await d.pointerClick();
            } else {
                await d.focusSubject();
                if (settings.action === 'blur') {
                    await d.page.keyboard.down('Space');
                    await d.page.getByTestId('after').focus();
                    await d.page.keyboard.up('Space');
                    await d.checkpoint('space released elsewhere', { ...zero, focus: 'after' });
                    return;
                }
                if (settings.modified) {
                    await d.page.keyboard.down('Control');
                    await d.page.keyboard.down('Shift');
                }
                await d.page.keyboard.down(key);
                const clicksOnDown = key === 'Enter' && settings.cancel !== 'keydown' ? 1 : 0;
                await d.checkpoint('keydown phase', {
                    clicks: Array.from({ length: clicksOnDown }, () => expect.objectContaining({ target: 'subject' })),
                    scrolled: false
                });
                if (settings.action === 'repeat') {
                    await d.page.keyboard.down(key);
                    await d.page.keyboard.down(key);
                }
                await d.page.keyboard.up(key);
                if (settings.modified) {
                    await d.page.keyboard.up('Shift');
                    await d.page.keyboard.up('Control');
                }
            }
            const canceled =
                settings.cancel === 'keyup' || (settings.cancel === 'keydown' && (key === 'Enter' || native));
            const count = canceled ? 0 : settings.action === 'repeat' && key === 'Enter' ? 3 : 1;
            const prevented = settings.cancel === 'click';
            // Firefox reports detail=1 for its native keyboard link click; retain that raw value.
            const firefoxLinkEnter =
                settings.host === 'link' &&
                key === 'Enter' &&
                d.page.context().browser()?.browserType().name() === 'firefox';
            await d.checkpoint('activation complete', {
                clicks: Array.from({ length: count }, () =>
                    expect.objectContaining({
                        target: 'subject',
                        detail: settings.action === 'pointer' || firefoxLinkEnter ? 1 : 0,
                        trusted:
                            settings.action === 'pointer' || native || (settings.host === 'link' && key === 'Enter'),
                        shift: !!settings.modified,
                        ctrl: !!settings.modified,
                        alt: false,
                        meta: false,
                        prevented
                    })
                ),
                submits: count && !prevented && settings.type === 'submit' ? Array(count).fill('subject') : [],
                resets: count && !prevented && settings.type === 'reset' ? count : 0,
                field: count && !prevented && settings.type === 'reset' ? 'initial' : 'edited',
                hash: count && !prevented && settings.host === 'link' ? '#activated' : '',
                scrolled: false
            });
        }
    }));
export const scenarios = [
    ...standaloneScenarios,
    ...interactionScenarios,
    ...authoredScenarios,
    ...disabledHandlerScenarios,
    ...toggleScenarios
];
