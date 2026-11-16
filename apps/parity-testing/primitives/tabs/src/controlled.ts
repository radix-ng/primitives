import type { Settings } from './contract';

export interface ControlledSettings {
    policy: 'ignore' | 'accept' | 'delay' | 'replace' | 'null' | 'cancel';
    automatic?: boolean;
    kind?: 'number' | 'object' | 'function';
    initial?: 'null' | 'missing';
    disabled?: boolean;
    presence?: boolean;
    orientation?: 'horizontal' | 'vertical';
    dir?: 'ltr' | 'rtl';
}
const fixture = (controlled: ControlledSettings): Settings => ({ options: [], controlled });
export const controlledCases = {
    'controlled-ignore': fixture({ policy: 'ignore' }),
    'controlled-accept': fixture({ policy: 'accept' }),
    'controlled-delay': fixture({ policy: 'delay' }),
    'controlled-replace': fixture({ policy: 'replace' }),
    'controlled-null-response': fixture({ policy: 'null' }),
    'controlled-cancel': fixture({ policy: 'cancel' }),
    'controlled-ignore-automatic': fixture({ policy: 'ignore', automatic: true }),
    'controlled-delay-automatic': fixture({ policy: 'delay', automatic: true }),
    'controlled-replace-automatic': fixture({ policy: 'replace', automatic: true }),
    'controlled-ignore-rtl': fixture({ policy: 'ignore', dir: 'rtl' }),
    'controlled-delay-vertical': fixture({ policy: 'delay', orientation: 'vertical' }),
    'controlled-replace-vertical-rtl': fixture({ policy: 'replace', orientation: 'vertical', dir: 'rtl' }),
    'controlled-objects-ignore': fixture({ policy: 'ignore', kind: 'object' }),
    'controlled-objects-replace': fixture({ policy: 'replace', kind: 'object' }),
    'controlled-functions-delay': fixture({ policy: 'delay', kind: 'function' }),
    'controlled-null-input-ignore': fixture({ policy: 'ignore', initial: 'null' }),
    'controlled-missing-input-ignore': fixture({ policy: 'ignore', initial: 'missing' }),
    'controlled-disabled-input-ignore': fixture({ policy: 'ignore', disabled: true }),
    'controlled-presence-ignore': fixture({ policy: 'ignore', presence: true }),
    'controlled-presence-delay': fixture({ policy: 'delay', presence: true })
};
export type ControlledCaseName = keyof typeof controlledCases;

export function controlledCatalog(settings: ControlledSettings) {
    let calls = 0;
    const fn = () => {
        calls++;
        return 'executed';
    };
    const values: unknown[] =
        settings.kind === 'object'
            ? [{ id: 1 }, { id: 1 }, { id: 1 }]
            : settings.kind === 'function'
              ? [fn.bind(null), fn.bind(null), fn.bind(null)]
              : [0, 1, 2];
    const initial = settings.initial === 'null' ? null : settings.initial === 'missing' ? 99 : values[0];
    const encode = (value: unknown) =>
        value === null
            ? 'null'
            : values.findIndex((candidate) => Object.is(candidate, value)) === -1
              ? 'missing'
              : String(values.findIndex((candidate) => Object.is(candidate, value)));
    return { values, initial, encode, calls: () => calls };
}

export interface ControlledProbe {
    catalog: ReturnType<typeof controlledCatalog>;
    parent: () => unknown;
    outputs: unknown[];
}
declare global {
    interface Window {
        tabsControlled: ControlledProbe;
    }
}
