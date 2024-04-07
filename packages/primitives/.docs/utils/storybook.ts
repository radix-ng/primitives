/**
 * Targets strings which start with underscore or with 'ng'. E.g. _internalStuff or ngOnInit.
 *
 * This has been set as default value for Storybook stories controls in preview.js
 * If you need to append the list, just provide a string[] with list of props to exclude.
 */

export const excludeRegex = (array?: string[]): RegExp => {
    const joined: string | null = array ? array.join('|') : null;

    const joinedWithRegexOr: string = `|^(${joined})$`;

    const regex = new RegExp(`(^(?:_|ng)[a-zA-Z0-9]\\w+)${joinedWithRegexOr}`);

    return regex;
};

export const separatorExclude: RegExp = excludeRegex([
    'fragmentId',
    'handleClick',
    'handleBlur',
    'handleFocus',
    'link'
]);
