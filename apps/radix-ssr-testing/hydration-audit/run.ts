import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium, firefox, webkit, type Page } from 'playwright';
import { desktopBrowserProjects } from '../../../tools/playwright/browser-projects.mts';
import { cases, type CaseName } from './settings.ts';

const project = process.argv.find((arg) => arg.startsWith('--project='))?.split('=')[1] ?? 'chromium';
if (!['chromium', 'firefox', 'webkit'].includes(project)) throw new Error(`Unknown browser: ${project}`);
const selected = process.argv.find((arg) => arg.startsWith('--case='))?.split('=')[1];
const baseURL = process.env.PORTAL_AUDIT_URL ?? 'http://127.0.0.1:4491';
const output = resolve('dist/portal-hydration-audit/results');

async function frames(page: Page) {
    await page.evaluate(
        () => new Promise<void>((done) => requestAnimationFrame(() => requestAnimationFrame(() => done())))
    );
}
async function snapshot(page: Page) {
    return page.evaluate(() => {
        const elements = [...document.querySelectorAll<HTMLElement>('[data-probe]')];
        const active = document.activeElement;
        const ids = [...document.querySelectorAll<HTMLElement>('[id]')]
            .map((element) => element.id)
            .filter((id) => id.startsWith('audit-field-') || id.startsWith('authored-field-') || id.startsWith('rdx-'));
        const detachedTrigger = document.querySelector('[data-detached-dialog-trigger]');
        const detachedPopup = document.querySelector('[data-detached-dialog-popup]');
        return {
            ready: window.portalHydrationAudit?.ready ?? false,
            stable: window.portalHydrationAudit?.stable,
            errors: window.portalHydrationAudit?.errors ?? [],
            constructed: window.portalHydrationAudit?.constructed ?? [],
            duplicateIds: ids.filter((id, index) => ids.indexOf(id) !== index),
            detachedDialog: detachedTrigger
                ? {
                      open: document.querySelector('audit-detached-dialog')?.getAttribute('data-dialog-open'),
                      changes: document.querySelector('audit-detached-dialog')?.getAttribute('data-dialog-changes'),
                      id: detachedTrigger.id,
                      reusedTrigger: detachedTrigger === window.auditServerNodes?.['detached-trigger'],
                      hydrated: detachedTrigger.hasAttribute('data-client'),
                      expanded: detachedTrigger.getAttribute('aria-expanded'),
                      controls: detachedTrigger.getAttribute('aria-controls'),
                      popupOpen: detachedTrigger.hasAttribute('data-popup-open'),
                      popupId: detachedPopup?.id,
                      reusedPopup: !!detachedPopup && detachedPopup === window.auditServerNodes?.['detached-popup']
                  }
                : undefined,
            relationships: [...document.querySelectorAll<HTMLElement>('[aria-controls], [aria-labelledby]')].flatMap(
                (element) =>
                    ['aria-controls', 'aria-labelledby'].flatMap((attribute) => {
                        if (
                            element.getAttribute('aria-expanded') === 'false' ||
                            element.getAttribute('aria-selected') === 'false'
                        )
                            return [];
                        const ownerOf = (node: Element | null) =>
                            node?.closest('[data-widget]')?.getAttribute('data-widget') ??
                            node?.querySelector('[data-probe]')?.getAttribute('data-probe');
                        const owner = ownerOf(element);
                        const id = element.getAttribute(attribute);
                        return owner && id ? [{ owner, attribute, target: ownerOf(document.getElementById(id)) }] : [];
                    })
            ),
            accordionPanels: [...document.querySelectorAll<HTMLElement>('[rdxAccordionPanel]')].map((panel) => ({
                owner: panel.closest('[data-widget]')?.getAttribute('data-widget'),
                animationName: getComputedStyle(panel).animationName,
                running: panel.getAnimations().some((animation) => animation.playState !== 'finished'),
                height: getComputedStyle(panel).getPropertyValue('--accordion-panel-height').trim()
            })),
            triggers: [...document.querySelectorAll<HTMLElement>('[rdxPopoverTrigger]')].map((trigger) => ({
                owner: trigger.closest('[data-widget]')?.getAttribute('data-widget'),
                controls: trigger.getAttribute('aria-controls'),
                expanded: trigger.getAttribute('aria-expanded'),
                target: document
                    .getElementById(trigger.getAttribute('aria-controls') ?? '')
                    ?.querySelector('[data-probe]')
                    ?.getAttribute('data-probe')
            })),
            focus: active?.closest('[data-probe]')?.getAttribute('data-probe') ?? active?.tagName,
            probes: elements.map((element) => {
                const name = element.dataset.probe!;
                const field = element.querySelector('input')!;
                const label = element.querySelector('label')!;
                return {
                    name,
                    hydrated: element.hasAttribute('data-client'),
                    id: field.id,
                    labelFor: label.htmlFor,
                    labelTarget: document
                        .getElementById(label.htmlFor)
                        ?.closest('[data-probe]')
                        ?.getAttribute('data-probe'),
                    value: field.value,
                    clicks: element.querySelector('output')?.textContent,
                    reusedHost: window.auditServerNodes?.[name] === element,
                    reusedInput: window.auditServerNodes?.[name + ':input'] === field,
                    inApplication: !!element.closest('portal-hydration-audit'),
                    inDestination: !!element.closest('#audit-destination'),
                    inExternalDestination: !!element.closest('#audit-external-destination'),
                    portalParent: element.closest('[data-portal-host]')?.parentElement?.tagName,
                    parent: element.parentElement?.tagName
                };
            })
        };
    });
}
type Snapshot = Awaited<ReturnType<typeof snapshot>>;
interface Observation {
    name: string;
    browser: string;
    variant: string;
    checkpoints: { name: string; snapshot: Snapshot }[];
    errors: string[];
    checks: Record<string, boolean>;
    scriptRequests: string[];
    document?: string;
    frameworkLimits?: string[];
}

async function checkDetachedDialogHydration(
    page: Page,
    observation: Observation,
    record: (label: string) => Promise<Snapshot>,
    release: () => void
) {
    const checks = observation.checks;
    const trigger = page.locator('[data-detached-dialog-trigger]');
    const popup = page.locator('[data-detached-dialog-popup]');
    const before = (await record('detached Trigger before bootstrap')).detachedDialog;
    checks.serverSnapshot =
        !!before?.reusedTrigger &&
        !before.hydrated &&
        before.expanded === 'true' &&
        before.popupOpen &&
        !!before.popupId &&
        before.controls === before.popupId;

    release();
    await page.waitForFunction(() => window.portalHydrationAudit?.ready, undefined, { timeout: 5000 });
    const boot = (await record('Root hydrated while detached Trigger remains dehydrated')).detachedDialog;
    checks.initialOpen = boot?.open === 'true' && boot.changes === '';
    checks.eagerPopupHydratedInPlace = !!boot?.reusedPopup && boot.popupId === before?.popupId;

    await popup.locator('[data-close-detached-dialog]').press('Enter', { timeout: 5000 });
    await popup.waitFor({ state: 'detached', timeout: 5000 });
    const closed = (await record('Root closed via handle before Trigger hydrates')).detachedDialog;
    checks.closedBeforeTriggerHydration = closed?.open === 'false' && closed.changes === 'false:imperative-action';
    checks.serverTriggerUnchangedWhileDehydrated = [boot, closed].every(
        (view) =>
            !!view?.reusedTrigger &&
            !view.hydrated &&
            view.id === before?.id &&
            view.expanded === before?.expanded &&
            view.controls === before?.controls &&
            view.popupOpen === before?.popupOpen
    );

    await page.locator('[data-hydrate-first]').click({ timeout: 5000 });
    await page.locator('[data-detached-dialog-trigger][data-client]').waitFor({ timeout: 5000 });
    await page.waitForFunction(() => window.portalHydrationAudit?.stable, undefined, { timeout: 5000 });
    const hydrated = (await record('detached Trigger hydrated after Root close')).detachedDialog;
    checks.closedTriggerHydratedInPlace =
        !!hydrated?.reusedTrigger &&
        hydrated.hydrated &&
        hydrated.id === before?.id &&
        hydrated.expanded === 'false' &&
        hydrated.controls === null &&
        !hydrated.popupOpen;
    checks.noOpenDuringHydration =
        hydrated?.open === 'false' && !hydrated.popupId && hydrated.changes === closed?.changes;

    await trigger.click({ timeout: 5000 });
    await popup.waitFor({ state: 'visible', timeout: 5000 });
    const opened = await record('one native click opens the hydrated Dialog');
    const view = opened.detachedDialog;
    checks.openedOnce = view?.open === 'true' && view.changes === 'false:imperative-action,true:trigger-press';
    checks.triggerControlsReopenedPopup =
        !!view?.reusedTrigger &&
        view.id === before?.id &&
        view.expanded === 'true' &&
        view.popupOpen &&
        !!view.popupId &&
        view.controls === view.popupId &&
        view.popupId === before?.popupId &&
        opened.duplicateIds.length === 0;
}

const browserType = { chromium, firefox, webkit }[project as 'chromium' | 'firefox' | 'webkit'];
const profile = desktopBrowserProjects(process.cwd()).find((item) => item.name === project);
const options = (profile?.use as { launchOptions?: Parameters<typeof chromium.launch>[0] } | undefined)?.launchOptions;
const build = await (await fetch(`${baseURL}/audit-build.json`)).json();
const variant: string = process.env.PORTAL_AUDIT_VARIANT ?? build.phase;
const browser = await browserType.launch(options);
const observations: Observation[] = [];
try {
    for (const [name, settings] of Object.entries(cases)) {
        if (selected && name !== selected) continue;
        const page = await browser.newPage();
        const observation: Observation = {
            name,
            browser: project,
            variant,
            checkpoints: [],
            errors: [],
            checks: {},
            scriptRequests: []
        };
        observations.push(observation);
        page.on('pageerror', (error) => observation.errors.push(error.message));
        page.on('console', (message) => {
            if (message.type() === 'error') observation.errors.push(message.text());
        });
        let release!: () => void;
        const gate = new Promise<void>((done) => (release = done));
        let releaseLazy!: () => void;
        const lazyGate = new Promise<void>((done) => (releaseLazy = done));
        let lazyRequested!: () => void;
        const lazyRequest = new Promise<void>((done) => (lazyRequested = done));
        const pendingLazy = settings.placement.startsWith('pending-lazy');
        const disposesPending = settings.placement === 'pending-lazy-dispose';
        const closesPending = pendingLazy && (settings.placement.endsWith('-close') || disposesPending);
        await page.route('**/assets/*.js', async (route) => {
            observation.scriptRequests.push(new URL(route.request().url()).pathname);
            await gate;
            if (pendingLazy && route.request().url().includes('lazy-view')) {
                lazyRequested();
                await lazyGate;
            }
            await route.continue();
        });
        const record = async (label: string) => {
            await frames(page);
            const current = await snapshot(page);
            observation.errors.push(...current.errors);
            observation.checkpoints.push({ name: label, snapshot: current });
            return current;
        };
        const waitFor = async (target: string) => {
            await page
                .waitForFunction(
                    (target) =>
                        !!window.portalHydrationAudit?.errors.length ||
                        !!document.querySelector(`[data-probe="${target}"][data-client]`),
                    target,
                    { timeout: 3000 }
                )
                .catch(() => observation.errors.push(`Timed out hydrating ${target}`));
        };
        try {
            // Warm a long-lived SSR process before the browser uses a fresh application injector.
            const warmup = await page.request.get(`${baseURL}/?case=${name}`);
            if (!warmup.ok()) throw new Error(await warmup.text());
            const response = await page.goto(`${baseURL}/?case=${name}`, { waitUntil: 'commit' });
            observation.document = await response?.text();
            await page.locator('[data-ssr-end]').waitFor();
            await frames(page);
            observation.checks.clientInitiallyBlocked = !(await page.evaluate(() => window.portalHydrationAudit));
            await page.evaluate(() => {
                window.auditServerNodes = {};
                for (const element of document.querySelectorAll<HTMLElement>('[data-probe]')) {
                    window.auditServerNodes[element.dataset.probe!] = element;
                    window.auditServerNodes[element.dataset.probe! + ':input'] = element.querySelector('input')!;
                }
                const detachedTrigger = document.querySelector('[data-detached-dialog-trigger]');
                if (detachedTrigger) window.auditServerNodes['detached-trigger'] = detachedTrigger;
                const detachedPopup = document.querySelector('[data-detached-dialog-popup]');
                if (detachedPopup) window.auditServerNodes['detached-popup'] = detachedPopup;
            });
            if (settings.placement === 'detached-trigger') {
                await checkDetachedDialogHydration(page, observation, record, release);
                continue;
            }
            const editedBefore = await page.locator('[data-probe="first"] input').isVisible();
            if (editedBefore) await page.locator('[data-probe="first"] input').fill('typed before hydration');
            const before = await record('server DOM before bootstrap');
            if (!['closed', 'inside-client', 'client', 'pending'].includes(settings.placement))
                observation.checks.serverRenderedContent = before.probes.some((probe) => probe.name === 'first');
            if (['reverse', 'client-before-islands'].includes(settings.placement))
                observation.checks.serverRenderedBothIslands = ['first', 'second'].every((name) =>
                    before.probes.some((probe) => probe.name === name)
                );
            if (settings.kind === 'accordion')
                observation.checks.accordionServerPaintSuppressed = before.accordionPanels.every(
                    (panel) => panel.animationName === 'none' && !panel.running && panel.height === 'auto'
                );
            release();
            await page
                .waitForFunction(
                    () => window.portalHydrationAudit?.ready || window.portalHydrationAudit?.errors.length,
                    undefined,
                    { timeout: 5000 }
                )
                .catch(() => observation.errors.push('Bootstrap did not settle'));
            const boot = await record('after application bootstrap');
            observation.checks.bootstrapReady = boot.ready;
            observation.checks.focusPreservedOnBootstrap = before.focus !== 'first' || boot.focus === 'first';
            if (
                [
                    'outside',
                    'lazy',
                    'inside',
                    'inside-wrapped',
                    'interaction',
                    'inside-interaction',
                    'reverse',
                    'client-before-islands',
                    'pending-lazy-close',
                    'pending-lazy-dispose',
                    'pending-lazy-if-close',
                    'pending-lazy-retarget'
                ].includes(settings.placement)
            )
                observation.checks.initiallyDehydrated = boot.probes.every((probe) => !probe.hydrated);

            if (pendingLazy) {
                await page.locator('[data-hydrate-first]').click();
                await Promise.race([
                    lazyRequest,
                    new Promise<never>((_, reject) =>
                        setTimeout(() => reject(new Error('Lazy request did not start')), 3000)
                    )
                ]);
                await page
                    .locator(disposesPending ? '[data-dispose]' : closesPending ? '[data-close]' : '[data-retarget]')
                    .click();
                const pending = await record('portal changed while lazy dependency is loading');
                observation.checks.changedBeforeLazyLoaded = !(await page.evaluate(
                    () => window.portalHydrationAudit?.lazyLoaded
                ));
                if (settings.kind !== 'inline')
                    observation.checks.pendingContentOwned = closesPending
                        ? pending.probes.length === 0
                        : !!pending.probes.find(
                              (probe) =>
                                  probe.name === 'first' &&
                                  probe.reusedInput &&
                                  probe.inExternalDestination &&
                                  !probe.hydrated
                          );
                releaseLazy();
                await page.waitForFunction(() => window.portalHydrationAudit?.lazyLoaded, undefined, { timeout: 5000 });
                if (closesPending) {
                    // Angular 22 also leaves PendingTasks open when an ordinary @if destroys a
                    // hydrating @defer mid-import. Record that framework limitation separately;
                    // verify our DOM disposal and continued application interaction here.
                    await page.locator('[data-add-client]').click();
                    await page.locator('nav[data-extra="true"]').waitFor();
                    observation.checks.applicationInteractiveAfterDestroy = true;
                } else {
                    await page.evaluate(() =>
                        Promise.race([
                            window.portalHydrationAudit?.whenStable?.(),
                            new Promise<never>((_, reject) =>
                                setTimeout(
                                    () => reject(new Error('Application did not settle after lazy import')),
                                    5000
                                )
                            )
                        ])
                    );
                    await waitFor('first');
                }
                const settled = await record('lazy dependency resolved after portal change');
                if (closesPending) {
                    observation.checks.destroyedIslandNotInstantiated = settled.constructed.length === 0;
                    if (settings.kind !== 'inline')
                        observation.checks.destroyedPortalLeavesNoRoots = settled.probes.length === 0;
                    if (!settled.stable)
                        observation.frameworkLimits = [
                            'Angular keeps PendingTasks open after destroying a hydrating @defer during its lazy import; the ordinary @if control reproduces this.'
                        ];
                    if (settings.kind === 'inline' && settled.probes.length)
                        (observation.frameworkLimits ??= []).push(
                            'The ordinary @if control also retains the destroyed island’s dehydrated server nodes. Presence explicitly removes its owned physical range.'
                        );
                }
            } else if (settings.placement === 'reverse' || settings.placement === 'client-before-islands') {
                if (settings.placement === 'client-before-islands') {
                    await page.locator('[data-add-client]').click();
                    await waitFor('client');
                    await record('new client owner while both server islands remain dehydrated');
                }
                await page.locator('[data-hydrate-second]').click();
                await waitFor('second');
                const second = await record('second island hydrated before first');
                observation.checks.firstStillDehydrated = !second.probes.find((probe) => probe.name === 'first')
                    ?.hydrated;
                await page.locator('[data-hydrate-first]').click();
                await waitFor('first');
                await record('first island hydrated last');
            } else if (settings.placement === 'interaction' || settings.placement === 'inside-interaction') {
                await page.locator('[data-probe="first"] button').click();
                await waitFor('first');
                await record('interaction hydration and event replay');
            } else if (settings.placement === 'closed') {
                await page.locator('[rdxPopoverTrigger]').click();
                await waitFor('first');
                await record('opened after application hydration');
            } else if (
                ['outside', 'lazy', 'inside', 'inside-wrapped', 'inside-client', 'client', 'destination'].includes(
                    settings.placement
                )
            ) {
                await page.locator('[data-hydrate-first]').click();
                await waitFor(settings.placement === 'destination' ? 'destination' : 'first');
                await record('requested island hydration');
            } else if (settings.placement === 'pending') {
                await page.locator('[data-resolve]').click();
                await waitFor('first');
                await record('destination resolved');
            }

            const final = await record('final');
            observation.errors.push(...final.errors);
            const active = final.probes.find((probe) => probe.name === 'first');
            observation.checks.probeHydrated = closesPending || !!active?.hydrated;
            if (settings.placement === 'lazy' || pendingLazy)
                observation.checks.lazyChunkRequested = observation.scriptRequests.some((url) =>
                    url.includes('lazy-view')
                );
            observation.checks.portalRelocated =
                closesPending ||
                ['inline', 'tabs', 'accordion'].includes(settings.kind) ||
                (settings.placement === 'destination' ? !!active?.inDestination : active?.inApplication === false);
            observation.checks.uniqueIdsThroughout = observation.checkpoints.every(
                (checkpoint) => checkpoint.snapshot.duplicateIds.length === 0
            );
            observation.checks.labelsStayAssociated = observation.checkpoints.every((checkpoint) =>
                checkpoint.snapshot.probes.every((probe) => probe.labelTarget === probe.name)
            );
            observation.checks.popupRelationshipsStayAssociated = observation.checkpoints.every((checkpoint) =>
                checkpoint.snapshot.triggers.every(
                    (trigger) => trigger.expanded !== 'true' || trigger.owner === trigger.target
                )
            );
            observation.checks.widgetRelationshipsStayAssociated = observation.checkpoints.every((checkpoint) =>
                checkpoint.snapshot.relationships.every((relationship) => relationship.owner === relationship.target)
            );
            observation.checks.ssrNodesReused =
                closesPending ||
                before.probes.every((server) => {
                    const client = final.probes.find((probe) => probe.name === server.name);
                    return client?.reusedHost && client.reusedInput;
                });
            observation.checks.idsStable =
                closesPending ||
                observation.checkpoints.every((checkpoint) =>
                    before.probes.every((server) => {
                        const client = checkpoint.snapshot.probes.find((probe) => probe.name === server.name);
                        return client?.id === server.id;
                    })
                );
            observation.checks.editedValuePreserved =
                closesPending || !editedBefore || active?.value === 'typed before hydration';
            const interaction = settings.placement === 'interaction' || settings.placement === 'inside-interaction';
            if (interaction) observation.checks.eventReplayedOnce = active?.clicks === '1';
            if (settings.kind === 'accordion')
                observation.checks.accordionHydrationDoesNotReplayMotion = final.accordionPanels.every(
                    (panel) => panel.animationName === 'none' && !panel.running
                );
            observation.checks.noErrors = observation.errors.length === 0;
            if (active?.hydrated && observation.checks.noErrors) {
                await page.locator('[data-probe="first"] button').click();
                await page.waitForFunction(
                    (count) => document.querySelector('[data-probe="first"] output')?.textContent === count,
                    interaction ? '2' : '1',
                    { timeout: 1500 }
                );
                observation.checks.interactiveAfterHydration = true;
                if (settings.kind === 'accordion') {
                    const retain = 'retain' in settings && settings.retain;
                    const trigger = page.locator('[data-widget="first"] [rdxAccordionTrigger]');
                    const panel = page.locator('[data-widget="first"] [rdxAccordionPanel]');
                    const id = await panel.getAttribute('id');
                    const original = await panel.locator('input').elementHandle();
                    await trigger.click();
                    if (retain) await panel.waitFor({ state: 'hidden' });
                    else await panel.waitFor({ state: 'detached' });
                    const closed = await record('hydrated Accordion closed');
                    observation.checks.accordionClosePolicy = retain
                        ? closed.probes.some((probe) => probe.name === 'first')
                        : !closed.probes.some((probe) => probe.name === 'first');
                    await trigger.click();
                    await panel.waitFor({ state: 'visible' });
                    observation.checks.accordionStablePanelId = (await panel.getAttribute('id')) === id;
                    observation.checks.accordionStateOnReturn =
                        (await panel.locator('input').inputValue()) ===
                        (retain && editedBefore ? 'typed before hydration' : 'initial');
                    // Compare identity directly; both input states alone could come from client fallback.
                    observation.checks.accordionNativeViewOwnership = retain
                        ? await panel.locator('input').evaluate((input, original) => input === original, original)
                        : await panel.locator('input').evaluate((input, original) => input !== original, original);
                    const reopened = await record('hydrated Accordion reopened');
                    observation.checks.accordionLaterOpenAnimates = reopened.accordionPanels.some(
                        (panel) =>
                            panel.owner === 'first' && panel.animationName === 'accordion-audit-enter' && panel.running
                    );
                    await original?.dispose();
                }
                if (!['inline', 'tabs', 'accordion'].includes(settings.kind)) {
                    await page.locator('[data-retarget]').click();
                    const retargeted = await record('destination changed after hydration');
                    observation.checks.retargetMovesCurrentContent = !!retargeted.probes.find(
                        (probe) => probe.name === 'first'
                    )?.inExternalDestination;
                }
            }
        } catch (error) {
            observation.errors.push(error instanceof Error ? error.message : String(error));
            observation.checks.completed = false;
            release();
        } finally {
            release();
            releaseLazy();
            observation.errors = [...new Set(observation.errors)];
            observation.checks.noErrors = observation.errors.length === 0;
            await page.close();
            const failures = Object.entries(observation.checks)
                .filter(([, success]) => !success)
                .map(([check]) => check);
            console.log(`${project} ${name}: ${failures.length ? failures.join(', ') : 'all observed checks passed'}`);
        }
    }
} finally {
    await browser.close();
    await mkdir(output, { recursive: true });
    await writeFile(
        resolve(output, `${variant}-${project}.json`),
        JSON.stringify({ build, browser: project, browserVersion: browser.version(), observations }, null, 2)
    );
}

if (!observations.length) throw new Error(`No cases selected: ${selected as CaseName | undefined}`);
const failures = observations.filter((observation) => Object.values(observation.checks).some((success) => !success));
console.log(`${observations.length - failures.length}/${observations.length} cases satisfy all observed invariants`);
if (failures.length) process.exitCode = 1;
