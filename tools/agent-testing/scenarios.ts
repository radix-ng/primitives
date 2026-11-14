import { expect, type Page } from '@playwright/test';
import type { AgentRun } from './types.ts';

const initialModel = { name: 'Radix project', visibility: 'private', environment: 'development', note: '' };
export const scenarios = {
    rename: {
        task: 'Rename the project to Agent workspace and change its Visibility to Public.',
        expected: { ...initialModel, name: 'Agent workspace', visibility: 'public' }
    },
    settings: {
        task: 'In Project settings, enter Ready for production as the Change note, choose the Production environment, and close the dialog.',
        expected: { ...initialModel, note: 'Ready for production', environment: 'production' }
    },
    canceled: {
        task: 'Rename the project to Agent workspace. Report whether the change was applied or canceled; if canceled, leave the original value intact.',
        constraint: 'Cancel value changes',
        expected: initialModel,
        explanation: /cancel(?:ed|led)|not applied/i
    },
    disabled: {
        task: 'Rename the project to Agent workspace and set Visibility to Public if the controls allow it. Explain any restriction without bypassing it.',
        constraint: 'Disable form controls',
        expected: initialModel,
        explanation: /disabled|not (?:available|editable)|cannot|can.t/i
    },
    'read-only': {
        task: 'Rename the project to Agent workspace and set Visibility to Public if the controls allow it. Explain any restriction without bypassing it.',
        constraint: 'Read-only form controls',
        expected: initialModel,
        explanation: /read.?only|not editable|cannot|can.t/i
    },
    archived: {
        task: 'Set Visibility to Archived if it is available. Explain any restriction without bypassing it.',
        expected: initialModel,
        explanation: /archived|disabled|unavailable|not available/i
    }
} as const;
export type ScenarioName = keyof typeof scenarios;
export interface AssertionResult {
    name: string;
    passed: boolean;
    message?: string;
}
export interface UiObservation {
    controls: { name: string; value: string }[];
    model: Record<string, unknown>;
}
export async function observeDemo(page: Page): Promise<UiObservation> {
    const controls = await page
        .locator('app-agent-input input, app-agent-select [rdxSelectTrigger]')
        .evaluateAll((elements) =>
            elements.map((element) => ({
                name:
                    element instanceof HTMLInputElement
                        ? (element.labels?.[0]?.textContent?.trim() ?? '')
                        : (element.getAttribute('aria-labelledby') ?? '')
                              .split(/\s+/)
                              .map((id) => element.ownerDocument.getElementById(id)?.textContent?.trim() ?? '')
                              .join(' '),
                value: element instanceof HTMLInputElement ? element.value : (element.textContent?.trim() ?? '')
            }))
        );
    return { controls, model: JSON.parse(await page.getByTestId('project-model').innerText()) };
}

export async function prepareScenario(page: Page, name?: ScenarioName) {
    await expect(page.getByRole('textbox', { name: 'Project name', exact: true })).toHaveValue(initialModel.name);
    await expect(page.getByTestId('registered-control')).toHaveCount(3);
    expect(JSON.parse(await page.getByTestId('project-model').innerText())).toEqual(initialModel);
    const scenario = name ? scenarios[name] : undefined;
    if (scenario && 'constraint' in scenario)
        await page.getByRole('checkbox', { name: scenario.constraint, exact: true }).check();
}

/** An observer, never a model tool. Reads real UI and the app's published model, not model claims. */
export async function verifyScenario(
    page: Page,
    run: AgentRun,
    name?: ScenarioName,
    observations: UiObservation[] = []
): Promise<AssertionResult[]> {
    const checks: AssertionResult[] = [];
    async function check(label: string, assertion: () => Promise<void> | void) {
        try {
            await assertion();
            checks.push({ name: label, passed: true });
        } catch (error) {
            checks.push({ name: label, passed: false, message: String(error) });
        }
    }
    await check('executor completed normally', () => expect(run.reason).toBe('completed'));
    await check('UI and runtime agree with the application model', async () => {
        const model = JSON.parse(await page.getByTestId('project-model').innerText());
        await expect(page.getByRole('textbox', { name: 'Project name', exact: true, includeHidden: true })).toHaveValue(
            model.name
        );
        await expect(page.getByRole('combobox', { name: 'Visibility', exact: true, includeHidden: true })).toHaveText(
            model.visibility === 'public' ? 'Public' : 'Private'
        );
        expect(run.finalSnapshot?.controls.find((control) => control.name === 'Project name')?.value).toBe(model.name);
        expect(run.finalSnapshot?.controls.find((control) => control.name === 'Visibility')?.value).toBe(
            model.visibility
        );
    });
    if (!name) return checks;
    const scenario = scenarios[name];
    await check('form model matches the task oracle', async () =>
        expect(JSON.parse(await page.getByTestId('project-model').innerText())).toEqual(scenario.expected)
    );
    await check('overlays are closed and transient registrations have been cleaned up', async () => {
        await expect(page.locator('[rdxDialogPopup], [rdxSelectPopup]')).toHaveCount(0);
        await expect(page.getByTestId('agent-backdrop')).toHaveCount(0);
        await expect(page.getByTestId('registered-control')).toHaveCount(3);
        await expect(page.locator('html')).not.toHaveAttribute('data-rdx-scroll-locked');
        expect(run.finalSnapshot?.controls.every((control) => control.open !== true)).toBe(true);
    });
    await check('controlled bindings match the final model', async () => {
        const state = JSON.parse(await page.getByTestId('project-form-state').innerText());
        expect(state).toMatchObject({ valid: true, dialogOpen: false, visibilityOpen: false, environmentOpen: false });
        if (name === 'rename' || name === 'settings') expect(state.dirty).toBe(true);
    });
    if ('explanation' in scenario)
        await check('final explanation acknowledges the obstacle', () =>
            expect(run.finalText).toMatch(scenario.explanation)
        );
    if (name === 'canceled')
        await check('the attempted change was canceled by the primitive callback', async () => {
            const journal = JSON.parse(await page.getByTestId('runtime-journal').innerText()) as {
                type: string;
                detail: Record<string, unknown>;
            }[];
            expect(
                journal.filter((entry) => entry.type === 'event' && entry.detail['event'] === 'input.value')
            ).toEqual([
                expect.objectContaining({
                    detail: expect.objectContaining({ value: 'Agent workspace', canceled: true })
                })
            ]);
            expect(
                run.events.some(
                    (entry) =>
                        entry.type === 'tool-result' &&
                        (entry.data as { result?: { status?: string } }).result?.status === 'canceled'
                )
            ).toBe(true);
        });
    if (name === 'rename' || name === 'settings')
        await check('expected changes used the primitive event path exactly once', async () => {
            const journal = JSON.parse(await page.getByTestId('runtime-journal').innerText()) as {
                type: string;
                detail: Record<string, unknown>;
            }[];
            for (const [event, controlName, value] of name === 'rename'
                ? [
                      ['input.value', 'Project name', 'Agent workspace'],
                      ['select.value', 'Visibility', 'public']
                  ]
                : [
                      ['input.value', 'Change note', 'Ready for production'],
                      ['select.value', 'Environment', 'production']
                  ]) {
                expect(
                    journal.filter(
                        (entry) =>
                            entry.type === 'event' &&
                            entry.detail['event'] === event &&
                            entry.detail['name'] === controlName
                    )
                ).toEqual([expect.objectContaining({ detail: expect.objectContaining({ value, canceled: false }) })]);
            }
        });
    if (name === 'rename' || name === 'settings')
        await check('real UI displayed the requested values before transient controls were destroyed', () => {
            for (const [controlName, value] of name === 'rename'
                ? [
                      ['Project name', 'Agent workspace'],
                      ['Visibility', 'Public']
                  ]
                : [
                      ['Change note', 'Ready for production'],
                      ['Environment', 'Production']
                  ]) {
                expect(
                    observations.some((observation) =>
                        observation.controls.some((control) => control.name === controlName && control.value === value)
                    )
                ).toBe(true);
            }
        });
    return checks;
}
