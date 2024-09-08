export type RdxDialogState = 'open' | 'closed';

export function getState(open: boolean): RdxDialogState {
    return open ? 'open' : 'closed';
}
