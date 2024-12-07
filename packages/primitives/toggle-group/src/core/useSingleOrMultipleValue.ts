import { computed, effect, EnvironmentInjector, runInInjectionContext, signal } from '@angular/core';
import { isEqual } from 'ohash';
import { isValueEqualOrExist } from './isValueEqualOrExist';
import { AcceptableValue, SingleOrMultipleProps } from './types';

export function useSingleOrMultipleValue(props: SingleOrMultipleProps, injector: EnvironmentInjector) {
    const type = signal(getDefaultType(props));
    const modelValue = signal<AcceptableValue | AcceptableValue[] | undefined>(
        props.modelValue ?? getDefaultValue(props)
    );

    runInInjectionContext(injector, () => {
        effect(() => {
            const validatedType = validateProps(props);
            if (type() !== validatedType) {
                type.set(validatedType);
            }
        });
    });

    function changeModelValue(value: AcceptableValue): void {
        if (type() === 'single') {
            modelValue.set(isEqual(value, modelValue()) ? undefined : value);
        } else {
            const modelValueArray = [...((modelValue() as AcceptableValue[]) || [])];
            if (isValueEqualOrExist(modelValueArray, value)) {
                const index = modelValueArray.findIndex((i) => isEqual(i, value));
                modelValueArray.splice(index, 1);
            } else {
                modelValueArray.push(value);
            }
            modelValue.set(modelValueArray);
        }
    }

    const isSingle = computed(() => type() === 'single');

    return {
        modelValue,
        type,
        changeModelValue,
        isSingle
    };
}

function getDefaultType(props: SingleOrMultipleProps): 'single' | 'multiple' {
    return validateProps(props);
}

function getDefaultValue(props: SingleOrMultipleProps): AcceptableValue | AcceptableValue[] | undefined {
    if (props.defaultValue !== undefined) {
        return props.defaultValue;
    }
    return props.type === 'single' ? undefined : [];
}

function validateProps({ type, defaultValue, modelValue }: SingleOrMultipleProps): 'single' | 'multiple' {
    const value = modelValue ?? defaultValue;

    if (modelValue !== undefined && defaultValue !== undefined && typeof modelValue !== typeof defaultValue) {
        throw new Error(
            `Invalid prop \`value\` of value \`${modelValue}\` supplied, should be the same type as the \`defaultValue\` prop, which is \`${defaultValue}\`.`
        );
    }

    const canTypeBeInferred = modelValue !== undefined || defaultValue !== undefined;
    if (type && canTypeBeInferred) {
        const isArray = Array.isArray(modelValue) || Array.isArray(defaultValue);
        if (type === 'single' && isArray) {
            console.error(`Invalid prop type supplied with type \`single\`. Value must be a string or \`undefined\`.`);
            return 'multiple';
        } else if (type === 'multiple' && !isArray) {
            console.error(
                `Invalid prop type supplied with type \`multiple\`. Value must be an array of strings or \`undefined\`.`
            );
            return 'single';
        }
    }

    if (canTypeBeInferred) {
        return Array.isArray(value) ? 'multiple' : 'single';
    }

    return type ?? 'single';
}
