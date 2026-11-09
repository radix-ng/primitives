import { expect, Page, type Locator } from '@playwright/test';
import type { CaseName, Reference, TraceEvent } from '../src/contract';

export interface Snapshot {
    open: boolean;
    label: string;
    disabled: boolean;
    readOnly: boolean;
    controlsLinked: boolean;
    popupMounted: boolean;
    popupVisible: boolean;
    inert: boolean;
    selected: string[];
    highlighted: string[];
    focus: string;
    entries: [string, string][];
    events: TraceEvent[];
    backgroundActivations: number;
    pageScrolled: boolean;
    direction: string;
    listScrolled?: boolean;
    itemAligned?: boolean;
    popupWithinViewport?: boolean;
    anchorHidden?: boolean;
    selectedTextAligned?: boolean;
}
export interface Checkpoint {
    name: string;
    state: Snapshot;
}

export class SelectDriver {
    readonly checkpoints: Checkpoint[] = [];
    readonly errors: string[] = [];
    readonly measurements: { name: string; bounds: unknown }[] = [];
    metadata: { reference: Reference; framework: string } | undefined;
    private controlledClock = false;

    constructor(
        readonly page: Page,
        readonly framework: 'angular' | 'react'
    ) {
        page.on('pageerror', (error) => this.errors.push(error.message));
        page.on('console', (message) => {
            if (message.type() === 'error') this.errors.push(message.text());
        });
    }
    async goto(name: CaseName): Promise<void> {
        await this.page.addInitScript(() => {
            const events: { type: string; trusted: boolean; pointerType?: string; target: string | null }[] = [];
            Object.assign(window, { parityInput: events });
            for (const type of [
                'pointerdown',
                'pointerup',
                'pointercancel',
                'touchstart',
                'touchmove',
                'touchend',
                'touchcancel',
                'click'
            ]) {
                document.addEventListener(
                    type,
                    (event) => {
                        const target = event.target instanceof Element ? event.target : null;
                        events.push({
                            type,
                            trusted: event.isTrusted,
                            pointerType: event instanceof PointerEvent ? event.pointerType : undefined,
                            target:
                                target?.closest('[data-option-key]')?.getAttribute('data-option-key') ??
                                target?.closest('[data-testid]')?.getAttribute('data-testid') ??
                                null
                        });
                    },
                    { capture: true, passive: true }
                );
            }
        });
        await this.page.goto(`/${this.framework}.html?case=${name}`);
        await expect(this.trigger).toBeVisible();
        this.metadata = await this.page.evaluate(() => ({
            framework: window.parity.framework,
            reference: window.parity.reference
        }));
        await this.checkpoint('initial');
    }
    get trigger() {
        return this.page.getByTestId('trigger');
    }
    option(key: string) {
        return this.page.locator(`[data-option-key="${key}"]`);
    }
    async open(pointer = false, key: 'Enter' | 'Space' = 'Enter'): Promise<void> {
        const count = await this.page.evaluate(
            () => window.parity.events.filter((event) => event.type === 'complete' && event.open).length
        );
        if (pointer) await this.trigger.click();
        else await this.trigger.press(key);
        await expect(this.trigger).toHaveAttribute('aria-expanded', 'true');
        await expect
            .poll(() =>
                this.page.evaluate(
                    () => window.parity.events.filter((event) => event.type === 'complete' && event.open).length
                )
            )
            .toBe(count + 1);
        // Keyboard input starts when focus has actually entered the visible popup.
        // Keep its exact target in snapshots; Angular virtual focus and Base UI item focus still differ.
        await expect(this.page.getByTestId('popup')).toBeVisible();
        await expect
            .poll(() =>
                this.page.getByTestId('popup').evaluate((popup) => popup.contains(popup.ownerDocument.activeElement))
            )
            .toBe(true);
    }
    async key(key: string): Promise<void> {
        await this.page.keyboard.press(key);
        if (this.controlledClock) await this.page.clock.runFor(32);
    }
    async openWithControlledClock(): Promise<void> {
        await this.page.clock.install({ time: 0 });
        await this.open();
        await this.page.clock.pauseAt(60_000);
        this.controlledClock = true;
        this.measurements.push({
            name: 'controlled clock',
            bounds: { pausedAt: 60_000, keyStepMs: 32, checkpointStepMs: 100 }
        });
    }
    async choose(key: string): Promise<void> {
        await this.option(key).click();
    }
    async openByTouch(): Promise<void> {
        const count = await this.page.evaluate(
            () => window.parity.events.filter((event) => event.type === 'complete' && event.open).length
        );
        await this.trigger.tap();
        await expect(this.trigger).toHaveAttribute('aria-expanded', 'true');
        await expect(this.page.getByTestId('popup')).toBeVisible();
        await expect
            .poll(() =>
                this.page.evaluate(
                    () => window.parity.events.filter((event) => event.type === 'complete' && event.open).length
                )
            )
            .toBe(count + 1);
    }

    async tapBackground(): Promise<void> {
        const { x, y } = await this.center(this.page.getByTestId('before'));
        await this.page.touchscreen.tap(x, y);
    }

    /** Public Chromium input API: trusted browser events, never DOM dispatchEvent. */
    async gesture(target: Locator, end: 'cancel' | 'pan'): Promise<void> {
        const start = await this.center(target);
        const session = await this.page.context().newCDPSession(this.page);
        try {
            await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...start, id: 1 }] });
            if (end === 'pan') {
                for (const delta of [20, 40, 70, 100]) {
                    await session.send('Input.dispatchTouchEvent', {
                        type: 'touchMove',
                        touchPoints: [{ x: start.x, y: start.y - delta, id: 1 }]
                    });
                }
            }
            await session.send('Input.dispatchTouchEvent', {
                type: end === 'cancel' ? 'touchCancel' : 'touchEnd',
                touchPoints: []
            });
        } finally {
            await session.detach();
        }
    }

    private async center(target: Locator): Promise<{ x: number; y: number }> {
        const bounds = await target.boundingBox();
        if (!bounds) throw new Error('Touch target has no bounds');
        return { x: Math.round(bounds.x + bounds.width / 2), y: Math.round(bounds.y + bounds.height / 2) };
    }

    async inputEvents(): Promise<{ type: string; trusted: boolean; pointerType?: string; target: string | null }[]> {
        return this.page
            .evaluate(
                () =>
                    (
                        window as unknown as {
                            parityInput: {
                                type: string;
                                trusted: boolean;
                                pointerType?: string;
                                target: string | null;
                            }[];
                        }
                    ).parityInput ?? []
            )
            .catch(() => []);
    }
    async highlighted(key: string): Promise<void> {
        await expect(this.option(key)).toHaveAttribute('data-highlighted', '');
    }
    async closed(complete = false): Promise<void> {
        await expect(this.trigger).toHaveAttribute('aria-expanded', 'false');
        if (complete) {
            await expect
                .poll(() => this.page.evaluate(() => window.parity.events.at(-1)))
                .toEqual({ type: 'complete', open: false });
        }
    }
    async action(action: 'close' | 'unmount'): Promise<void> {
        await this.page.evaluate((name) => window.parity[name](), action);
    }
    async reset(): Promise<void> {
        await this.page.getByTestId('form').evaluate((form: HTMLFormElement) => form.reset());
    }
    async focusAfter(): Promise<void> {
        await this.page.getByTestId('after').focus();
    }

    async clickBackground(): Promise<void> {
        const bounds = await this.page.getByTestId('before').boundingBox();
        if (!bounds) throw new Error('Background button has no bounds');
        // A locator click would wait for a modal backdrop to disappear instead of testing its hit area.
        await this.page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    }

    async wheelPage(scrolled: boolean): Promise<void> {
        const viewport = this.page.viewportSize()!;
        // Stay outside the popup and native scrollbar. A locked scroller may consume wheel input
        // without delivering a DOM wheel event, so wait for rendering rather than event delivery.
        await this.page.mouse.move(viewport.width / 2, viewport.height - 40);
        await this.page.mouse.wheel(0, 240);
        await this.page.evaluate(
            () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
        );
        await expect.poll(() => this.page.evaluate(() => window.scrollY > 0)).toBe(scrolled);
    }

    async alignment(name: string, mode: 'item' | 'anchor' | 'center', allowInlineClamping = false): Promise<void> {
        let bounds: unknown;
        try {
            await expect
                .poll(async () => {
                    const measurement = await this.page.evaluate(
                        ({ mode, allowInlineClamping }) => {
                            const trigger = document.querySelector<HTMLElement>('[data-testid="trigger"]')!;
                            const value = trigger.querySelector<HTMLElement>('[data-testid="value"]')!;
                            const popup = document.querySelector<HTMLElement>('[data-testid="popup"]')!;
                            const selected = popup.querySelector<HTMLElement>(
                                '[aria-selected="true"] [data-option-text]'
                            )!;
                            const rtl = getComputedStyle(trigger).direction === 'rtl';
                            const a = (mode === 'item' ? value : trigger).getBoundingClientRect();
                            const b = (
                                mode === 'item'
                                    ? selected
                                    : document.querySelector<HTMLElement>('[data-testid="positioner"]')!
                            ).getBoundingClientRect();
                            const popupBounds = popup.getBoundingClientRect();
                            const inlineDelta =
                                mode === 'center'
                                    ? a.left + a.width / 2 - (b.left + b.width / 2)
                                    : rtl
                                      ? a.right - b.right
                                      : a.left - b.left;
                            const blockDelta = a.top + a.height / 2 - (b.top + b.height / 2);
                            return {
                                mode,
                                allowInlineClamping,
                                rtl,
                                reference: a.toJSON(),
                                candidate: b.toJSON(),
                                popup: popupBounds.toJSON(),
                                inlineDelta,
                                blockDelta,
                                aligned:
                                    (allowInlineClamping || Math.abs(inlineDelta) <= 2) &&
                                    (mode !== 'item' || Math.abs(blockDelta) <= 2),
                                withinViewport:
                                    popupBounds.left >= 0 &&
                                    popupBounds.top >= 0 &&
                                    popupBounds.right <= innerWidth &&
                                    popupBounds.bottom <= innerHeight
                            };
                        },
                        { mode, allowInlineClamping }
                    );
                    bounds = measurement;
                    return measurement.aligned && measurement.withinViewport;
                }, `${this.framework}: ${name}`)
                .toBe(true);
        } finally {
            this.measurements.push({ name, bounds });
        }
    }

    async nativeEvents(): Promise<string[]> {
        return this.page.evaluate(() => window.parity?.nativeEvents ?? []).catch(() => []);
    }

    async scrollAncestor(delta = 30): Promise<void> {
        const scroller = this.page.getByTestId('scroller');
        const previous = await scroller.evaluate((el) => el.scrollTop);
        const bounds = (await scroller.boundingBox())!;
        await this.page.mouse.move(bounds.x + bounds.width - 20, bounds.y + bounds.height - 20);
        await this.page.mouse.wheel(0, delta);
        await expect.poll(() => scroller.evaluate((el) => el.scrollTop)).toBeGreaterThan(previous);
    }

    async anchorGap(name: string): Promise<void> {
        let bounds: unknown;
        try {
            await expect
                .poll(async () => {
                    const result = await this.page.evaluate(() => {
                        const trigger = document
                            .querySelector<HTMLElement>('[data-testid="trigger"]')!
                            .getBoundingClientRect();
                        const positioner = document.querySelector<HTMLElement>('[data-testid="positioner"]')!;
                        const popup = document
                            .querySelector<HTMLElement>('[data-testid="popup"]')!
                            .getBoundingClientRect();
                        const side = positioner.getAttribute('data-side');
                        return {
                            side,
                            trigger: trigger.toJSON(),
                            popup: popup.toJSON(),
                            gap: side === 'top' ? trigger.top - popup.bottom : popup.top - trigger.bottom
                        };
                    });
                    bounds = result;
                    return result.gap >= 3 && result.gap <= 7;
                }, `${this.framework}: ${name}`)
                .toBe(true);
        } finally {
            this.measurements.push({ name, bounds });
        }
    }

    async sizing(name: string) {
        const bounds = await this.page.evaluate(async () => {
            const positioner = document.querySelector<HTMLElement>('[data-testid="positioner"]')!;
            const popup = document.querySelector<HTMLElement>('[data-testid="popup"]')!;
            const panel = popup.querySelector<HTMLElement>('[rdxSelectItemAlignedPositionContent]') ?? popup;
            const list = document.querySelector<HTMLElement>('[data-testid="list"]')!;
            const measure = () => ({
                positioner: positioner.getBoundingClientRect().toJSON(),
                popup: panel.getBoundingClientRect().toJSON(),
                trigger: document.querySelector('[data-testid="trigger"]')!.getBoundingClientRect().toJSON(),
                value: document.querySelector('[data-testid="value"]')?.getBoundingClientRect().toJSON(),
                selectedText: popup
                    .querySelector('[aria-selected="true"] [data-option-text]')
                    ?.getBoundingClientRect()
                    .toJSON(),
                scrollTop: list.scrollTop,
                scrollHeight: list.scrollHeight,
                clientHeight: list.clientHeight,
                side: positioner.getAttribute('data-side')
            });
            // Wheel dispatch does not await native scrolling, particularly in WebKitGTK.
            // Sample actual layout until it stops changing; two frames can still be mid-gesture.
            let previous = '';
            let stableFrames = 0;
            for (let frame = 0; frame < 120; frame++) {
                await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
                const current = measure();
                const key = JSON.stringify(current);
                stableFrames = key === previous ? stableFrames + 1 : 0;
                if (stableFrames >= 6) return current;
                previous = key;
            }
            throw new Error(`Select sizing did not settle: ${previous}`);
        });
        this.measurements.push({ name, bounds });
        return bounds;
    }

    async wheelList(delta: number) {
        const box = (await this.page.getByTestId('list').boundingBox())!;
        // Use the list's padding so wheel geometry is not coupled to hovering a particular row.
        await this.page.mouse.move(box.x + 1, box.y + box.height / 2);
        await this.page.mouse.wheel(0, delta);
    }

    async wheelListToBoundary(direction: 'start' | 'end', minHeight = 0) {
        let pulses = 0;
        try {
            await expect
                .poll(
                    async () => {
                        await this.wheelList(direction === 'start' ? -1200 : 1200);
                        pulses++;
                        const bounds = await this.sizing('native wheel sample');
                        const remaining =
                            direction === 'start'
                                ? bounds.scrollTop
                                : bounds.scrollHeight - bounds.clientHeight - bounds.scrollTop;
                        return remaining <= 1 && bounds.positioner.height >= minHeight;
                    },
                    { message: `${this.framework}: native wheel reaches ${direction}`, timeout: 10_000 }
                )
                .toBe(true);
        } finally {
            this.measurements.push({ name: 'native wheel input', bounds: { direction, pulses, delta: 1200 } });
        }
    }

    async geometry(name: string, option?: string): Promise<void> {
        let bounds: unknown;
        try {
            await expect
                .poll(async () => {
                    const measurement = await this.page.evaluate((option) => {
                        const popup = document.querySelector<HTMLElement>('[data-testid="popup"]')!;
                        const list = document.querySelector<HTMLElement>('[data-testid="list"]')!;
                        const selected = option
                            ? document.querySelector<HTMLElement>(`[data-option-key="${option}"]`)
                            : popup.querySelector<HTMLElement>('[aria-selected="true"]');
                        const panel =
                            popup.querySelector<HTMLElement>('[rdxSelectItemAlignedPositionContent]') ?? popup;
                        const p = panel.getBoundingClientRect();
                        const l = list.getBoundingClientRect();
                        const s = selected?.getBoundingClientRect();
                        return {
                            popup: p.toJSON(),
                            list: l.toJSON(),
                            option: s?.toJSON(),
                            scrollTop: list.scrollTop,
                            scrollHeight: list.scrollHeight,
                            withinViewport:
                                p.top >= -2 && p.left >= -2 && p.right <= innerWidth + 2 && p.bottom <= innerHeight + 2,
                            optionVisible: !!s && s.top >= l.top - 2 && s.bottom <= l.bottom + 2,
                            usable: l.height > 0 && l.height <= p.height + 2
                        };
                    }, option);
                    bounds = measurement;
                    return measurement.withinViewport && measurement.optionVisible && measurement.usable;
                }, `${this.framework}: ${name}`)
                .toBe(true);
        } finally {
            this.measurements.push({ name, bounds });
        }
    }

    async checkpoint(
        name: string,
        expected: Partial<Snapshot> = {},
        listScrollBaseline?: number,
        geometryState: boolean | 'live' = false
    ): Promise<void> {
        // With paused time, advance rendering explicitly without spending the query's 750ms
        // timeout on protocol/trace collection. Ordinary scenarios retain frame-based settling.
        if (this.controlledClock) await this.page.clock.runFor(100);
        // Wait for observable state to stabilize, without forcing focus, values or completion callbacks.
        const state = await this.page.evaluate(
            async ({ listScrollBaseline, geometryState, controlledClock }) => {
                const read = (): Snapshot => {
                    const trigger = document.querySelector<HTMLElement>('[data-testid="trigger"]')!;
                    const popup = document.querySelector<HTMLElement>('[data-testid="popup"]');
                    const active = document.activeElement;
                    const option = active?.closest<HTMLElement>('[data-option-key]');
                    const style = popup && getComputedStyle(popup);
                    const options = [...document.querySelectorAll<HTMLElement>('[data-option-key]')];
                    const panel = popup?.querySelector<HTMLElement>('[rdxSelectItemAlignedPositionContent]') ?? popup;
                    const bounds = geometryState ? panel?.getBoundingClientRect() : undefined;
                    const selectedText = popup
                        ?.querySelector('[aria-selected="true"] [data-option-text]')
                        ?.getBoundingClientRect();
                    const value = document.querySelector('[data-testid="value"]')?.getBoundingClientRect();
                    return {
                        ...(geometryState === 'live'
                            ? {
                                  anchorHidden:
                                      document
                                          .querySelector('[data-testid="positioner"]')
                                          ?.hasAttribute('data-anchor-hidden') ?? false,
                                  selectedTextAligned:
                                      !!selectedText &&
                                      !!value &&
                                      Math.abs(
                                          selectedText.top + selectedText.height / 2 - value.top - value.height / 2
                                      ) <= 2
                              }
                            : {}),
                        ...(geometryState
                            ? {
                                  itemAligned:
                                      document
                                          .querySelector('[data-testid="positioner"]')
                                          ?.getAttribute('data-side') === 'none',
                                  popupWithinViewport:
                                      !!bounds &&
                                      bounds.top >= -2 &&
                                      bounds.left >= -2 &&
                                      bounds.right <= innerWidth + 2 &&
                                      bounds.bottom <= innerHeight + 2
                              }
                            : {}),
                        ...(listScrollBaseline === undefined
                            ? {}
                            : {
                                  listScrolled:
                                      (document.querySelector<HTMLElement>('[data-testid="list"]')?.scrollTop ?? 0) >
                                      listScrollBaseline
                              }),
                        open: trigger.getAttribute('aria-expanded') === 'true',
                        label: trigger.textContent!.trim().replace(/\s+/g, ' '),
                        disabled: trigger.hasAttribute('disabled'),
                        readOnly: trigger.getAttribute('aria-readonly') === 'true',
                        controlsLinked: !!document.getElementById(trigger.getAttribute('aria-controls') ?? ''),
                        popupMounted: !!popup,
                        popupVisible:
                            !!popup &&
                            !!popup.getClientRects().length &&
                            style!.visibility !== 'hidden' &&
                            style!.display !== 'none',
                        inert: !!popup?.closest('[inert]'),
                        selected: options
                            .filter((node) => node.getAttribute('aria-selected') === 'true')
                            .map((node) => node.dataset.optionKey!),
                        highlighted: options
                            .filter((node) => node.hasAttribute('data-highlighted'))
                            .map((node) => node.dataset.optionKey!),
                        focus: option
                            ? `option:${option.dataset.optionKey}`
                            : active === popup
                              ? 'popup'
                              : active === document.body
                                ? 'body'
                                : (active?.getAttribute('data-testid') ?? 'other'),
                        entries: [
                            ...new FormData(document.querySelector<HTMLFormElement>('[data-testid="form"]')!).entries()
                        ].map(([key, value]) => [key, String(value)]),
                        events: window.parity.events,
                        backgroundActivations: window.parity.backgroundActivations,
                        pageScrolled: window.scrollY > 0,
                        direction: getComputedStyle(trigger).direction
                    };
                };
                if (controlledClock) return read();
                let previous = '';
                let stable = 0;
                for (let frame = 0; frame < 120; frame++) {
                    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
                    const json = JSON.stringify(read());
                    stable = json === previous ? stable + 1 : 0;
                    if (stable === 3) return JSON.parse(json) as Snapshot;
                    previous = json;
                }
                throw new Error('Fixture did not settle within 120 animation frames');
            },
            { listScrollBaseline, geometryState, controlledClock: this.controlledClock }
        );
        this.checkpoints.push({ name, state });
        for (const event of state.events) {
            if (event.type === 'value')
                expect(event.references, `${this.framework}: original option references`).toBe(true);
        }
        expect(state, `${this.framework}: ${name}`).toEqual(expect.objectContaining(expected));
        expect(this.errors, `${this.framework} runtime errors`).toEqual([]);
    }
}
