const extractParameter = (emitter) => {
    let { type } = emitter;

    if (type && type.typeArguments) {
        if (type.toString()) {
            return type.toString().replace(/^.*?<([^>]*)>.*$/, '$1');
        } else {
            if (!type.typeArguments[0].types && !type.typeArguments[0].type) {
                return type.typeArguments.map((el) => ({
                    name: el.name.includes('Event') ? 'event' : 'value',
                    type: el.name.replace(/[^a-zA-Z]/g, '')
                }));
            }

            if (type.typeArguments[0].types) {
                return type.typeArguments[0].types.map((el) => {
                    if (el.type && el.type === 'array') {
                        return { name: 'value', type: el.elementType.name + '[]' };
                    } else {
                        return {
                            name: el.name.includes('Event') ? 'event' : 'value',
                            type: el.name.replace(/[^a-zA-Z]/g, '')
                        };
                    }
                });
            }
        }
    }
};

const isProcessable = (value) => {
    return value && value.children && value.children.length;
};

const getTypesValue = (typeobj) => {
    let { type } = typeobj;

    if (typeobj.indexSignature) {
        const signature = typeobj.getAllSignatures()[0];
        const value = signature.parameters.map((param) => {
            return {
                [`[${param.name}:${param.type.toString()}]`]: signature.type.toString()
            };
        })[0];

        return JSON.stringify(value);
    }

    if (type) {
        if (type.type === 'union') {
            return type.toString();
        }
        if (type.type === 'reflection' && type.declaration) {
            let values = type.declaration.children.map((child) => ({
                [child.name]: child.type.toString()
            }));

            return JSON.stringify(Object.assign({}, ...values), null, 4);
        }
    }
};

const parseText = (text) => {
    return text.replace(/&#123;/g, '{').replace(/&#125;/g, '}');
};

const getDeprecatedText = (signature) => {
    const deprecatedTag = signature?.comment?.getTag('@deprecated');
    return deprecatedTag ? parseText(deprecatedTag.content[0].text) : undefined;
};

const parameters = (template) => {
    const _parameters = [];
    if (template.comment && template.comment.blockTags) {
        template.comment.blockTags.forEach((tag) => {
            if (tag.tag === '@param') {
                let type = 'unknown';
                if (template.type && template.type.typeArguments) {
                    const typeArg = template.type.typeArguments.find(
                        (arg) => arg.declaration && arg.declaration.children
                    );
                    if (typeArg) {
                        const paramType = typeArg.declaration.children.find((child) => child.name === tag.name);
                        if (paramType && paramType.type) {
                            type = paramType.type.name;
                        }
                    }
                }
                _parameters.push({
                    name: tag.name,
                    description: tag.content.map((c) => c.text).join(' '),
                    type: type
                });
            }
        });
    }

    return _parameters;
};

/**
 *
 * @param {Object} comment
 * @returns {string}
 */
const getCommentSummary = (comment) => {
    if (!comment?.summary) return '';
    return comment.summary.map((s) => s.text || '').join(' ');
};

const getGroupByTitle = (reflection, title) => {
    return reflection.groups?.find((g) => g.title === title);
};

export {
    extractParameter,
    getCommentSummary,
    getDeprecatedText,
    getGroupByTitle,
    getTypesValue,
    isProcessable,
    parameters,
    parseText
};
