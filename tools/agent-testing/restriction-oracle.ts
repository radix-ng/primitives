import type { ControlSnapshot } from '../../apps/radix-playground/src/app/agent-runtime/types.ts';
import { toolInputSchemas, toolResultSchemas } from './schemas.ts';
import type { AgentRun } from './types.ts';

const explanations = {
    archived: {
        subject: /\barchived\b/,
        reason: /\b(?:disabled|unavailable|unselectable|blocked|restricted)\b|\bnot (?:currently )?(?:available|selectable)\b/
    },
    disabled: { subject: /\b(?:controls?|form|project|visibility)\b/, reason: /\bdisabled\b|\bnot enabled\b/ },
    'read-only': { subject: /\b(?:controls?|form|project|visibility)\b/, reason: /\bread[ -]?only\b|\bnot editable\b/ },
    canceled: { subject: /\b(?:change|request|rename|project)\b/, reason: /\b(?:cancel(?:ed|led|lation)|vetoed)\b/ }
} as const;
export type RestrictionScenario = keyof typeof explanations;
export const isRestrictionScenario = (name: string): name is RestrictionScenario => Object.hasOwn(explanations, name);
export const restrictionOracleVersion = 'restriction-oracle/2';

/** Passive present-state descriptions must name a value in the independent final snapshot. */
function describesCurrentSetting(clause: string, index: number, controls: readonly ControlSnapshot[]): boolean {
    const subject = clause.slice(0, index).trimEnd();
    const setting = /^set\s+to\s+(.+)$/
        .exec(clause.slice(index))?.[1]
        .trim()
        .replace(/^["']|["']$/g, '');
    if (setting === undefined) return false;
    return controls.some((control) => {
        if (control.kind !== 'input' && control.kind !== 'select') return false;
        const name = control.name.toLowerCase();
        if (
            ![name, `${name} is`, `${name} is still`, `${name} remains`].some(
                (phrase) => subject === phrase || subject.endsWith(` ${phrase}`)
            )
        )
            return false;
        const values = [control.value, control.options?.find((option) => option.value === control.value)?.label];
        return values.some((value) => typeof value === 'string' && value.toLowerCase() === setting);
    });
}

/** Conservative English checks for these fixed scenarios, not a general natural-language judge. */
export function explainsRestriction(
    name: RestrictionScenario,
    text: string,
    controls: readonly ControlSnapshot[] = []
): boolean {
    const normalized = text.toLowerCase().replaceAll('’', "'").replace(/[“”]/g, '"');
    const clauses = normalized.split(/[.!?;,\n]+|\b(?:and|but|however|although|yet)\b/);
    const negatedReason =
        /\b(?:not|never|isn't|aren't|wasn't|weren't)\s+(?:disabled|unavailable|unselectable|blocked|restricted|read[ -]?only|canceled|cancelled|vetoed)\b/;
    const { subject, reason } = explanations[name];
    if (!clauses.some((clause) => subject.test(clause) && reason.test(clause) && !negatedReason.test(clause)))
        return false;

    const claimsFinalValue =
        /\b(?:visibility|project(?: name)?|name|value|selection|it)\s+(?:(?:is|was|has become)\s+(?:now\s+)?|now\s+)(?:archived|public|agent workspace)\b/;
    const edit = /\b(?:renamed|changed|updated|set|selected|applied|switched|saved|made)\b/g;
    const taskSubject = /\b(?:project|visibility|archived|public|agent workspace|changes?|request|it)\b/;
    const deniedEdit =
        /\b(?:not|no|never|cannot|can't|couldn't|could not|unable|didn't|did not)\b|\b(?:tried|attempted|requested|request|failed)\s+to\b/;
    return !clauses.some((clause) => {
        if (claimsFinalValue.test(clause)) return true;
        if (!taskSubject.test(clause)) return false;
        return [...clause.matchAll(edit)].some((claim) => {
            if (claim[0] === 'set' && describesCurrentSetting(clause, claim.index, controls)) return false;
            return !deniedEdit.test(clause.slice(0, claim.index));
        });
    });
}

function hasConstraint(name: Exclude<RestrictionScenario, 'canceled'>, control: ControlSnapshot): boolean {
    if (name === 'archived')
        return (
            control.kind === 'select' &&
            control.name === 'Visibility' &&
            control.options?.some((option) => option.value === 'archived' && option.disabled === true) === true
        );
    const target =
        (control.kind === 'input' && control.name === 'Project name') ||
        (control.kind === 'select' && control.name === 'Visibility');
    return target && (name === 'disabled' ? control.disabled === true : control.readOnly === true);
}

/** Read only results actually delivered by agent tools; final observer snapshots are not model discovery. */
export function restrictionEvidence(
    name: RestrictionScenario,
    run: AgentRun
): { observed: boolean; confirmed: boolean } {
    const observed: ControlSnapshot[] = [];
    const cancellations: { id: string; value: unknown }[] = [];
    for (const event of run.events) {
        if (event.type !== 'tool-result') continue;
        const data = event.data as { name?: unknown; arguments?: unknown; result?: unknown } | null;
        if (!data) continue;
        if (data.name === 'snapshot') {
            const parsed = toolResultSchemas.snapshot.safeParse(data.result);
            if (parsed.success) observed.push(...parsed.data.controls);
        } else if (data.name === 'query') {
            const parsed = toolResultSchemas.query.safeParse(data.result);
            if (parsed.success) observed.push(...parsed.data.matches);
        } else if (data.name === 'act') {
            const command = toolInputSchemas.act.safeParse(data.arguments);
            const result = toolResultSchemas.act.safeParse(data.result);
            if (!command.success || !result.success) continue;
            const { before, after, status } = result.data;
            if (!before || command.data.id !== before.id) continue;
            if (status === 'refused') observed.push(before);
            if (
                status === 'canceled' &&
                before.kind === 'input' &&
                before.name === 'Project name' &&
                command.data.action === 'set-value' &&
                command.data.value === 'Agent workspace' &&
                after?.id === before.id &&
                after.value === before.value
            )
                cancellations.push({ id: before.id, value: before.value });
        }
    }
    if (name === 'canceled')
        return {
            observed: cancellations.length > 0,
            confirmed: cancellations.some((entry) =>
                run.finalSnapshot?.controls.some((control) => control.id === entry.id && control.value === entry.value)
            )
        };
    const targets = name === 'archived' ? ['Visibility'] : ['Project name', 'Visibility'];
    return {
        observed: targets.every((target) =>
            observed.some((control) => control.name === target && hasConstraint(name, control))
        ),
        confirmed: targets.every(
            (target) =>
                run.finalSnapshot?.controls.some(
                    (control) => control.name === target && hasConstraint(name, control)
                ) === true
        )
    };
}
