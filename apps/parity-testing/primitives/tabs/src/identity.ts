import type { Settings, Value } from './contract';

export type IdentityKind =
    | 'retained'
    | 'absent-panel'
    | 'absent-tab'
    | 'tab-id'
    | 'panel-id'
    | 'replace'
    | 'shadowed'
    | 'owner-remove'
    | 'insert-owner'
    | 'panel-value'
    | 'tab-value'
    | 'roots'
    | 'mixed-values'
    | 'presence'
    | 'indicator';
export interface IdentityPart {
    key: string;
    value: Value;
    id?: string;
}
const fixture = (identity: IdentityKind): Settings => ({ options: [], identity });
export const identityCases = {
    'identity-retained': fixture('retained'),
    'identity-absent-panel': fixture('absent-panel'),
    'identity-absent-tab': fixture('absent-tab'),
    'identity-custom-tab-id': fixture('tab-id'),
    'identity-custom-panel-id': fixture('panel-id'),
    'identity-panel-replacement': fixture('replace'),
    'identity-shadowed-cleanup': fixture('shadowed'),
    'identity-owner-removal': fixture('owner-remove'),
    'identity-insert-owner': fixture('insert-owner'),
    'identity-panel-value': fixture('panel-value'),
    'identity-tab-value': fixture('tab-value'),
    'identity-two-roots': fixture('roots'),
    'identity-mixed-value-types': fixture('mixed-values'),
    'identity-presence': fixture('presence'),
    'identity-indicator-custom-tab': fixture('indicator')
};
export type IdentityCaseName = keyof typeof identityCases;
export function identityParts(kind: IdentityKind): { tabs: IdentityPart[]; panels: IdentityPart[] } {
    const tabs: IdentityPart[] = [
        { key: 'zero', value: 0 },
        { key: 'one', value: 1 }
    ];
    let panels: IdentityPart[] = tabs.map((part) => ({ ...part }));
    if (kind === 'absent-panel') panels = panels.slice(0, 1);
    if (kind === 'absent-tab') tabs.pop();
    if (kind === 'tab-id' || kind === 'indicator') tabs[0].id = 'authored-tab';
    if (kind === 'panel-id') panels[0].id = 'authored-panel';
    if (kind === 'shadowed' || kind === 'owner-remove')
        panels = [panels[0], { key: 'shadowed', value: 1 }, { key: 'owner', value: 1 }];
    if (kind === 'insert-owner') panels = [panels[0], { key: 'owner', value: 1 }];
    if (kind === 'panel-value') tabs.push({ key: 'two', value: 2 });
    if (kind === 'tab-value') panels.push({ key: 'two', value: 2 });
    if (kind === 'mixed-values') {
        tabs[0].value = 1;
        tabs[1].value = '1';
        panels = tabs.map((part) => ({ ...part }));
    }
    return { tabs, panels };
}
export function identityCommand(kind: IdentityKind, key: string, tabs: IdentityPart[], panels: IdentityPart[]) {
    if (key === 'F2') {
        if (kind === 'retained') panels = panels.filter((part) => part.key !== 'one');
        if (kind === 'absent-panel') panels = [...panels, { key: 'one', value: 1 }];
        if (kind === 'absent-tab') tabs = [];
        if (kind === 'tab-id' || kind === 'indicator')
            tabs = tabs.map((part) => (part.key === 'zero' ? { ...part, id: 'renamed-tab' } : part));
        if (kind === 'panel-id')
            panels = panels.map((part) => (part.key === 'zero' ? { ...part, id: 'renamed-panel' } : part));
        if (kind === 'replace')
            panels = panels.map((part) => (part.key === 'one' ? { key: 'replacement', value: part.value } : part));
        if (kind === 'shadowed') panels = panels.filter((part) => part.key !== 'shadowed');
        if (kind === 'owner-remove') panels = panels.filter((part) => part.key !== 'owner');
        if (kind === 'insert-owner') panels = [panels[0], { key: 'new-owner', value: 1 }, ...panels.slice(1)];
        if (kind === 'panel-value') panels = panels.map((part) => (part.key === 'one' ? { ...part, value: 2 } : part));
        if (kind === 'tab-value') tabs = tabs.map((part) => (part.key === 'one' ? { ...part, value: 2 } : part));
    }
    if (key === 'F3') {
        if (kind === 'retained') panels = [...panels, { key: 'one', value: 1 }];
        if (kind === 'tab-id' || kind === 'indicator') tabs = tabs.map((part) => ({ ...part, id: undefined }));
        if (kind === 'panel-id') panels = panels.map((part) => ({ ...part, id: undefined }));
        if (kind === 'insert-owner') panels = panels.filter((part) => part.key !== 'owner');
    }
    return { tabs, panels };
}
