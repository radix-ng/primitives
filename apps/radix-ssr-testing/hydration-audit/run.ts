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
        const tooltipTrigger = document.querySelector('[data-audit-tooltip-trigger]');
        const tooltipPopup = document.querySelector('[data-audit-tooltip-popup]');
        const tooltipPositioner = document.querySelector('[data-audit-tooltip-positioner]');
        const toastPage = document.querySelector('app-toast');
        const toastPortal = document.querySelector('[data-toast-node="portal"]');
        const toastViewport = toastPortal?.querySelector('[data-toast-node="viewport"]');
        const toastRoot = toastViewport?.querySelector('[data-toast-node="root"]');
        const radioForm = document.querySelector<HTMLFormElement>('[data-radio-audit]');
        const radioView = radioForm?.parentElement;
        const radioGroup = radioView?.querySelector('[role="radiogroup"]');
        const labelPage = document.querySelector('app-label');
        const fieldView = document.querySelector('audit-field-view');
        const fieldControl = fieldView?.querySelector<HTMLInputElement>('[data-field-node="control"]');
        const rangeKind = document.querySelector('audit-meter-view') ? 'meter' : 'progress';
        const rangeAttribute = 'data-' + rangeKind + '-node';
        const rangeRoot = document.querySelector('[' + rangeAttribute + '="root"]');
        return {
            ready: window.portalHydrationAudit?.ready ?? false,
            stable: window.portalHydrationAudit?.stable,
            errors: window.portalHydrationAudit?.errors ?? [],
            constructed: window.portalHydrationAudit?.constructed ?? [],
            duplicateIds: ids.filter((id, index) => ids.indexOf(id) !== index),
            toast: toastPage
                ? {
                      nodes: Object.fromEntries(
                          [...document.querySelectorAll<HTMLElement>('[data-toast-node]')].map((node) => [
                              node.dataset.toastNode!,
                              {
                                  id: node.id,
                                  reused: window.auditServerNodes?.['toast:' + node.dataset.toastNode] === node
                              }
                          ])
                      ),
                      portals: document.querySelectorAll('[data-toast-node="portal"]').length,
                      entries: [...document.querySelectorAll('[data-toast-entry]')].map((node) =>
                          node.getAttribute('data-toast-entry')
                      ),
                      atDeclaration: toastPortal?.parentElement === toastPage,
                      atBody: toastPortal?.parentElement === document.body,
                      focus: active?.getAttribute('data-toast-node'),
                      title: toastRoot?.querySelector('[data-toast-node="title"]')?.textContent?.trim(),
                      name: toastRoot?.getAttribute('aria-labelledby'),
                      description: toastRoot?.getAttribute('aria-describedby'),
                      starting: toastRoot?.hasAttribute('data-starting-style'),
                      events: toastPage.querySelector('[data-toast-events]')?.textContent?.trim()
                  }
                : undefined,
            tooltip: {
                triggerId: tooltipTrigger?.id,
                description: tooltipTrigger?.getAttribute('aria-describedby'),
                triggerHydrated: tooltipTrigger?.hasAttribute('data-tooltip-hydrated'),
                triggerOpen: tooltipTrigger?.hasAttribute('data-popup-open'),
                popupId: tooltipPopup?.id,
                popupOpen: tooltipPopup?.hasAttribute('data-open'),
                payload: tooltipPopup?.textContent?.trim(),
                portalAtBody: tooltipPositioner?.parentElement === document.body,
                triggerReused: tooltipTrigger === window.auditServerNodes?.['tooltip-trigger'],
                popupReused: !!tooltipPopup && tooltipPopup === window.auditServerNodes?.['tooltip-popup'],
                popupCount: document.querySelectorAll('[data-audit-tooltip-popup]').length,
                controlledClosed: !document.querySelector('[data-audit-tooltip-unexpected]')
            },
            field: fieldControl
                ? {
                      nodes: Object.fromEntries(
                          [...fieldView!.querySelectorAll<HTMLElement>('[data-field-node]')].map((node) => [
                              node.dataset.fieldNode!,
                              {
                                  id: node.id,
                                  reused: window.auditServerNodes?.['field:' + node.dataset.fieldNode] === node
                              }
                          ])
                      ),
                      labelFor: fieldView?.querySelector<HTMLLabelElement>('label')?.htmlFor ?? null,
                      name: fieldControl.getAttribute('aria-labelledby'),
                      description: fieldControl.getAttribute('aria-describedby'),
                      validity: fieldView?.querySelector('output')?.textContent?.trim(),
                      invalid: fieldControl.hasAttribute('aria-invalid')
                  }
                : null,
            range: rangeRoot
                ? {
                      nodes: Object.fromEntries(
                          [rangeRoot, ...rangeRoot.querySelectorAll('[' + rangeAttribute + ']')].map((node) => {
                              const name = node.getAttribute(rangeAttribute)!;
                              return [
                                  name,
                                  { id: node.id, reused: window.auditServerNodes?.[rangeKind + ':' + name] === node }
                              ];
                          })
                      ),
                      name: rangeRoot.getAttribute('aria-labelledby'),
                      now: rangeRoot.getAttribute('aria-valuenow'),
                      announcement: rangeRoot.getAttribute('aria-valuetext'),
                      value: rangeRoot.querySelector('[' + rangeAttribute + '="value"]')?.textContent,
                      width: rangeRoot.querySelector<HTMLElement>('[' + rangeAttribute + '="indicator"]')?.style.width,
                      locale: new Intl.NumberFormat().resolvedOptions().locale
                  }
                : null,
            separators: Object.fromEntries(
                [...document.querySelectorAll<HTMLElement>('[data-separator-node]')].map((node) => {
                    const name = node.dataset.separatorNode!;
                    return [
                        name,
                        {
                            tag: node.localName,
                            role: node.getAttribute('role'),
                            ariaOrientation: node.getAttribute('aria-orientation'),
                            dataOrientation: node.getAttribute('data-orientation'),
                            reused: window.auditServerNodes?.['separator:' + name] === node
                        }
                    ];
                })
            ),
            slider: [...document.querySelectorAll<HTMLElement>('audit-slider-view [role="group"]')].map((root) => {
                const label = root.querySelector<HTMLElement>('[rdxsliderlabel]')!;
                const inputs = [...root.querySelectorAll<HTMLInputElement>('input')];
                const thumbs = inputs.map((input) => input.parentElement!);
                const indicator = root.querySelector<HTMLElement>('[rdxsliderindicator]')!;
                const track = root.querySelector<HTMLElement>('[rdxslidertrack]')!;
                const parts = [root, label, indicator, ...thumbs, ...inputs];
                const vertical = root.dataset.orientation === 'vertical';
                const rtl = root.dir === 'rtl';
                const trackRect = track.getBoundingClientRect();
                return {
                    name: inputs[0].name,
                    ids: [root.id, label.id, ...inputs.map((input) => input.id)],
                    reused: parts.every(
                        (part, index) => window.auditServerNodes?.[`slider:${inputs[0].name}:${index}`] === part
                    ),
                    named:
                        root.getAttribute('aria-labelledby') === label.id &&
                        inputs.every((input) => input.getAttribute('aria-labelledby') === label.id),
                    visibility: [...thumbs, indicator].map((part) => getComputedStyle(part).visibility),
                    start: [...thumbs, indicator].map((part) => {
                        const rect = part.getBoundingClientRect();
                        return Math.round(
                            vertical
                                ? trackRect.bottom - rect.bottom
                                : rtl
                                  ? trackRect.right - rect.right
                                  : rect.left - trackRect.left
                        );
                    }),
                    fill: Math.round(indicator.getBoundingClientRect()[vertical ? 'height' : 'width']),
                    values: inputs.map((input) => input.valueAsNumber)
                };
            }),
            label: labelPage
                ? {
                      nodes: Object.fromEntries(
                          [...labelPage.querySelectorAll<HTMLElement>('[data-label-node]')].map((node) => [
                              node.dataset.labelNode!,
                              {
                                  id: node.id,
                                  reused: window.auditServerNodes?.['label:' + node.dataset.labelNode] === node
                              }
                          ])
                      ),
                      associations: Object.fromEntries(
                          [...labelPage.querySelectorAll<HTMLLabelElement>('label[data-label-node]')].map((label) => [
                              label.dataset.labelNode!,
                              { htmlFor: label.getAttribute('for'), control: label.control?.id ?? null }
                          ])
                      ),
                      focus: active?.id,
                      checked: [...labelPage.querySelectorAll('input:checked')].map((input) => input.id),
                      controlClicks: Number(labelPage.getAttribute('data-control-clicks')),
                      detailsClicks: Number(labelPage.getAttribute('data-details-clicks')),
                      hash: location.hash
                  }
                : null,
            checkboxGroups: [...document.querySelectorAll<HTMLElement>('[data-checkbox-audit]')].map((view) => {
                const group = view.querySelector('[role="group"]');
                const parent = view.querySelector('[data-checkbox-node="parent"]');
                const children = [...view.querySelectorAll<HTMLElement>('[role="checkbox"]:not([data-parent])')];
                const nodes = [...view.querySelectorAll<HTMLElement>('[data-checkbox-node]')];
                const indicators = [...view.querySelectorAll<HTMLElement>('[data-checkbox-indicator]')];
                const initialIndicator = view.querySelector('[data-checkbox-indicator="a"]');
                const form = view.querySelector('form');
                return {
                    name: view.dataset.checkboxAudit,
                    hydrated: view.hasAttribute('data-client'),
                    requests: Number(view.getAttribute('data-checkbox-requests')),
                    fieldState: ['filled', 'dirty', 'touched'].filter((state) =>
                        view.querySelector('[rdxFieldRoot]')?.hasAttribute('data-' + state)
                    ),
                    checked: parent?.getAttribute('aria-checked'),
                    submitted: form ? new FormData(form).getAll('features') : [],
                    nativeInputs: view.querySelectorAll('input[type="checkbox"]').length,
                    indicators: indicators.map((indicator) => indicator.dataset.checkboxIndicator),
                    initialIndicatorReused:
                        !!initialIndicator &&
                        window.auditServerNodes?.[view.dataset.checkboxAudit + ':checkbox:indicator-a'] ===
                            initialIndicator,
                    ids: nodes.map((node) => node.id),
                    reused: nodes.every(
                        (node) =>
                            window.auditServerNodes?.[
                                view.dataset.checkboxAudit + ':checkbox:' + node.dataset.checkboxNode
                            ] === node
                    ),
                    controls: parent?.getAttribute('aria-controls') === children.map((child) => child.id).join(' '),
                    associations:
                        group?.getAttribute('aria-labelledby') ===
                            view.querySelector('[data-checkbox-node="group-label"]')?.id &&
                        group?.getAttribute('aria-describedby') ===
                            view.querySelector('[data-checkbox-node="description"]')?.id &&
                        children.every((child) => {
                            const label = view.querySelector<HTMLLabelElement>(
                                `[data-checkbox-node="label-${child.dataset.checkboxNode}"]`
                            );
                            return label?.control === child && child.getAttribute('aria-labelledby') === label?.id;
                        })
                };
            }),
            radio:
                radioForm && radioView
                    ? {
                          nodes: Object.fromEntries(
                              [...radioView.querySelectorAll<HTMLElement>('[data-radio-node]')].map((node) => [
                                  node.dataset.radioNode!,
                                  {
                                      id: node.id,
                                      reused: window.auditServerNodes?.['radio:' + node.dataset.radioNode] === node
                                  }
                              ])
                          ),
                          selection: radioGroup?.querySelector<HTMLElement>('[aria-checked="true"]')?.dataset.radioNode,
                          tabStop: radioGroup?.querySelector<HTMLElement>('[tabindex="0"]')?.dataset.radioNode,
                          focus: active?.getAttribute('data-radio-node'),
                          submitted: new FormData(radioForm).getAll('plan'),
                          requests: Number(radioForm.querySelector('output')?.textContent),
                          submits: Number(radioForm.getAttribute('data-radio-submits')),
                          submitValue: radioForm.getAttribute('data-radio-submit-value'),
                          requiredError:
                              radioView.querySelector('[data-radio-required-error]')?.hasAttribute('hidden') === false,
                          groupRef: radioForm.getAttribute('data-radio-group-ref'),
                          itemRef: radioForm.getAttribute('data-radio-item-ref'),
                          fieldState: ['filled', 'dirty', 'touched'].filter((state) =>
                              radioView.querySelector('[rdxFieldRoot]')?.hasAttribute('data-' + state)
                          ),
                          labels: ['a', 'b'].every((choice) => {
                              const item = radioView.querySelector(`[data-radio-node="${choice}"]`);
                              const label = radioView.querySelector<HTMLLabelElement>(
                                  `[data-radio-node="label-${choice}"]`
                              );
                              return (
                                  label?.id &&
                                  item?.getAttribute('aria-labelledby') === label.id &&
                                  label.control === radioView.querySelector(`[data-radio-node="input-${choice}"]`)
                              );
                          }),
                          groupLabel: document.getElementById(radioGroup?.getAttribute('aria-labelledby') ?? '')
                              ?.textContent,
                          groupDescription: document.getElementById(radioGroup?.getAttribute('aria-describedby') ?? '')
                              ?.textContent,
                          ending: [
                              ...radioView.querySelectorAll<HTMLElement>('[data-radio-node][data-ending-style]')
                          ].map((dot) => dot.dataset.radioNode),
                          starting: !!radioView.querySelector('[data-radio-node][data-starting-style]')
                      }
                    : undefined,
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

async function checkFieldHydration(
    page: Page,
    observation: Observation,
    record: (label: string) => Promise<Snapshot>,
    release: () => void
) {
    const fixture = page.locator('audit-field-view');
    await fixture.evaluate((host) => {
        for (const node of host.querySelectorAll<HTMLElement>('[data-field-node]'))
            window.auditServerNodes!['field:' + node.dataset.fieldNode] = node;
    });
    const before = (await record('server Field relationships and validity')).field;
    const checks = observation.checks;
    checks.serverField = Boolean(
        before?.nodes.control.id &&
        before.labelFor === before.nodes.control.id &&
        before.name === 'audit-field-name' &&
        before.description === ['audit-field-help', before.nodes.description.id, before.nodes.error.id].join(' ') &&
        before.invalid &&
        before.validity === 'This name is taken.'
    );

    release();
    await page.waitForFunction(() => window.portalHydrationAudit?.ready, undefined, { timeout: 5000 });
    const hydrated = await record('Field and its parts after hydration');
    const field = hydrated.field;
    checks.claimedFieldNodes = Boolean(
        before &&
        field &&
        Object.keys(before.nodes).length === 6 &&
        Object.entries(before.nodes).every(
            ([name, node]) => field.nodes[name]?.reused && field.nodes[name].id === node.id
        )
    );
    checks.hydratedFieldRelationships = Boolean(
        before &&
        field &&
        field.labelFor === before.labelFor &&
        field.description === before.description &&
        field.name === before.name &&
        field.validity === before.validity &&
        hydrated.duplicateIds.length === 0
    );

    const control = fixture.getByRole('textbox', { name: 'Account name' });
    await control.fill('New account');
    const edited = (await record('editing clears the server error without replacing the control')).field;
    checks.clearsServerError = Boolean(
        edited &&
        edited.nodes.control.reused &&
        !edited.invalid &&
        edited.validity === '' &&
        edited.description === ['audit-field-help', edited.nodes.description.id].join(' ')
    );

    const toggle = fixture.getByRole('button', { name: 'Toggle account label' });
    await toggle.click();
    const removed = (await record('authored name survives Label removal')).field;
    checks.removesLabel = removed?.labelFor === null && removed.name === 'audit-field-name';
    await toggle.click();
    const restored = (await record('replacement Label follows the claimed control')).field;
    checks.restoresLabel = Boolean(
        restored?.nodes.label &&
        !restored.nodes.label.reused &&
        restored.nodes.control.reused &&
        restored.labelFor === restored.nodes.control.id &&
        restored.name === 'audit-field-name'
    );
}

async function checkRangeHydration(
    page: Page,
    kind: 'progress' | 'meter',
    observation: Observation,
    record: (label: string) => Promise<Snapshot>,
    release: () => void
) {
    const checks = observation.checks;
    const fixture = page.locator('audit-' + kind + '-view');
    const role = kind === 'meter' ? 'meter' : 'progressbar';
    const name = kind === 'meter' ? 'Storage used' : 'Transfer progress';
    const externalName = kind === 'meter' ? 'External storage' : 'External transfer progress';
    await fixture.evaluate((host, kind) => {
        const attribute = 'data-' + kind + '-node';
        for (const node of host.querySelectorAll('[' + attribute + ']')) {
            window.auditServerNodes![kind + ':' + node.getAttribute(attribute)] = node;
        }
    }, kind);
    const before = (await record('server range, label, and value')).range;
    checks.serverRange =
        before?.now === '25' && before.announcement === '25%' && before.value === '25%' && before.width === '25%';
    checks.serverLabelAssociation = Boolean(
        before?.nodes.label?.id.startsWith('rdx-' + kind + '-label-') && before.name === before.nodes.label.id
    );

    release();
    await page.waitForFunction(() => window.portalHydrationAudit?.ready, undefined, { timeout: 5000 });
    const hydrated = await record('hydrated range adopts the browser locale');
    const boot = hydrated.range;
    checks.claimedNodes = Boolean(
        before &&
        boot &&
        Object.keys(before.nodes).length === 5 &&
        Object.entries(before.nodes).every(
            ([name, node]) => boot.nodes[name]?.reused && boot.nodes[name].id === node.id
        )
    );
    checks.hydratedRange =
        boot?.locale === 'de-DE' &&
        boot.now === '25' &&
        boot.announcement === '25\u00a0%' &&
        boot.value === '25\u00a0%' &&
        boot.width === '25%';
    checks.hydratedLabelAssociation =
        !!boot &&
        boot.name === before?.name &&
        hydrated.duplicateIds.length === 0 &&
        (await fixture.getByRole(role, { name }).count()) === 1;

    await fixture.getByRole('button', { name: 'Advance ' + kind }).click();
    const advanced = (await record('external data update on the claimed range')).range;
    checks.updatesWithoutReplacingNodes =
        advanced?.now === '80' &&
        advanced.value === '80\u00a0%' &&
        advanced.width === '80%' &&
        advanced.nodes.root.reused &&
        advanced.nodes.indicator.reused &&
        advanced.nodes.label.reused;

    const toggle = fixture.getByRole('button', { name: 'Toggle ' + kind + ' label' });
    await toggle.click();
    const withoutLabel = (await record('the authored association takes over when Label unmounts')).range;
    checks.externalLabelFallback =
        withoutLabel?.name === kind + '-external-label' &&
        (await fixture.getByRole(role, { name: externalName }).count()) === 1;
    await toggle.click();
    const restored = (await record('a new Label registers its ID')).range;
    checks.restoredLabel =
        !!restored &&
        (kind === 'meter' ? restored.name !== before?.name : restored.name === before?.name) &&
        restored.nodes.label?.id === restored.name &&
        !restored.nodes.label.reused &&
        restored.nodes.root.reused;
}

async function checkTooltipHydration(
    page: Page,
    observation: Observation,
    record: (label: string) => Promise<Snapshot>,
    release: () => void,
    late: boolean
) {
    const checks = observation.checks;
    await page.evaluate(() => {
        window.auditServerNodes!['tooltip-trigger'] = document.querySelector('[data-audit-tooltip-trigger]')!;
        window.auditServerNodes!['tooltip-popup'] = document.querySelector('[data-audit-tooltip-popup]')!;
    });
    const server = await record('server tooltip before bootstrap');
    const initial = server.tooltip;
    const payload = late ? 'Late details' : 'Initial details';
    checks.serverTooltip =
        !!initial.popupId &&
        !!initial.triggerId &&
        initial.popupCount === 1 &&
        initial.popupOpen === true &&
        initial.triggerOpen === true &&
        initial.description === initial.popupId &&
        initial.payload === payload &&
        !initial.portalAtBody &&
        initial.controlledClosed;

    release();
    await page.waitForFunction(() => window.portalHydrationAudit?.ready, undefined, { timeout: 5000 });
    await page.waitForFunction(
        () => document.querySelector('[data-audit-tooltip-positioner]')?.parentElement === document.body
    );
    const boot = await record('tooltip relocated after root hydration');
    checks.popupPreserved =
        boot.tooltip.popupReused &&
        boot.tooltip.popupId === initial.popupId &&
        boot.tooltip.popupCount === 1 &&
        boot.tooltip.popupOpen === true &&
        boot.tooltip.controlledClosed;
    if (late) {
        checks.detachedTriggerWasDehydrated = boot.tooltip.triggerHydrated === false;
        await page.locator('[data-audit-tooltip-trigger]').click();
    }
    await page.waitForFunction(() => {
        const trigger = document.querySelector('[data-audit-tooltip-trigger][data-tooltip-hydrated][data-popup-open]');
        const popup = document.querySelector('[data-audit-tooltip-popup]');
        return !!popup && popup.id === trigger?.getAttribute('aria-describedby');
    });
    const active = await record('hydrated trigger describes the original popup');
    checks.descriptionPreserved =
        active.tooltip.triggerReused &&
        active.tooltip.triggerId === initial.triggerId &&
        active.tooltip.description === initial.popupId &&
        active.tooltip.popupReused &&
        active.tooltip.popupCount === 1 &&
        active.tooltip.payload === payload &&
        active.duplicateIds.length === 0;

    await page.locator('button[data-audit-tooltip-close]').click();
    await page.waitForFunction(() => !document.querySelector('[data-audit-tooltip-popup]'));
    const closed = await record('closing removes the popup and description');
    checks.cleanClose =
        closed.tooltip.popupCount === 0 &&
        closed.tooltip.description === null &&
        closed.tooltip.triggerOpen === false &&
        closed.tooltip.triggerReused;
}

async function checkSeparatorHydration(
    page: Page,
    observation: Observation,
    record: (label: string) => Promise<Snapshot>,
    release: () => void
) {
    const checks = observation.checks;
    const fixture = page.locator('audit-separator-view');
    const expected = {
        standalone: { tag: 'div', orientation: 'horizontal' },
        native: { tag: 'hr', orientation: 'vertical' },
        'toolbar-default': { tag: 'div', orientation: 'vertical' },
        'toolbar-undefined': { tag: 'div', orientation: 'horizontal' }
    } as const;
    const parts = Object.entries(expected);
    const matches = (nodes: Snapshot['separators'], nativeOrientation: 'horizontal' | 'vertical') =>
        parts.every(([name, { tag, orientation }]) => {
            const node = nodes[name];
            const value = name === 'native' ? nativeOrientation : orientation;
            return (
                node?.tag === tag &&
                node.role === 'separator' &&
                node.ariaOrientation === value &&
                node.dataOrientation === value
            );
        });

    await fixture.evaluate((root) => {
        for (const node of root.querySelectorAll<HTMLElement>('[data-separator-node]')) {
            window.auditServerNodes!['separator:' + node.dataset.separatorNode] = node;
        }
    });
    const before = (await record('server separator semantics')).separators;
    checks.serverSemantics = matches(before, 'vertical');

    release();
    await page.waitForFunction(() => window.portalHydrationAudit?.ready, undefined, { timeout: 5000 });
    const boot = (await record('claimed separators after hydration')).separators;
    checks.hydratedSemantics =
        matches(boot, 'vertical') && (await fixture.getByRole('separator').count()) === parts.length;
    checks.claimedNodes = parts.every(([name]) => boot[name]?.reused === true);

    await fixture.getByRole('button', { name: 'Clear separator orientation' }).click();
    const cleared = (await record('clearing orientation updates the original rule')).separators;
    checks.clearsOrientationOnOriginalNodes =
        matches(cleared, 'horizontal') && parts.every(([name]) => cleared[name]?.reused === true);
}

async function checkToastHydration(
    page: Page,
    observation: Observation,
    record: (label: string) => Promise<Snapshot>,
    release: () => void
) {
    const checks = observation.checks;
    const close = page.getByRole('button', { name: 'Dismiss notification' });
    await page.locator('app-toast').evaluate((host) => {
        for (const node of host.querySelectorAll<HTMLElement>('[data-toast-node]')) {
            window.auditServerNodes!['toast:' + node.dataset.toastNode] = node;
        }
    });
    await close.focus();
    const before = (await record('initial Toast and focused close button in server DOM')).toast;
    const hasRelationships = (toast: Snapshot['toast']) =>
        !!toast?.nodes.title?.id &&
        toast.name === toast.nodes.title.id &&
        !!toast.nodes.description?.id &&
        toast.description === toast.nodes.description.id;
    checks.serverToast =
        !!before?.atDeclaration &&
        before.portals === 1 &&
        before.entries.join() === 'initial' &&
        before.title === 'Initial notification' &&
        before.focus === 'close' &&
        before.events === '' &&
        hasRelationships(before);

    release();
    await page.waitForFunction(() => window.portalHydrationAudit?.ready, undefined, { timeout: 5000 });
    await page.waitForFunction(
        () => document.querySelector('[data-toast-node="portal"]')?.parentElement === document.body,
        undefined,
        { timeout: 5000 }
    );
    const hydrated = await record('same viewport and Toast relocated to body');
    const boot = hydrated.toast;
    checks.reusedToast =
        !!before &&
        !!boot?.atBody &&
        boot.portals === 1 &&
        boot.entries.join() === 'initial' &&
        !boot.starting &&
        ['portal', 'viewport', 'root', 'title', 'description', 'close'].every(
            (part) => boot.nodes[part]?.reused && boot.nodes[part].id === before.nodes[part]?.id
        );
    checks.preservedFocusAndRelationships =
        boot?.focus === 'close' && hasRelationships(boot) && hydrated.duplicateIds.length === 0;

    const origin = page.getByRole('textbox', { name: 'Notification focus origin' });
    await origin.focus();
    await page.keyboard.press('F6');
    const entered = (await record('F6 enters the relocated viewport')).toast;
    await page.keyboard.press('Tab');
    const tabbed = (await record('Tab focuses the original notification')).toast;
    checks.keyboardEntry = entered?.focus === 'viewport' && tabbed?.focus === 'root' && tabbed.nodes.root.reused;

    await page.keyboard.press('Escape');
    await page.locator('[data-toast-entry="initial"]').waitFor({ state: 'detached', timeout: 5000 });
    const closed = (await record('Escape dismisses the initial toast and restores focus')).toast;
    checks.closedOnce =
        closed?.entries.length === 0 &&
        closed.events === 'close,remove' &&
        closed.focus === 'origin' &&
        closed.nodes.viewport.reused;

    await page.getByRole('button', { name: 'Add notification' }).click();
    await page.getByRole('dialog', { name: 'New notification' }).waitFor({ timeout: 5000 });
    const added = await record('new notification uses the same portal and fresh label IDs');
    const next = added.toast;
    checks.newToast =
        next?.entries.length === 1 &&
        !!next.entries[0]?.startsWith('rdx-toast-') &&
        next.title === 'New notification' &&
        next.events === 'close,remove' &&
        next.nodes.viewport.reused &&
        next.name !== before?.name &&
        next.description !== before?.description &&
        hasRelationships(next) &&
        added.duplicateIds.length === 0;
}

async function checkSliderHydration(
    page: Page,
    observation: Observation,
    record: (label: string) => Promise<Snapshot>,
    release: () => void
) {
    const fixture = page.locator('audit-slider-view');
    await fixture.evaluate((view) => {
        for (const root of view.querySelectorAll('[role="group"]')) {
            const inputs = [...root.querySelectorAll('input')];
            const parts = [
                root,
                root.querySelector('[rdxsliderlabel]')!,
                root.querySelector('[rdxsliderindicator]')!,
                ...inputs.map((input) => input.parentElement!),
                ...inputs
            ];
            parts.forEach((part, index) => {
                window.auditServerNodes![`slider:${inputs[0].name}:${index}`] = part;
            });
        }
    });
    const initialGeometry = [
        { name: 'edge', start: [0, 0], fill: 10, values: [0] },
        { name: 'edge-client-only', start: [0, 0], fill: 10, values: [0] },
        { name: 'edge-rtl-range', start: [45, 120, 55], fill: 85, values: [25, 75] },
        { name: 'edge-vertical', start: [144, 0], fill: 154, values: [80] },
        { name: 'padded-ltr', start: [0, 110, 10], fill: 120, values: [0, 100] },
        { name: 'padded-rtl', start: [0, 110, 10], fill: 120, values: [0, 100] },
        { name: 'padded-vertical', start: [0, 130, 10], fill: 130, values: [0, 100] }
    ];
    const matchesGeometry = (part: Snapshot['slider'][number], expected: (typeof initialGeometry)[number]) =>
        part.name === expected.name &&
        part.fill === expected.fill &&
        part.start.join() === expected.start.join() &&
        part.values.join() === expected.values.join() &&
        part.visibility.every((visibility) => visibility === 'visible');
    const before = (await record('server slider first paint with Angular blocked')).slider;
    observation.checks.serverValuesAndNames =
        before.length === initialGeometry.length &&
        before.every((part, index) => part.named && part.values.join() === initialGeometry[index].values.join());
    observation.checks.serverEdgeGeometry =
        before.filter((part) => part.name !== 'edge-client-only').length === initialGeometry.length - 1 &&
        before.every(
            (part, index) => part.name === 'edge-client-only' || matchesGeometry(part, initialGeometry[index])
        );
    observation.checks.clientOnlyInitiallyHidden =
        before
            .find((part) => part.name === 'edge-client-only')
            ?.visibility.every((visibility) => visibility === 'hidden') === true;
    const monitor = await fixture.evaluateHandle((view) => {
        const parts = [...view.querySelectorAll('[data-rdx-slider-percent], [data-rdx-slider-indicator]')];
        let hiddenFrames = 0;
        let frame: number;
        function sample() {
            if (parts.some((part) => !part.isConnected || getComputedStyle(part).visibility !== 'visible')) {
                hiddenFrames++;
            }
            frame = requestAnimationFrame(sample);
        }
        sample();
        return {
            stop() {
                cancelAnimationFrame(frame);
                return parts.length > 0 && hiddenFrames === 0;
            }
        };
    });
    release();
    await page.waitForFunction(() => window.portalHydrationAudit?.ready, undefined, { timeout: 5000 });
    const after = (await record('reused sliders measured at the start edge')).slider;
    observation.checks.noHiddenFrameDuringHydration = await monitor.evaluate((probe) => probe.stop());
    await monitor.dispose();
    observation.checks.hydratedGeometryAndIdentity =
        after.length === initialGeometry.length &&
        after.every(
            (part, index) =>
                part.reused &&
                part.named &&
                matchesGeometry(part, initialGeometry[index]) &&
                part.ids.every((id, idIndex) => id && id === before[index].ids[idIndex])
        );

    for (const { name } of initialGeometry.slice(0, 2)) {
        await fixture.getByRole('slider', { name: 'Volume ' + name, exact: true }).press('End');
    }
    const edited = (await record('keyboard edit moves the original thumbs')).slider;
    observation.checks.editedGeometry = edited.every(
        (part, index) =>
            part.reused &&
            matchesGeometry(
                part,
                index < 2
                    ? { ...initialGeometry[index], start: [180, 0], fill: 190, values: [100] }
                    : initialGeometry[index]
            )
    );
    const paddedRangeGeometry = [
        { name: 'padded-ltr', start: [26, 88, 36], fill: 72, values: [20, 80] },
        { name: 'padded-rtl', start: [26, 88, 36], fill: 72, values: [20, 80] },
        { name: 'padded-vertical', start: [26, 104, 36], fill: 78, values: [20, 80] }
    ];
    for (const { name } of paddedRangeGeometry) {
        const slider = fixture.getByRole('group', { name: 'Volume ' + name, exact: true });
        const track = (await slider.locator('[rdxSliderTrack]').boundingBox())!;
        const thumbs = await slider.locator('[rdxSliderThumb]').all();
        const vertical = name === 'padded-vertical';
        const rtl = name === 'padded-rtl';
        for (const [index, thumb] of thumbs.entries()) {
            const box = (await thumb.boundingBox())!;
            const size = vertical ? track.height : track.width;
            const radius = (vertical ? box.height : box.width) / 2;
            const percent = index === 0 ? 0.2 : 0.8;
            const offset = radius + (size - 2 * radius) * percent;
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await page.mouse.down();
            await page.mouse.move(
                vertical ? box.x + box.width / 2 : rtl ? track.x + track.width - offset : track.x + offset,
                vertical ? track.y + track.height - offset : box.y + box.height / 2
            );
            await page.mouse.up();
        }
    }
    const dragged = (await record('both thumbs follow the decorated track during dragging')).slider;
    observation.checks.draggedOnDecoratedTracks = paddedRangeGeometry.every((expected) => {
        const part = dragged.find((candidate) => candidate.name === expected.name);
        return !!part?.reused && matchesGeometry(part, expected);
    });
    await fixture.getByRole('button', { name: 'Reset volume' }).click();
    await page.waitForFunction(() =>
        [
            ...document.querySelectorAll<HTMLInputElement>(
                'audit-slider-view input[name="edge"], audit-slider-view input[name="edge-client-only"]'
            )
        ].every((input) => input.valueAsNumber === 0)
    );
    const reset = (await record('form reset restores the initial values')).slider;
    observation.checks.resetGeometry = reset.every(
        (part, index) => part.reused && matchesGeometry(part, initialGeometry[index])
    );
}

async function checkLabelHydration(
    page: Page,
    observation: Observation,
    record: (label: string) => Promise<Snapshot>,
    release: () => void
) {
    const checks = observation.checks;
    page.setDefaultTimeout(5000);
    const fixture = page.locator('app-label');
    const email = fixture.getByText('Email', { exact: true });
    const alerts = fixture.getByText('Delivery alerts', { exact: true });
    await fixture.evaluate((root) => {
        for (const node of root.querySelectorAll<HTMLElement>('[data-label-node]')) {
            window.auditServerNodes!['label:' + node.dataset.labelNode] = node;
        }
    });
    await email.click();
    const before = (await record('server label relationships and native click')).label;
    checks.serverAssociations = Boolean(
        before?.associations['email-label']?.htmlFor === 'label-email' &&
        before.associations['email-label'].control === 'label-email' &&
        before.associations['wrapped-label']?.htmlFor === null &&
        before.associations['wrapped-label'].control === 'label-remember' &&
        before.associations['disabled-label']?.control === 'label-disabled' &&
        before.associations['alerts-label']?.htmlFor === 'label-alerts' &&
        before.associations['alerts-label'].control === 'label-alerts'
    );
    checks.serverLabelIds = Boolean(
        before?.nodes['email-label']?.id.startsWith('rdx-label-') &&
        before.nodes['wrapped-label']?.id.startsWith('rdx-label-') &&
        before.nodes['alerts-label']?.id === 'alerts-label'
    );
    checks.serverClickFocusesControl = before?.focus === 'label-email' && before.controlClicks === 0;

    release();
    await page.waitForFunction(() => window.portalHydrationAudit?.ready, undefined, { timeout: 5000 });
    const hydrated = await record('claimed label and control nodes after hydration');
    const boot = hydrated.label;
    checks.claimedLabelAndControlNodes = Boolean(
        before &&
        boot &&
        Object.entries(before.nodes).every(
            ([name, node]) => boot.nodes[name]?.reused && boot.nodes[name].id === node.id
        )
    );
    checks.hydratedLabelRelationships =
        !!boot &&
        JSON.stringify(boot.associations) === JSON.stringify(before?.associations) &&
        hydrated.duplicateIds.length === 0;
    checks.hydrationPreservesFocus = boot?.focus === 'label-email';
    checks.hydrationReplaysControlClickOnce = boot?.controlClicks === 1;
    checks.accessibleNames =
        (await fixture.getByRole('textbox', { name: 'Email', exact: true }).count()) === 1 &&
        (await fixture.getByRole('checkbox', { name: 'Remember me', exact: true }).count()) === 1 &&
        (await fixture.getByRole('checkbox', { name: 'Disabled alerts', exact: true }).count()) === 1 &&
        (await fixture.getByRole('checkbox', { name: /Delivery alerts/ }).count()) === 1;

    await fixture.getByText('Remember me', { exact: true }).click();
    const wrapped = (await record('wrapped checkbox activates once')).label;
    checks.wrappedLabelActivatesOnce = wrapped?.controlClicks === 2 && wrapped.checked.join() === 'label-remember';

    await fixture.getByText('Disabled alerts', { exact: true }).click({ force: true });
    const disabled = (await record('disabled checkbox blocks native activation')).label;
    checks.disabledLabelIgnoresClick =
        disabled?.controlClicks === 2 &&
        disabled.checked.join() === 'label-remember' &&
        disabled.focus !== 'label-disabled';

    await fixture.getByRole('button', { name: 'Details', exact: true }).locator('span').click();
    await fixture.getByRole('link', { name: 'Help', exact: true }).locator('span').click();
    const nested = (await record('nested button and link perform their own actions')).label;
    checks.nestedActionsStayIndependent =
        nested?.detailsClicks === 1 &&
        nested.hash === '#label-help' &&
        nested.controlClicks === 2 &&
        nested.checked.join() === 'label-remember';

    await fixture.getByRole('button', { name: 'Replace label and control' }).click();
    const replaced = (await record('replacement label and checkbox with the same IDs')).label;
    checks.replacementPreservesAssociation =
        replaced?.nodes['alerts-label']?.id === 'alerts-label' &&
        replaced.nodes['alerts-label'].reused === false &&
        replaced.nodes['alerts']?.id === 'label-alerts' &&
        replaced.nodes['alerts'].reused === false &&
        replaced.associations['alerts-label']?.control === 'label-alerts';
    await alerts.click();
    const activated = (await record('replacement checkbox activates once')).label;
    checks.replacementActivatesOnce =
        activated?.controlClicks === 3 && activated.checked.join() === 'label-remember,label-alerts';

    await fixture.getByRole('button', { name: 'Retarget label' }).click();
    await alerts.click();
    const retargeted = (await record('htmlFor moves the association and activation')).label;
    checks.retargetMovesAssociation =
        retargeted?.associations['alerts-label']?.htmlFor === 'label-sms' &&
        retargeted.associations['alerts-label'].control === 'label-sms' &&
        retargeted.controlClicks === 4 &&
        retargeted.checked.join() === 'label-remember,label-alerts,label-sms' &&
        (await fixture.getByRole('checkbox', { name: /Delivery alerts/ }).getAttribute('id')) === 'label-sms';
}

async function checkCheckboxHydration(
    page: Page,
    observation: Observation,
    record: (label: string) => Promise<Snapshot>,
    release: () => void
) {
    const first = page.locator('[data-checkbox-audit="first"]');
    const second = page.locator('[data-checkbox-audit="second"]');
    await page.evaluate(() => {
        for (const view of document.querySelectorAll<HTMLElement>('[data-checkbox-audit]')) {
            for (const node of view.querySelectorAll<HTMLElement>('[data-checkbox-node]')) {
                window.auditServerNodes![view.dataset.checkboxAudit + ':checkbox:' + node.dataset.checkboxNode] = node;
            }
            const indicator = view.querySelector('[data-checkbox-indicator="a"]');
            if (indicator) window.auditServerNodes![view.dataset.checkboxAudit + ':checkbox:indicator-a'] = indicator;
        }
    });
    const { checkboxGroups: before } = await record('server-rendered groups and labels');
    observation.checks.serverGroups =
        before.length === 2 &&
        before.every(
            (group) =>
                !group.hydrated &&
                group.checked === 'mixed' &&
                group.submitted.join() === 'a' &&
                group.controls &&
                group.associations
        );

    release();
    await page.waitForFunction(() => window.portalHydrationAudit?.ready, undefined, { timeout: 5000 });
    const { checkboxGroups: boot } = await record('groups still deferred after bootstrap');
    observation.checks.deferredOnBootstrap = boot.length === 2 && boot.every((group) => !group.hydrated);

    await second.locator('[data-checkbox-node="parent"]').click();
    await second.and(page.locator('[data-checkbox-requests="1"]')).waitFor({ timeout: 5000 });
    const { checkboxGroups: afterSecond } = await record('select-all replays in the second group');
    observation.checks.secondHydratesFirst =
        !afterSecond[0]?.hydrated &&
        afterSecond[0]?.submitted.join() === 'a' &&
        afterSecond[1]?.hydrated &&
        afterSecond[1]?.submitted.join() === 'a,b';

    await first.locator('[data-checkbox-node="parent"]').click();
    await first.and(page.locator('[data-checkbox-requests="1"]')).waitFor({ timeout: 5000 });
    const afterBoth = await record('both groups retain their server associations after replay');
    observation.checks.replayedOncePerGroup = afterBoth.checkboxGroups.every(
        (group) =>
            group.hydrated && group.requests === 1 && group.checked === 'true' && group.submitted.join() === 'a,b'
    );
    observation.checks.idsAndNodesPreserved =
        !afterBoth.duplicateIds.length &&
        afterBoth.checkboxGroups.every(
            (group, index) =>
                group.reused && group.controls && group.associations && group.ids.join() === before[index].ids.join()
        );

    observation.checks.indicatorsHydrateAndMount =
        before.every((group) => group.indicators.join() === 'a') &&
        afterBoth.checkboxGroups.every((group) => group.indicators.join() === 'a,b' && group.initialIndicatorReused);
    observation.checks.fallbackInputAfterHydration =
        before.every((group) => group.nativeInputs === 2) &&
        afterBoth.checkboxGroups.every((group) => group.nativeInputs === 3);

    await second.locator('[data-checkbox-node="label-b"]').click();
    const { checkboxGroups: afterLabel } = await record('native label activates its original control');
    observation.checks.nativeLabelAfterHydration =
        afterLabel[0]?.requests === 1 &&
        afterLabel[0]?.submitted.join() === 'a,b' &&
        afterLabel[1]?.requests === 2 &&
        afterLabel[1]?.submitted.join() === 'a';

    await first.locator('[data-checkbox-node="parent"]').focus();
    await page.locator('[data-hydrate-first]').focus();
    const { checkboxGroups: beforeReset } = await record('the edited group is dirty and touched');
    await first.locator('form').evaluate((form) => (form as HTMLFormElement).reset());
    await first.locator('[data-checkbox-node="parent"][aria-checked="mixed"]').waitFor({ timeout: 5000 });
    await first.locator('[data-checkbox-indicator="b"]').waitFor({ state: 'detached', timeout: 5000 });
    const { checkboxGroups: afterReset } = await record('native reset restores the initial selection and Field state');
    observation.checks.resetRestoresHydratedGroup =
        beforeReset[0]?.fieldState.join() === 'filled,dirty,touched' &&
        afterReset[0]?.submitted.join() === 'a' &&
        afterReset[0]?.fieldState.join() === 'filled' &&
        afterReset[0]?.requests === 1 &&
        afterReset[0]?.reused &&
        afterReset[0]?.initialIndicatorReused &&
        afterReset[0]?.indicators.join() === 'a' &&
        afterReset[1]?.requests === 2;
}

async function checkRadioHydration(
    page: Page,
    observation: Observation,
    record: (label: string) => Promise<Snapshot>,
    release: () => void
) {
    const checks = observation.checks;
    const alpha = page.getByRole('radio', { name: 'Alpha' });
    const beta = page.getByRole('radio', { name: 'Beta' });
    const alphaDot = page.locator('[data-radio-node="dot-a"]');
    const betaDot = page.locator('[data-radio-node="dot-b"]');
    await page.evaluate(() => {
        for (const node of document.querySelectorAll<HTMLElement>('[data-radio-node]')) {
            window.auditServerNodes!['radio:' + node.dataset.radioNode] = node;
        }
    });
    await beta.focus({ timeout: 5000 });
    const before = (await record('selected radio and retained indicator in server DOM')).radio;
    checks.serverRelationships = Boolean(
        before?.labels && before.groupLabel === 'Plan' && before.groupDescription === 'Choose one plan.'
    );
    checks.serverIndicatorsSettled = Boolean(
        before?.nodes['dot-a'] && before.nodes['dot-b'] && !before.starting && before.ending.length === 0
    );
    checks.serverSelection = before?.selection === 'b' && before.submitted.join() === 'b' && before.requests === 0;
    checks.serverRefsAreSilent = before?.groupRef === null && before.itemRef === null;

    release();
    await page.waitForFunction(() => window.portalHydrationAudit?.ready, undefined, { timeout: 5000 });
    const hydrated = await record('claimed nodes and IDs after hydration');
    const boot = hydrated.radio;
    checks.claimedServerNodes = Boolean(
        boot &&
        before &&
        Object.entries(before.nodes).every(([key, node]) => boot.nodes[key]?.reused && boot.nodes[key].id === node.id)
    );
    checks.hydratedRelationships = Boolean(
        boot?.labels &&
        boot.groupLabel === before?.groupLabel &&
        boot.groupDescription === before?.groupDescription &&
        hydrated.duplicateIds.length === 0
    );
    checks.hydratedSelectionAndFocus =
        before?.focus === 'b' &&
        boot?.focus === 'b' &&
        boot.tabStop === 'b' &&
        boot.selection === 'b' &&
        boot.submitted.join() === 'b' &&
        boot.requests === 0 &&
        !boot.starting &&
        boot.ending.length === 0;
    checks.hydratedRefs = Boolean(
        boot?.nodes['input-b']?.reused &&
        boot.groupRef === boot.nodes['input-b'].id &&
        boot.itemRef === boot.nodes['input-b'].id
    );

    await beta.press('ArrowRight');
    await betaDot.and(page.locator('[data-ending-style]')).waitFor({ timeout: 5000 });
    const exiting = (await record('keyboard selection after hydration holds exit')).radio;
    checks.hydratedRefsFollowSelection = Boolean(
        exiting?.nodes['input-a']?.reused &&
        exiting.groupRef === exiting.nodes['input-a'].id &&
        exiting.itemRef === boot?.itemRef
    );
    checks.keyboardAndExit =
        exiting?.focus === 'a' &&
        exiting.selection === 'a' &&
        exiting.requests === 1 &&
        exiting.submitted.join() === 'a' &&
        exiting.ending.includes('dot-b') &&
        !!exiting.nodes['dot-b']?.reused &&
        !!exiting.nodes['dot-a']?.reused;

    await alpha.press('ArrowRight');
    await alphaDot.evaluate((dot) => dot.getAnimations().forEach((animation) => animation.finish()));
    const reversed = (await record('keyboard re-selection preserves the outgoing server node')).radio;
    checks.interruptedExit =
        reversed?.focus === 'b' &&
        reversed.selection === 'b' &&
        reversed.requests === 2 &&
        !!reversed.nodes['dot-b']?.reused &&
        !reversed.ending.includes('dot-b');

    await beta.press('ArrowRight');
    await betaDot.and(page.locator('[data-ending-style]')).waitFor({ timeout: 5000 });
    await betaDot.evaluate((dot) => dot.getAnimations().forEach((animation) => animation.finish()));
    await betaDot.waitFor({ state: 'detached', timeout: 5000 });
    await page.locator('[data-radio-node="label-b"]').click();
    const final = (await record('native label reactivates the radio and recreates its indicator')).radio;
    checks.labelRecreatesIndicator =
        final?.selection === 'b' &&
        final.requests === 4 &&
        final.submitted.join() === 'b' &&
        !!final.nodes['dot-b'] &&
        !final.nodes['dot-b'].reused &&
        !!final.nodes['input-b']?.reused &&
        !!final.nodes['dot-a']?.reused;

    await beta.press('ArrowRight');
    const form = page.locator('[data-radio-audit]');
    await form.evaluate((element: HTMLFormElement) => {
        element.addEventListener('reset', (event) => event.preventDefault(), { once: true });
        element.reset();
    });
    const canceled = (await record('canceled native reset retains the edit')).radio;
    checks.canceledResetPreservesField =
        canceled?.selection === 'a' &&
        canceled.submitted.join() === 'a' &&
        canceled.requests === 5 &&
        canceled.fieldState.join() === 'filled,dirty,touched';

    await form.evaluate((element: HTMLFormElement) => element.reset());
    await page.locator('[data-radio-node="b"][aria-checked="true"]').waitFor({ timeout: 5000 });
    const reset = (await record('accepted native reset restores the default and the Field')).radio;
    checks.nativeResetRestoresField =
        reset?.selection === 'b' &&
        reset.submitted.join() === 'b' &&
        reset.requests === 5 &&
        reset.fieldState.join() === 'filled';

    await page.locator('[data-radio-clear]').click();
    await page.locator('[data-radio-submit]').click();
    await page.locator('[data-radio-required-error]').waitFor({ state: 'visible', timeout: 5000 });
    const blocked = (await record('hydrated required radio blocks submission')).radio;
    checks.hydratedRequiredConstraint =
        blocked?.requiredError === true &&
        blocked.focus === 'a' &&
        blocked.submits === 0 &&
        blocked.submitted.length === 0 &&
        !!blocked.nodes['input-a']?.reused;

    await beta.click();
    await page.locator('[data-radio-submit]').click();
    const submitted = (await record('hydrated required radio submits after a selection')).radio;
    checks.hydratedRequiredRecovery =
        submitted?.requiredError === false &&
        submitted.submits === 1 &&
        submitted.submitValue === 'b' &&
        submitted.submitted.join() === 'b';

    await page.locator('[data-radio-move]').click();
    await page.locator('[data-radio-portal] [role="radiogroup"]').waitFor();
    await page.locator('[data-radio-clear]').click();
    await page.locator('[data-radio-submit]').click();
    await page.locator('[data-radio-required-error]').waitFor({ state: 'visible', timeout: 5000 });
    const portaled = (await record('portaled required radio still blocks the declaring form')).radio;
    checks.hydratedPortalConstraint =
        portaled?.requiredError === true &&
        portaled.focus === 'a' &&
        portaled.submits === 1 &&
        portaled.submitted.length === 0 &&
        !!portaled.nodes['input-a']?.reused;

    await page.locator('[data-radio-node="label-b"]').click();
    await page.locator('[data-radio-submit]').click();
    const portalSubmission = (await record('declaring Form includes the portaled selection')).radio;
    checks.hydratedPortalSubmission =
        portalSubmission?.requiredError === false &&
        portalSubmission.submits === 2 &&
        portalSubmission.submitValue === 'b' &&
        portalSubmission.submitted.length === 0 &&
        !!portalSubmission.nodes['input-b']?.reused;

    await page.locator('[data-radio-node="label-a"]').click();
    await expectRadioSelection('a');
    await form.evaluate((element: HTMLFormElement) => {
        element.ownerDocument.addEventListener('reset', (event) => event.preventDefault(), { once: true });
        element.reset();
    });
    const canceledPortalReset = (await record('canceled native reset retains the portaled edit')).radio;
    checks.canceledPortaledReset =
        canceledPortalReset?.selection === 'a' &&
        canceledPortalReset.submitted.length === 0 &&
        canceledPortalReset.fieldState.join() === 'filled,dirty,touched';

    await form.evaluate((element: HTMLFormElement) => element.reset());
    await expectRadioSelection('b');
    const portalReset = (await record('native reset restores the portaled default')).radio;
    checks.nativeResetRestoresPortaledField =
        portalReset?.selection === 'b' &&
        portalReset.submitted.length === 0 &&
        !!portalReset.nodes['input-b']?.reused &&
        portalReset.requests === canceledPortalReset?.requests &&
        portalReset.fieldState.join() === 'filled';

    function expectRadioSelection(value: 'a' | 'b'): Promise<void> {
        return page.locator(`[data-radio-node="${value}"][aria-checked="true"]`).waitFor({ timeout: 5000 });
    }
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
        const range = settings.kind === 'progress' || settings.kind === 'meter';
        const page = await browser.newPage(range ? { locale: 'de-DE' } : undefined);
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
            if (settings.kind === 'checkbox') {
                await checkCheckboxHydration(page, observation, record, release);
                continue;
            }
            if (settings.kind === 'radio') {
                await checkRadioHydration(page, observation, record, release);
                continue;
            }
            if (settings.kind === 'label') {
                await checkLabelHydration(page, observation, record, release);
                continue;
            }
            if (settings.kind === 'field') {
                await checkFieldHydration(page, observation, record, release);
                continue;
            }
            if (settings.kind === 'progress' || settings.kind === 'meter') {
                await checkRangeHydration(page, settings.kind, observation, record, release);
                continue;
            }
            if (settings.kind === 'separator') {
                await checkSeparatorHydration(page, observation, record, release);
                continue;
            }
            if (settings.kind === 'slider') {
                await checkSliderHydration(page, observation, record, release);
                continue;
            }
            if (settings.kind === 'tooltip') {
                await checkTooltipHydration(page, observation, record, release, name === 'detached-tooltip');
                continue;
            }
            if (settings.kind === 'toast') {
                await checkToastHydration(page, observation, record, release);
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
