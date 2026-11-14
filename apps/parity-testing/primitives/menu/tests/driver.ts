import { expect, type Page } from '@playwright/test';
import type { CaseName, Probe } from '../src/contract';
import { readPopupIsolation } from './overlay.observations';

export class MenuDriver {
    readonly checkpoints: { name: string; state: Record<string, unknown> }[] = [];
    readonly measurements: { name: string; bounds: unknown }[] = [];
    readonly errors: string[] = [];
    metadata?: Probe['reference'];
    constructor(
        readonly page: Page,
        readonly framework: 'angular' | 'react'
    ) {
        page.on('pageerror', (error) => this.errors.push(error.message));
        page.on('console', (message) => {
            if (message.type() === 'error' || /NG095[36]/.test(message.text())) this.errors.push(message.text());
        });
    }
    get trigger() {
        return this.page.getByTestId('primary');
    }
    get popup() {
        return this.page.getByTestId('popup');
    }
    get subPopup() {
        return this.page.getByTestId('sub-popup');
    }
    item(id: string) {
        return this.page.getByTestId(id);
    }
    async goto(name: CaseName) {
        if (name.startsWith('root-remove-') || name.startsWith('empty-')) await this.page.clock.install();
        await this.page.goto(`/${this.framework}.html?case=${name}`);
        if (name.startsWith('dialog-menu-')) {
            await this.item('dialog-trigger').click();
            await expect(this.item('dialog-popup')).toBeVisible();
            await expect.poll(() => this.page.evaluate(() => window.menuParity.dialog?.completions.at(-1))).toBe(true);
        }
        if (name.startsWith('popover-menu-')) {
            await this.item('host-trigger').click();
            await expect(this.item('host-popup')).toBeVisible();
            await expect.poll(() => this.page.evaluate(() => window.menuParity.popover?.completions.at(-1))).toBe(true);
        }
        await expect(this.trigger).toBeVisible();
        this.metadata = await this.page.evaluate(() => window.menuParity.reference);
        await this.checkpoint('initial');
    }
    async open(key: string = 'Enter') {
        if (key === 'mouse') await this.trigger.click();
        else await this.trigger.press(key);
        await expect(this.popup).toBeVisible();
        await expect.poll(() => this.page.evaluate(() => window.menuParity.completions.main.at(-1))).toBe(true);
    }
    async closed() {
        await expect(this.trigger).toHaveAttribute('aria-expanded', 'false');
        const retained = await this.page.evaluate(() => window.menuParity.config.lifecycle?.keepMounted ?? false);
        if (retained) {
            await expect(this.popup).toHaveCount(1);
            await expect(this.popup).toBeHidden();
        } else await expect(this.popup).toHaveCount(0);
        const retainedSub = await this.page.evaluate(
            () =>
                (window.menuParity.config.empty?.retained && window.menuParity.config.empty.nested) ||
                (window.menuParity.config.focusBoundary?.retained && window.menuParity.config.focusBoundary.nested) ||
                (window.menuParity.config.projection?.retained && window.menuParity.config.projection.nested) ||
                (window.menuParity.config.host?.initial?.nested && window.menuParity.config.host.retained) ||
                (window.menuParity.config.dialog?.nested && window.menuParity.config.dialog.retained) ||
                (window.menuParity.config.popover?.nested && window.menuParity.config.popover.retained)
        );
        if (retainedSub) await expect(this.subPopup).toBeHidden();
        else await expect(this.subPopup).toHaveCount(0);
        await expect.poll(() => this.page.evaluate(() => window.menuParity.completions.main.at(-1))).toBe(false);
    }
    async navigateTo(id: string) {
        for (let step = 0; step < 12; step++) {
            const focused = await this.page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
            if (focused === id) return;
            await this.page.keyboard.press('ArrowDown');
        }
        await expect(this.item(id)).toBeFocused();
    }
    async outside() {
        const box = (await this.item('outside').boundingBox())!;
        await this.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    }
    async hoverItem(id: string) {
        const box = (await this.item(id).boundingBox())!;
        // A real path across the item distinguishes movement from WebKit's initial zero-delta event.
        await this.page.mouse.move(box.x + 4, box.y + box.height / 2);
        await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 3 });
    }
    async openSub(rtl = false, key = rtl ? 'ArrowLeft' : 'ArrowRight') {
        await this.navigateTo('more');
        await this.page.keyboard.press(key);
        await expect(this.subPopup).toBeVisible();
        await expect.poll(() => this.page.evaluate(() => window.menuParity.completions.sub.at(-1))).toBe(true);
        await expect(this.item('sub-alpha')).toBeFocused();
    }
    async checkpoint(name: string, expected: Record<string, unknown> = {}) {
        const state = await this.page.evaluate(async () => {
            const read = () => {
                if (window.menuParity.handleOpen) {
                    const trigger = document.querySelector<HTMLElement>('[data-testid="primary"]')!;
                    return {
                        handleOpen: window.menuParity.handleOpen(),
                        expanded: trigger.getAttribute('aria-expanded'),
                        roots: ['older', 'newer'].map((id, index) => {
                            const popup = document.querySelector<HTMLElement>(
                                `[data-testid="${index === 0 ? 'popup' : 'sub-popup'}"]`
                            );
                            const output = document.querySelector(`[data-testid="${id}-payload"]`);
                            return {
                                id,
                                mounted: !!output,
                                open: !!popup && !popup.hasAttribute('data-closed'),
                                visible:
                                    !!popup &&
                                    popup.getClientRects().length > 0 &&
                                    getComputedStyle(popup).visibility !== 'hidden',
                                payload: output?.textContent?.trim() ?? null,
                                role: popup?.getAttribute('role') ?? null,
                                labelled: !!popup && popup.getAttribute('aria-labelledby') === trigger.id,
                                controlsLinked: !!popup && trigger.getAttribute('aria-controls') === popup.id,
                                items: [...(popup?.querySelectorAll('[role="menuitem"]') ?? [])].map((item) => ({
                                    id: item.getAttribute('data-testid'),
                                    text: item.textContent?.trim(),
                                    highlighted: item.hasAttribute('data-highlighted')
                                }))
                            };
                        }),
                        focus:
                            document.activeElement === document.body
                                ? 'body'
                                : (document.activeElement?.getAttribute('data-testid') ?? 'other'),
                        changes: window.menuParity.changes,
                        completions: window.menuParity.completions,
                        selected: window.menuParity.selected
                    };
                }
                const popup = document.querySelector<HTMLElement>('[data-testid="popup"]');
                const sub = document.querySelector<HTMLElement>('[data-testid="sub-popup"]');
                const trigger =
                    (window.menuParity.config.multiTrigger && popup?.getAttribute('aria-labelledby')
                        ? document.getElementById(popup.getAttribute('aria-labelledby')!)
                        : null) ??
                    document.querySelector<HTMLElement>('[data-testid="primary"], [data-testid="secondary"]')!;
                const positioner = document.querySelector<HTMLElement>('[data-testid="positioner"]');
                // Projected keepMounted children can portal before their parent in Angular. Compare
                // each popup's actual item order; raw sibling portal order is attached independently.
                const items = window.menuParity.config.projection
                    ? [popup, sub].flatMap((surface) =>
                          surface
                              ? [...surface.querySelectorAll<HTMLElement>('[role^="menuitem"]')].filter(
                                    (item) => item.closest('[role="menu"]') === surface
                                )
                              : []
                      )
                    : [...document.querySelectorAll<HTMLElement>('[role^="menuitem"]')];
                const visible = (el: HTMLElement | null) =>
                    !!el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
                const labelled = (el: HTMLElement | null) =>
                    !!el
                        ?.getAttribute('aria-labelledby')
                        ?.split(/\s+/)
                        .every((id) => document.getElementById(id)?.textContent?.trim());
                const isolated = (el: HTMLElement | null) => !!el?.closest('[inert], [aria-hidden="true"]');
                const popover = document.querySelector<HTMLElement>(
                    '[data-testid="host-popup"], [data-testid="item-popup"]'
                );
                return {
                    ...(window.menuParity.popover
                        ? {
                              popover: {
                                  mounted: !!popover,
                                  open: !!popover?.hasAttribute('data-open'),
                                  visible: visible(popover),
                                  labelled: labelled(popover),
                                  isolated: isolated(popover),
                                  menuIsolated: isolated(popup),
                                  changes: window.menuParity.popover.changes,
                                  completions: window.menuParity.popover.completions
                              }
                          }
                        : {}),
                    ...(window.menuParity.dialog
                        ? {
                              dialog: {
                                  mounted: !!document.querySelector('[data-testid="dialog-popup"]'),
                                  open: !!document.querySelector('[data-testid="dialog-popup"][data-open]'),
                                  visible: visible(document.querySelector('[data-testid="dialog-popup"]')),
                                  labelled: labelled(document.querySelector('[data-testid="dialog-popup"]')),
                                  inert: !!document.querySelector('[data-testid="dialog-popup"]')?.closest('[inert]'),
                                  menuIsolated: isolated(popup),
                                  changes: window.menuParity.dialog.changes,
                                  completions: window.menuParity.dialog.completions
                              }
                          }
                        : {}),
                    ...(window.menuParity.highlights
                        ? {
                              highlights: Object.fromEntries(
                                  ['main', 'sub'].map((layer) => [
                                      layer,
                                      window.menuParity.highlights!.changes.filter((change) => change.layer === layer)
                                  ])
                              )
                          }
                        : {}),
                    ...(window.menuParity.config.multiTrigger
                        ? {
                              payloadLabel:
                                  document.querySelector('[data-testid="active-payload"]')?.textContent?.trim() ?? '',
                              triggers: ['primary', 'secondary'].flatMap((id) => {
                                  const element = document.querySelector<HTMLElement>(`[data-testid="${id}"]`);
                                  return element
                                      ? [
                                            {
                                                id,
                                                expanded: element.getAttribute('aria-expanded'),
                                                controlsLinked:
                                                    !!popup && element.getAttribute('aria-controls') === popup.id,
                                                pressed: element.hasAttribute('data-pressed'),
                                                disabled:
                                                    element.hasAttribute('disabled') ||
                                                    element.getAttribute('aria-disabled') === 'true'
                                            }
                                        ]
                                      : [];
                              }),
                              ...(window.menuParity.config.multiTrigger.animated
                                  ? {
                                        viewport: {
                                            current: document.querySelectorAll(
                                                '[data-testid="viewport"] > [data-current]'
                                            ).length,
                                            previous: document.querySelectorAll(
                                                '[data-testid="viewport"] > [data-previous]'
                                            ).length,
                                            previousInert:
                                                document
                                                    .querySelector('[data-testid="viewport"] > [data-previous]')
                                                    ?.hasAttribute('inert') ?? false,
                                            // CSS token-list semantics; raw attribute spelling is attached separately.
                                            direction:
                                                document
                                                    .querySelector('[data-testid="viewport"]')
                                                    ?.getAttribute('data-activation-direction')
                                                    ?.split(/\s+/)
                                                    .filter(Boolean) ?? []
                                        }
                                    }
                                  : {})
                          }
                        : {}),
                    ...(window.menuParity.config.focusBoundary
                        ? { finalFocusCalls: window.menuParity.finalFocusCalls }
                        : {}),
                    ...(window.menuParity.config.host?.initial ||
                    window.menuParity.config.focusBoundary ||
                    window.menuParity.config.multiTrigger ||
                    window.menuParity.config.projection
                        ? {
                              tabStops: items.map((el) => ({
                                  id: el.dataset.testid,
                                  index: el.tabIndex,
                                  nativeDisabled: el.hasAttribute('disabled')
                              }))
                          }
                        : {}),
                    ...(window.menuParity.config.host
                        ? {
                              hostClicks: window.menuParity.config.host.disabled
                                  ? undefined
                                  : window.menuParity.hostClicks,
                              navigated: location.hash === '#host-target',
                              hostSubmissions: window.menuParity.hostSubmissions
                          }
                        : {}),
                    ...(window.menuParity.config.touch
                        ? {
                              pressed: trigger.hasAttribute('data-pressed'),
                              pageScrolled: scrollY > 0,
                              popupScrolled: !!popup && popup.scrollTop > 0,
                              ...(window.menuParity.config.name.startsWith('hybrid-')
                                  ? {
                                        nativeChange: window.menuParity.nativeEvents.at(-1) ?? null,
                                        subExpanded:
                                            document
                                                .querySelector('[data-testid="more"]')
                                                ?.getAttribute('aria-expanded') ?? null
                                    }
                                  : { nativeChanges: window.menuParity.nativeEvents })
                          }
                        : {}),
                    ...(window.menuParity.config.lifecycle
                        ? {
                              ending: popup?.hasAttribute('data-ending-style') ?? false,
                              ...(window.menuParity.config.itemDialog
                                  ? { menuIsolated: isolated(positioner) }
                                  : { inert: positioner?.hasAttribute('inert') ?? false }),
                              pointerBlocked: !!positioner && getComputedStyle(positioner).pointerEvents === 'none'
                          }
                        : {}),
                    open: window.menuParity.config.multiTrigger
                        ? !!popup && !popup.hasAttribute('data-closed')
                        : trigger?.getAttribute('aria-expanded') === 'true',
                    disabled:
                        !!trigger &&
                        (trigger.hasAttribute('disabled') || trigger.getAttribute('aria-disabled') === 'true'),
                    mounted: !!popup,
                    visible: visible(popup),
                    role: popup?.getAttribute('role') ?? null,
                    labelled: labelled(popup),
                    controlsLinked: !!popup && trigger?.getAttribute('aria-controls') === popup.id,
                    // Both implementations omit expanded on keyboard-opened submenus for macOS
                    // VoiceOver. Observe the actual layer rather than inventing a missing attribute.
                    subOpen: !!sub && !sub.hasAttribute('data-closed'),
                    subVisible: visible(sub),
                    subLabelled: labelled(sub),
                    focus:
                        document.activeElement === document.body
                            ? 'body'
                            : (document.activeElement?.getAttribute('data-testid') ?? 'other'),
                    highlighted: items
                        .filter((el) => el.hasAttribute('data-highlighted'))
                        .map((el) => el.dataset.testid),
                    items: items.map((el) => ({
                        id: el.dataset.testid,
                        role: el.getAttribute('role'),
                        disabled: el.getAttribute('aria-disabled') === 'true'
                    })),
                    checked: document.querySelector('[data-testid="check"]')?.getAttribute('aria-checked') ?? null,
                    radio: items
                        .filter(
                            (el) =>
                                el.getAttribute('role') === 'menuitemradio' &&
                                el.getAttribute('aria-checked') === 'true'
                        )
                        .map((el) => el.dataset.testid),
                    selected: window.menuParity.selected,
                    values: window.menuParity.values,
                    activations: window.menuParity.activations,
                    changes: window.menuParity.changes,
                    completions: window.menuParity.completions
                };
            };
            let previous = '',
                stable = 0;
            for (let frame = 0; frame < 120; frame++) {
                await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
                const json = JSON.stringify(read());
                stable = json === previous ? stable + 1 : 0;
                if (stable >= 3) return JSON.parse(json) as Record<string, unknown>;
                previous = json;
            }
            throw new Error('Menu did not settle');
        });
        this.checkpoints.push({ name, state });
        const activatedPopup = await this.page.evaluate(() =>
            window.menuParity.config.itemPopover
                ? 'item-popup'
                : window.menuParity.config.itemDialog
                  ? 'dialog-popup'
                  : null
        );
        if (activatedPopup) {
            this.measurements.push({
                name: `${name}: raw isolation`,
                bounds: await this.page.evaluate(readPopupIsolation, ['popup', 'positioner', activatedPopup])
            });
        }
        if (await this.page.evaluate(() => window.menuParity.config.multiTrigger?.animated)) {
            this.measurements.push({
                name: `${name}: raw viewport direction`,
                bounds: await this.page.evaluate(
                    () =>
                        document.querySelector('[data-testid="viewport"]')?.getAttribute('data-activation-direction') ??
                        null
                )
            });
        }
        expect(state, `${this.framework}: ${name}`).toEqual(expect.objectContaining(expected));
        expect(this.errors).toEqual([]);
    }
}
