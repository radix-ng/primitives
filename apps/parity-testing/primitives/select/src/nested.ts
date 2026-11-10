export const nestedNames = [
    'nested-dialog',
    'nested-popover',
    'nested-dialog-modal-select',
    'nested-popover-modal-select',
    'nested-dialog-custom-portal',
    'nested-popover-custom-portal'
] as const;
export type NestedName = (typeof nestedNames)[number];
export function nestedConfig(name: string) {
    return nestedNames.includes(name as NestedName)
        ? {
              kind: name.startsWith('nested-dialog') ? ('dialog' as const) : ('popover' as const),
              modalSelect: name.includes('-modal-select'),
              customPortal: name.endsWith('-custom-portal')
          }
        : undefined;
}
export const shellStyles = {
    trigger: 'border-border bg-background rounded border px-4 py-2',
    dialog: 'bg-popover text-popover-foreground border-border fixed left-1/2 top-1/2 z-40 grid w-96 -translate-x-1/2 -translate-y-1/2 gap-3 rounded border p-6',
    popover: 'bg-popover text-popover-foreground border-border grid w-96 gap-3 rounded border p-6'
};
