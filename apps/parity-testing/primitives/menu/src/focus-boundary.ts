export const focusBoundaryCases = [
    'focus-cancel-child-parent-tab',
    'focus-cancel-child-shift-tab',
    'focus-cancel-parent-tab',
    'focus-cancel-both-tab',
    'focus-final-root-false-escape',
    'focus-final-root-target-escape',
    'focus-final-root-callback-escape',
    'focus-final-root-target-tab',
    'focus-final-root-callback-tab',
    'focus-final-child-false-escape',
    'focus-final-child-target-escape',
    'focus-final-child-callback-escape',
    'focus-final-child-target-parent-tab',
    'focus-final-child-callback-parent-tab',
    'focus-final-child-target-shift-tab',
    'focus-final-both-target-tab',
    'focus-final-child-target-fresh-escape',
    'focus-final-root-target-fresh-escape'
] as const;

export function focusBoundaryConfig(name: string) {
    if (!(focusBoundaryCases as readonly string[]).includes(name)) return undefined;
    const cancel = name.startsWith('focus-cancel-');
    const both = name.includes('-both-');
    const child = name.includes('-child-');
    const root = name.includes('-root-');
    const policy = name.includes('-false-') ? 'false' : name.includes('-callback-') ? 'callback' : 'target';
    return {
        retained: !name.includes('-fresh-'),
        nested: !root,
        parentControl: child && (name.includes('-parent-tab') || !cancel),
        cancelRoot: cancel && (both || (name.includes('-parent-tab') && !child)),
        cancelChild: cancel && (both || child),
        rootPolicy: !cancel && (root || both) ? policy : undefined,
        childPolicy: !cancel && (child || both) ? policy : undefined,
        key: name.endsWith('-escape') ? 'Escape' : name.endsWith('-shift-tab') ? 'Shift+Tab' : 'Tab'
    };
}
