import { expect, type Locator } from '@playwright/test';
import { portalCases, portalConfig } from '../src/portals';
import type { MenuDriver } from './driver';

async function expectActive(element: Locator) {
    // Check the widget's native document/shadow focus chain. Firefox's document.hasFocus also
    // depends on which parallel browser window is foreground; retain that separately in raw data.
    await expect
        .poll(() =>
            element.evaluate((node) => {
                let active = node.ownerDocument.activeElement;
                while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
                const frame = node.ownerDocument.defaultView?.frameElement;
                return active === node && (!frame || frame.ownerDocument.activeElement === frame);
            })
        )
        .toBe(true);
}

export const portalScenarios = portalCases.map((name) => ({
    name,
    async run(d: MenuDriver) {
        const p = portalConfig(name)!;
        if (p.pending) {
            await expect(d.popup).toHaveCount(0);
            await d.trigger.click();
            await expect(d.trigger).toHaveAttribute('aria-expanded', 'true');
            await expect(d.popup).toHaveCount(0);
            await d.checkpoint('open waits for target', { open: true, mounted: false, target: null });
            await d.trigger.click();
            await expect(d.trigger).toHaveAttribute('aria-expanded', 'false');
            await d.checkpoint('closed while waiting', { open: false, mounted: false });
            await d.trigger.click();
            await expect(d.trigger).toHaveAttribute('aria-expanded', 'true');
            await d.checkpoint('reopened while waiting', { open: true, mounted: false });
            await d.page.keyboard.press('F3');
            await expect(d.popup).toBeVisible();
            await expect(d.popup).toHaveAccessibleName('Actions');
            await d.checkpoint('target resolved', { open: true, visible: true, target: 'target', labelled: true });
            await d.page.keyboard.press('Home');
            await d.page.keyboard.press('ArrowDown');
            await expectActive(d.item('bravo'));
            await d.checkpoint('highlight before target loss', { focus: 'bravo', highlighted: ['bravo'] });
            if (p.exit) {
                await d.page.keyboard.press('Escape');
                await expect(d.popup).toHaveAttribute('data-ending-style', '');
                await expect.poll(() => d.popup.evaluate((node) => node.getAnimations().length)).toBeGreaterThan(0);
                await d.checkpoint('exit pending', { open: false, mounted: true });
            }
            await d.page.keyboard.press('F3');
            await expect(d.popup).toHaveCount(0);
            await d.checkpoint('target suspended', { mounted: false, backgroundInert: false, backgroundHidden: false });
            await d.page.keyboard.press('F3');
            if (p.exit) await d.open('Enter');
            else await expect(d.popup).toBeVisible();
            await d.checkpoint('target restored', { open: true, visible: true, target: 'target', labelled: true });
            await d.page.keyboard.press('Home');
            await expectActive(d.item('alpha'));
            // Removing an owner while waiting must not leave a deferred view, focus guard or isolation.
            await d.page.keyboard.press('F3');
            await expect(d.popup).toHaveCount(0);
            await d.page.keyboard.press('F4');
            await expect(d.trigger).toHaveCount(0);
            await d.checkpoint('pending owner removed', {
                open: false,
                mounted: false,
                backgroundInert: false,
                backgroundHidden: false
            });
            expect(d.errors).toEqual([]);
            return;
        }
        await d.open(p.pointer ? 'mouse' : 'Enter');
        d.measurements.push({
            name: 'opening DOM',
            bounds: await d.page.evaluate(() => {
                const s = window.menuPortalSurface;
                return {
                    active: s.document.activeElement?.outerHTML,
                    documentFocused: s.document.hasFocus(),
                    parentActive: document.activeElement?.tagName,
                    inert: [...s.scope.querySelectorAll('[inert]')].map((node) => node.outerHTML.slice(0, 180))
                };
            })
        });
        await expectActive(p.pointer ? d.popup : d.item('alpha'));
        const target = async () =>
            d.page.evaluate(() => {
                const s = window.menuPortalSurface;
                const positioner = s.scope.querySelector('[data-testid="positioner"]');
                return !!positioner && s.target.contains(positioner);
            });
        expect(await target()).toBe(true);
        await expect(d.popup).toHaveAccessibleName('Actions');
        await d.checkpoint('opened in target', { open: true, visible: true, target: 'target', labelled: true });
        if (p.pointer) {
            await d.page.keyboard.press('ArrowDown');
            await expectActive(d.item('alpha'));
        }
        await d.page.keyboard.press('ArrowDown');
        await expectActive(d.item('bravo'));
        if (p.switchTarget) {
            await d.page.keyboard.press('F3');
            await expect
                .poll(() =>
                    d.page.evaluate(
                        () => window.menuPortalSurface.alternate.querySelector('[data-testid="popup"]') !== null
                    )
                )
                .toBe(true);
            await d.checkpoint('target changed while open', { open: true, target: 'alternate', visible: true });
        }
        await d.page.keyboard.press('Escape');
        await d.closed();
        await expectActive(d.trigger);
        await d.checkpoint('closed target', {
            open: false,
            visible: false,
            backgroundInert: false,
            backgroundHidden: false
        });
        await d.open('Enter');
        await d.item('alpha').click();
        await d.closed();
        await d.checkpoint('selected after reopening', { open: false, selected: ['alpha'] });
        await d.open('Enter');
        await d.page.keyboard.press('F4');
        await expect(d.trigger).toHaveCount(0);
        await expect(d.popup).toHaveCount(0);
        await expect(d.item('outside')).not.toHaveAttribute('inert', '');
        await d.checkpoint('owner removed', {
            open: false,
            mounted: false,
            backgroundInert: false,
            backgroundHidden: false
        });
        d.measurements.push({
            name: 'surface',
            bounds: await d.page.evaluate(() => {
                const s = window.menuPortalSurface;
                return {
                    frame: window.menuParity.config.portal!.frame,
                    targetNode: s.target.nodeType,
                    ownerDocumentMatches: s.target.ownerDocument === s.document,
                    guards: s.scope.querySelectorAll('[data-rdx-focus-guard]').length,
                    inertNodes: s.scope.querySelectorAll('[inert]').length
                };
            })
        });
        expect(d.errors).toEqual([]);
    }
}));
