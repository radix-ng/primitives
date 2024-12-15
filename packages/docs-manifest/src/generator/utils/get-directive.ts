import { type DeclarationReflection, ReferenceType } from 'typedoc';

import type {
    SkyManifestDirectiveDefinition,
    SkyManifestDirectiveInputDefinition,
    SkyManifestDirectiveOutputDefinition
} from '../../types/directive-def';
import type { DeclarationReflectionWithDecorators } from '../types/declaration-reflection-with-decorators';

import { getAnchorId } from './get-anchor-id';
import { getProperty } from './get-class';
import { getComment } from './get-comment';
import { getDecorator } from './get-decorator';
import { remapLambdaName } from './remap-lambda-names';

export function isInput(reflection: DeclarationReflectionWithDecorators): boolean {
    return (
        getDecorator(reflection) === 'Input' ||
        (reflection.type instanceof ReferenceType && reflection.type?.name === 'InputSignal')
    );
}

export function isOutput(reflection: DeclarationReflectionWithDecorators): boolean {
    return (
        getDecorator(reflection) === 'Output' ||
        (reflection.type instanceof ReferenceType && reflection.type?.name === 'OutputEmitterRef')
    );
}

function getInput(reflection: DeclarationReflectionWithDecorators): SkyManifestDirectiveInputDefinition | undefined {
    const property = getProperty(reflection);
    const { isRequired } = getComment(reflection);

    const input: SkyManifestDirectiveInputDefinition = {
        ...property,
        kind: 'directive-input',
        isRequired
    };

    return input;
}

function getInputs(reflection: DeclarationReflectionWithDecorators): SkyManifestDirectiveInputDefinition[] | undefined {
    const inputs: SkyManifestDirectiveInputDefinition[] = [];

    if (reflection.children) {
        for (const child of reflection.children) {
            if (isInput(child)) {
                const input = getInput(child);

                if (input) {
                    inputs.push(input);
                    console.log(inputs);
                }
            }
        }
    }

    return inputs.length > 0 ? inputs : undefined;
}

function getOutput(reflection: DeclarationReflection): SkyManifestDirectiveOutputDefinition | undefined {
    const property = getProperty(reflection);
    const output: SkyManifestDirectiveOutputDefinition = {
        ...property,
        kind: 'directive-output'
    };

    return output;
}

function getOutputs(reflection: DeclarationReflection): SkyManifestDirectiveOutputDefinition[] | undefined {
    const outputs: SkyManifestDirectiveOutputDefinition[] = [];

    if (reflection.children) {
        for (const child of reflection.children) {
            if (isOutput(child)) {
                const output = getOutput(child);

                if (output) {
                    outputs.push(output);
                }
            }
        }
    }

    return outputs.length > 0 ? outputs : undefined;
}

function getSelector(reflection: DeclarationReflectionWithDecorators): string | undefined {
    return reflection.decorators?.[0]?.arguments?.['selector'];
}

export function getDirective(
    reflection: DeclarationReflectionWithDecorators,
    kind: 'component' | 'directive',
    filePath: string
): SkyManifestDirectiveDefinition {
    const { codeExample, codeExampleLanguage, deprecationReason, description, isDeprecated, isInternal, isPreview } =
        getComment(reflection);

    const directiveName = remapLambdaName(reflection);
    const inputs = getInputs(reflection) ?? [];
    const outputs = getOutputs(reflection) ?? [];
    const children = [...inputs, ...outputs];

    const directive: SkyManifestDirectiveDefinition = {
        anchorId: getAnchorId(directiveName, reflection.kind),
        children: children.length > 0 ? children : undefined,
        codeExample,
        codeExampleLanguage,
        deprecationReason,
        description,
        filePath,
        isDeprecated,
        isInternal,
        isPreview,
        kind,
        name: directiveName,
        selector: getSelector(reflection)
    };

    return directive;
}
