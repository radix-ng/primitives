import { staticMessages } from '../constants.mjs';
import { getCommentSummary, getDeprecatedText } from '../utils.mjs';

/**
 *
 * @param {Array} propsChildren
 * @returns {{description: string, values: Array}}
 */
export const processComponentProps = (propsChildren) => {
    const props = {
        description: staticMessages['props'],
        values: []
    };

    propsChildren.forEach((prop) => {
        let defaultValue = prop.defaultValue ? prop.defaultValue.replace(/^'|'$/g, '') : undefined;

        const defaultValueTag = prop.comment?.blockTags?.find((tag) => tag.tag === '@defaultValue');
        if (defaultValueTag) {
            defaultValue = defaultValueTag.content?.map((c) => c.text.replace(/```ts\n|```/g, '').trim()).join(' ');
        }

        const isBooleanType = prop.type?.name === 'boolean';

        props.values.push({
            name: prop.name,
            optional: prop.flags?.isOptional,
            readonly: prop.flags?.isReadonly,
            type: prop.getSignature?.type?.toString() || prop.type?.toString() || null,
            default: isBooleanType && !prop.defaultValue ? 'false' : defaultValue,
            defaultValue: isBooleanType && !prop.defaultValue ? 'false' : defaultValue,
            description: getCommentSummary(prop.getSignature?.comment || prop.setSignature?.comment || prop.comment),
            deprecated:
                getDeprecatedText(prop.getSignature) || getDeprecatedText(prop.setSignature) || getDeprecatedText(prop)
        });
    });

    return props;
};
