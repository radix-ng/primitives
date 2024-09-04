import type { CompodocComponent, CompodocDirective } from '../types/compodocDocumentation.ts';

import documentationComponents from '../../../../dist/components/compodoc/documentation.json';
import documentationPrimitives from '../../../../dist/primitives/compodoc/documentation.json';

const directivesMap: Record<string, CompodocDirective> = {};
const componentsComponentsMap: Record<string, CompodocComponent> = {};

documentationPrimitives.directives.forEach((directive: any) => {
    directivesMap[directive.name] = directive as CompodocDirective;
});

const getDirectiveByName = (name: string): CompodocDirective | undefined => {
    return directivesMap[name];
};

documentationComponents.components.forEach((component: any) => {
    componentsComponentsMap[component.name] = component as CompodocComponent;
});

const getComponentByName = (name: string): CompodocDirective | undefined => {
    return componentsComponentsMap[name];
};

export { directivesMap, getComponentByName, getDirectiveByName };
