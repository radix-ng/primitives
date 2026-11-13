export const dialogMenuCases = [
    'dialog-menu-escape',
    'dialog-menu-outside',
    'dialog-menu-outside-nonmodal',
    'dialog-menu-outside-all',
    'dialog-menu-select',
    'dialog-menu-tab',
    'dialog-menu-shift-tab',
    'dialog-menu-submenu',
    'dialog-menu-submenu-retained',
    'dialog-menu-cancel',
    'dialog-menu-retained',
    'dialog-menu-deferred',
    'dialog-menu-remove',
    'dialog-menu-remove-retained',
    'dialog-menu-remove-submenu',
    'dialog-menu-remove-exit',
    'dialog-menu-remove-deferred',
    'dialog-menu-close-parent'
] as const;

export function dialogMenuConfig(name: string) {
    if (!dialogMenuCases.includes(name as (typeof dialogMenuCases)[number])) return undefined;
    return {
        nested: name.includes('submenu'),
        retained: name.includes('retained'),
        deferred: name.includes('deferred'),
        animated: name.endsWith('-exit'),
        canceled: name === 'dialog-menu-cancel',
        modal: !name.endsWith('-nonmodal')
    };
}

export { createOverlayProbe as createDialogProbe, type OverlayProbe as DialogProbe } from './overlay-probe';

export const dialogClass =
    'fixed start-24 top-16 z-10 grid w-[480px] gap-3 rounded border border-border bg-popover p-6 text-popover-foreground shadow-md outline-none';
