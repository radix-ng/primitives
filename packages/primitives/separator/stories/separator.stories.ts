import { moduleMetadata } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxSeparatorRootDirective } from '../src/separator.directive';
import { SeparatorDefaultExample } from './separator-default';
import defaultSource from './separator-default?raw';
import { SeparatorHorizontalExample } from './separator-horizontal';
import horizontalSource from './separator-horizontal?raw';

const source = (code: string) => ({ docs: { source: { code: code.trim(), language: 'typescript', type: 'code' } } });

export default {
    component: RdxSeparatorRootDirective,
    title: 'Primitives/Separator',
    decorators: [
        moduleMetadata({
            imports: [SeparatorHorizontalExample, SeparatorDefaultExample, RdxSeparatorRootDirective]
        }),
        tailwindDemoDecorator()
    ]
};

export const Default = {
    parameters: source(defaultSource),
    render: () => ({ template: '<separator-default-example />' })
};

export const Horizontal = {
    parameters: source(horizontalSource),
    render: () => ({ template: '<separator-horizontal-example />' })
};
