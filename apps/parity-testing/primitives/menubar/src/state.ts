export const stateCases = [
    'state-default-open',
    'state-default-open-rtl',
    'state-default-open-vertical',
    'state-controlled-initial-open',
    'state-controlled-external-open',
    'state-controlled-switch',
    'state-controlled-cancel-open',
    'state-controlled-cancel-close'
] as const;

export function initialOpenState(name: string) {
    return { file: name === 'state-controlled-initial-open', blocked: false, edit: false, new: false };
}

/** Native application commands update external input state, not primitive internals. */
export function changeExternalOpen(state: ReturnType<typeof initialOpenState>, key: string) {
    if (key === 'F6') return { ...state, file: !state.file };
    if (key === 'F7') return { ...state, edit: !state.edit };
    return { file: false, blocked: false, edit: false, new: false };
}
