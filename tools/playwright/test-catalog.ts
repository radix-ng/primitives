const names = [
    'floating-consumers',
    'popper',
    'popover',
    'tooltip',
    'preview-card',
    'menu',
    'menu-submenu',
    'context-menu',
    'menubar',
    'navigation-menu',
    'combobox',
    'autocomplete',
    'toast',
    'dialog',
    'drawer',
    'alert-dialog'
];
export const floatingTestMatch = ['**/select*.behavior.spec.ts', ...names.map((name) => `**/${name}.behavior.spec.ts`)];
export const floatingConsumers = new Set([
    'popover',
    'menu',
    'tooltip',
    'preview-card',
    'combobox',
    'autocomplete',
    'navigation-menu',
    'toast'
]);
export const specFamily = (file: string) => {
    const name = file.split('/').at(-1)!.replace('.behavior.spec.ts', '');
    return name.startsWith('select') ? 'select' : name === 'menu-submenu' ? 'menu' : name;
};
export const isFloatingSpec = (file: string) =>
    file.endsWith('.behavior.spec.ts') &&
    (file.split('/').at(-1)!.startsWith('select') ||
        names.includes(file.split('/').at(-1)!.replace('.behavior.spec.ts', '')));
