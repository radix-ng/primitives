/* istanbul ignore file */

/**
 * This plugin is based on a suggestion from a Typedoc maintainer at
 * https://github.com/TypeStrong/typedoc/issues/2346#issuecomment-1656806051.
 */
import { Converter, TypeScript as ts } from 'typedoc';

function addDecoratorInfo(context, decl) {
    const symbol = context.project.getSymbolFromReflection(decl);

    if (!symbol) {
        return;
    }

    const declaration = symbol.valueDeclaration;

    if (!declaration) {
        return;
    }

    if (
        !ts.isPropertyDeclaration(declaration) &&
        !ts.isMethodDeclaration(declaration) &&
        !ts.isClassDeclaration(declaration) &&
        !ts.isAccessor(declaration)
    ) {
        return;
    }

    let decorators = [];

    const modifiers = declaration.modifiers ?? [];

    for (const modifier of modifiers) {
        const expression = modifier.expression?.expression;

        if (expression) {
            const decoratorName = expression.escapedText;

            if (![
                    'Component',
                    'Directive',
                    'Injectable',
                    'Input',
                    'NgModule',
                    'Output',
                    'Pipe'
                ].includes(decoratorName)) {
                continue;
            }

            const decorator = {
                name: decoratorName
            };

            const args = modifier.expression?.arguments[0];

            if (args) {
                switch (decorator.name) {
                    case 'Component':
                    case 'Directive':
                        // eslint-disable-next-line no-case-declarations
                        const selector = args.symbol.members.get('selector')?.valueDeclaration.initializer.text ?? '';
                        // eslint-disable-next-line no-case-declarations
                        const hostMember = args.symbol.members.get('host');
                        let host = null;

                        if (hostMember?.valueDeclaration?.initializer) {
                            const initializer = hostMember.valueDeclaration.initializer;

                            if (ts.isObjectLiteralExpression(initializer)) {
                                host = {};
                            }
                        }

                        decorator.arguments = {
                            selector,
                            host
                        };

                        break;

                    case 'Pipe':
                        decorator.arguments = {
                            name: args.symbol.members.get('name').valueDeclaration.initializer.text
                        };
                        break;

                    case 'Input':
                        if (args.text) {
                            decorator.arguments = {
                                bindingPropertyName: args.text
                            };
                        }
                        break;
                }
            }

            decorators.push(decorator);
        }
    }

    decl.decorators = decorators;
}

export function load(app) {
    // Add decorator info to reflections.
    app.converter.on(Converter.EVENT_CREATE_DECLARATION, addDecoratorInfo);

    // Add decorator info to serialized JSON.
    app.serializer.addSerializer({
        priority: 0,
        supports() {
            return true;
        },
        toObject(item, obj) {
            if (item.decorators) {
                obj.decorators = item.decorators;
            }

            return obj;
        }
    });
}
