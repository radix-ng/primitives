import type { CompodocDirective } from '../types/compodocDocumentation.ts';

import documentation from '../../../../dist/primitives/compodoc/documentation.json';

const createComponentMarkdown = (entity: CompodocDirective) => {
    const { name = '', rawdescription = '', inputsClass = [], outputsClass = [], exampleUrls = [] } = entity;
};

console.log(documentation);
documentation.directives.forEach((directive) => {
    // @ts-ignore
    return createComponentMarkdown(directive);
});

export default {};
