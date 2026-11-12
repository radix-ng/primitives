export const emptyCases = [
    'empty-open-enter',
    'empty-open-space',
    'empty-open-down',
    'empty-open-up',
    'empty-root-forward',
    'empty-root-backward',
    'empty-root-pointer',
    'empty-root-retained',
    'empty-sub-keyboard',
    'empty-sub-hover-forward',
    'empty-sub-hover-enter',
    'empty-sub-hover-forward-rtl',
    'empty-sub-retained',
    'empty-sub-close-refill'
] as const;

export function emptyConfig(name: string) {
    if (!(emptyCases as readonly string[]).includes(name)) return undefined;
    return {
        nested: name.startsWith('empty-sub-'),
        hover: name.includes('-hover-'),
        retained: name.endsWith('-retained'),
        openKey: name.endsWith('-space')
            ? 'Space'
            : name.endsWith('-up')
              ? 'ArrowUp'
              : name.endsWith('-down')
                ? 'ArrowDown'
                : 'Enter',
        backward: name.endsWith('-up') || name.endsWith('-backward'),
        pointer: ['empty-root-pointer', 'empty-root-forward', 'empty-root-backward'].includes(name)
    };
}
