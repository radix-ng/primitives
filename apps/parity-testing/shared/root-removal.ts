// Application-owned conditional rendering, shared by the three Menu-family fixtures.
export const rootRemovalCases = [
    'root-remove-open',
    'root-remove-nonmodal',
    'root-remove-nested',
    'root-remove-retained',
    'root-remove-exit',
    'root-remove-nested-exit',
    'root-remove-deferred',
    'root-remove-final-focus',
    'root-remove-missing-final-focus',
    'root-remove-hover-pending'
] as const;

export function rootRemovalConfig(name: string) {
    if (!(rootRemovalCases as readonly string[]).includes(name)) return undefined;
    return {
        modal: name !== 'root-remove-nonmodal',
        nested: name.includes('nested') || name.endsWith('hover-pending'),
        retained: name.endsWith('retained'),
        animated: name.endsWith('exit'),
        deferred: name.endsWith('deferred'),
        finalFocus: name.endsWith('final-focus'),
        missingFocus: name.includes('missing-final-focus'),
        hoverPending: name.endsWith('hover-pending')
    };
}

export { heldExitClass as rootRemovalExitClass } from './lifecycle.ts';

export function rootRemovalFinalFocus(): HTMLElement | null {
    return document.querySelector<HTMLElement>('[data-testid="before"]');
}
