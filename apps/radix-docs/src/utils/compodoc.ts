import type { CompodocDirective } from '../types/compodocDocumentation.ts';

import documentation from '../../../../dist/primitives/compodoc/documentation.json';

const directivesMap: Record<string, CompodocDirective> = {};

documentation.directives.forEach((directive: any) => {
    directivesMap[directive.name] = directive as CompodocDirective;
});

const getDirectiveByName = (name: string): CompodocDirective | undefined => {
    return directivesMap[name];
};

export { directivesMap, getDirectiveByName };
