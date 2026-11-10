/** Application data shared by the fixtures. No primitive state, DOM or framework lifecycle here. */
export interface MenuEntry<Id extends string = string> {
    id: Id;
    label: string;
    disabled: boolean;
}
export const collectionCases = [
    'collection-insert',
    'collection-remove',
    'collection-reorder',
    'collection-disable',
    'collection-label'
] as const;
export const menuEntries: MenuEntry[] = [
    { id: 'alpha', label: 'Alpha', disabled: false },
    { id: 'blocked', label: 'Blocked', disabled: true },
    { id: 'bravo', label: 'Bravo', disabled: false }
];
export function changeCollection<Id extends string>(
    entries: MenuEntry<Id>[],
    name: string,
    inserted: MenuEntry<Id>,
    target?: Id
): MenuEntry<Id>[] {
    const first = target ?? entries[0]?.id;
    switch (name) {
        case 'collection-insert':
            return [inserted, ...entries];
        case 'collection-remove':
            return entries.filter((entry) => entry.id !== first);
        case 'collection-reorder':
            return [...entries].reverse();
        case 'collection-disable':
            return entries.map((entry) => (entry.id === first ? { ...entry, disabled: true } : entry));
        case 'collection-label':
            return entries.map((entry) => (entry.id === first ? { ...entry, label: 'Zulu' } : entry));
        default:
            throw new Error(`Unknown collection command: ${name}`);
    }
}
