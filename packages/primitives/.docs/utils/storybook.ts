/**
 * Targets strings which start with underscore or with 'ng'. E.g. _internalStuff or ngOnInit.
 *
 * This has been set as default value for Storybook stories controls in preview.js
 * If you need to append the list, just provide a string[] with list of props to exclude.
 */

export const excludeRegex = (array?: string[]): RegExp => {
    const joined: string | null = array ? array.join('|') : null;

    const joinedWithRegexOr = `|^(${joined})$`;

    return new RegExp(`(^(?:_|ng)[a-zA-Z0-9]\\w+)${joinedWithRegexOr}`);
};

export const separatorExclude: RegExp = excludeRegex([]);

export const toggleGroupButtonExclude = excludeRegex([
    'ngOnChanges',
    'updateDisabled',
    'toggle',
    'rovingFocusItem',
    'toggleGroup'
]);

export const toggleGroupExclude: RegExp = excludeRegex([
    'ngAfterContentInit',
    'registerOnChange',
    'registerOnTouched',
    'writeValue',
    'isSelected',
    'toggle',
    'setDisabledState',
    'buttons',
    'rovingFocusGroup',
    'onChange',
    'onTouched'
]);

export const labelExclude: RegExp = excludeRegex(['onMouseDown', 'htmlFor']);

export const switchExclude: RegExp = excludeRegex([
    'elementRef',
    'isButton',
    'onChange',
    'onTouched',
    'onKeyDown',
    'registerOnTouched',
    'registerOnChange',
    'setDisabledState',
    'writeValue'
]);
