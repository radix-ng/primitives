export const handleOverlapCases = [
    'handle-overlap-restore',
    'handle-overlap-remove-older',
    'handle-overlap-rebind',
    'handle-overlap-replace-trigger',
    'handle-overlap-detach-all',
    'handle-overlap-open-owner'
] as const;

// The probe's existing main/sub channels identify independent older/newer Roots here.
export const handleOwners = [
    { id: 'older', layer: 'main', popup: 'popup' },
    { id: 'newer', layer: 'sub', popup: 'sub-popup' }
] as const;
export type HandleOwner = (typeof handleOwners)[number];
