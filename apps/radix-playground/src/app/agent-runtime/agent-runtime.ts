import { ApplicationRef, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { commandEnvelopeSchema, toolInputSchemas } from './protocol';
import {
    ActionName,
    ActResult,
    AgentRuntimeApi,
    ControlQuery,
    ControlRegistration,
    ControlSnapshot,
    QueryResult,
    RuntimeLog,
    RuntimeSnapshot
} from './types';

@Injectable({ providedIn: 'root' })
export class AgentRuntime implements AgentRuntimeApi {
    private readonly app = inject(ApplicationRef);
    private readonly registrations = signal<ReadonlyMap<string, ControlRegistration>>(new Map());
    private nextId = 0;
    private logSequence = 0;
    private readonly log = signal<readonly RuntimeLog[]>([]);
    readonly journal = this.log.asReadonly();
    readonly pending = signal(false);
    readonly api: AgentRuntimeApi = Object.freeze({
        snapshot: (parameters?: unknown) => this.snapshot(parameters),
        query: (query: unknown) => this.query(query),
        act: (command: unknown) => this.act(command)
    });

    register(registration: ControlRegistration, owner: DestroyRef): string {
        const id = `agent-control-${++this.nextId}`;
        this.registrations.update((entries) => new Map(entries).set(id, registration));
        owner.onDestroy(() =>
            this.registrations.update((entries) => {
                const next = new Map(entries);
                next.delete(id);
                return next;
            })
        );
        return id;
    }

    private read(id: string, registration: ControlRegistration): ControlSnapshot {
        return structuredClone({
            ...registration.read(),
            id,
            actions: Object.keys(registration.actions) as ActionName[]
        });
    }

    snapshot(parameters: unknown = {}): RuntimeSnapshot {
        if (!toolInputSchemas.snapshot.safeParse(parameters).success)
            throw new TypeError('snapshot accepts only an empty argument object.');
        return { controls: [...this.registrations()].map(([id, entry]) => this.read(id, entry)) };
    }

    query(query: unknown): QueryResult {
        const parsed = toolInputSchemas.query.safeParse(query);
        if (!parsed.success) {
            return { status: 'invalid-query', matches: [] };
        }
        const filter: ControlQuery = parsed.data;
        const matches = this.snapshot().controls.filter(
            (control) =>
                (filter.id === undefined || control.id === filter.id) &&
                (filter.kind === undefined || control.kind === filter.kind) &&
                (filter.name === undefined || control.name === filter.name)
        );
        return { status: matches.length === 0 ? 'not-found' : matches.length === 1 ? 'matched' : 'ambiguous', matches };
    }

    recordEvent(detail: unknown): void {
        this.append('event', detail);
    }
    clearJournal(): void {
        this.log.set([]);
    }
    private append(type: RuntimeLog['type'], detail: unknown): void {
        this.log.update((entries) => [
            ...entries.slice(-199),
            { sequence: ++this.logSequence, type, detail: structuredClone(detail) }
        ]);
    }

    async act(input: unknown): Promise<ActResult> {
        const finish = (result: ActResult) => {
            this.append('result', result);
            return result;
        };
        const refuse = (code: string, message: string, before?: ControlSnapshot) =>
            finish({ status: 'refused', code, message, ...(before ? { before, after: before } : {}) });
        const parsed = commandEnvelopeSchema.safeParse(input);
        if (!parsed.success) return refuse('invalid-command', 'Expected an id, an action and optional value.');
        const command = parsed.data;
        this.append('command', {
            id: command['id'],
            action: command['action'],
            ...('value' in command
                ? { value: typeof command['value'] === 'string' ? command['value'] : '[invalid argument]' }
                : {})
        });
        const id = command['id'];
        const entry = this.registrations().get(id);
        if (!entry) return refuse('unknown-id', 'This instance is not registered (or has been destroyed).');
        const before = this.read(id, entry);
        const action = Object.hasOwn(entry.actions, command['action'])
            ? entry.actions[command['action'] as ActionName]
            : undefined;
        if (!action) return refuse('unsupported-action', 'This instance does not expose that action.', before);
        if (
            (action.argument === 'value' && typeof command['value'] !== 'string') ||
            (action.argument === 'none' && 'value' in command)
        )
            return refuse(
                'invalid-arguments',
                'This action requires ' + (action.argument === 'value' ? 'a string value.' : 'no value argument.'),
                before
            );
        const value = command['value'] as string | undefined;
        const invalid = value === undefined ? undefined : action.validate?.(value);
        if (invalid) return refuse('invalid-arguments', invalid, before);
        if (!before.available) return refuse('unavailable', 'This control is not currently available.', before);
        if (before.disabled && !action.allowDisabled) return refuse('disabled', 'This control is disabled.', before);
        if (before.readOnly && action.requiresEditable)
            return refuse('read-only', 'This control is read-only.', before);
        if (this.pending()) return refuse('busy', 'Wait for the pending command to settle.', before);
        this.pending.set(true);
        try {
            const outcome = action.run(value);
            await this.app.whenStable();
            if (this.registrations().get(id) !== entry)
                return refuse('destroyed', 'The instance was destroyed while the command settled.');
            const after = this.read(id, entry);
            const status =
                outcome === 'canceled'
                    ? 'canceled'
                    : JSON.stringify(before) === JSON.stringify(after)
                      ? 'unchanged'
                      : 'applied';
            return finish({
                status,
                message:
                    status === 'canceled'
                        ? 'The primitive callback canceled the change.'
                        : status === 'unchanged'
                          ? 'The state was already unchanged.'
                          : 'The returned state reflects the applied change.',
                before,
                after
            });
        } catch (error) {
            return finish({
                status: 'refused',
                code: 'action-error',
                message: String(error),
                before,
                after: this.registrations().get(id) === entry ? this.read(id, entry) : undefined
            });
        } finally {
            this.pending.set(false);
        }
    }
}
