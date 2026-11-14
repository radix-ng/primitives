export type ControlKind = 'input' | 'select' | 'dialog';
export type ActionName = 'set-value' | 'select-option' | 'open' | 'close';

export interface SelectOption {
    readonly value: string;
    readonly label: string;
    readonly disabled?: boolean;
}

export interface ControlSnapshot {
    readonly id: string;
    readonly kind: ControlKind;
    readonly name: string;
    readonly available: boolean;
    readonly disabled: boolean;
    readonly readOnly?: boolean;
    readonly value?: unknown;
    readonly open?: boolean;
    readonly options?: readonly SelectOption[];
    readonly actions: readonly ActionName[];
}

export interface RuntimeSnapshot {
    readonly controls: readonly ControlSnapshot[];
}
export interface ControlQuery {
    readonly id?: string;
    readonly kind?: ControlKind;
    readonly name?: string;
}
export interface QueryResult {
    readonly status: 'matched' | 'not-found' | 'ambiguous' | 'invalid-query';
    readonly matches: readonly ControlSnapshot[];
}
export interface RuntimeCommand {
    readonly id: string;
    readonly action: ActionName;
    readonly value?: string;
}
export interface ActResult {
    readonly status: 'applied' | 'unchanged' | 'canceled' | 'refused';
    readonly code?: string;
    readonly message: string;
    readonly before?: ControlSnapshot;
    readonly after?: ControlSnapshot;
}
export interface AgentRuntimeApi {
    snapshot(): RuntimeSnapshot;
    query(query: unknown): QueryResult;
    act(command: unknown): Promise<ActResult>;
}

export interface RegisteredAction {
    readonly argument: 'value' | 'none';
    readonly requiresEditable?: boolean;
    readonly allowDisabled?: boolean;
    readonly validate?: (value: string) => string | undefined;
    readonly run: (value: string | undefined) => 'executed' | 'canceled' | 'unchanged';
}
export interface ControlRegistration {
    readonly read: () => Omit<ControlSnapshot, 'id' | 'actions'>;
    readonly actions: Partial<Record<ActionName, RegisteredAction>>;
}
export interface RuntimeLog {
    readonly sequence: number;
    readonly type: 'command' | 'result' | 'event';
    readonly detail: unknown;
}
