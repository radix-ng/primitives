import apiPrimitives from '../api-doc/primitives.json';

export const getComponentData = (componentName: string) => {
    for (const key in apiPrimitives) {
        const components = apiPrimitives[key].components;
        if (componentName in components) {
            return components[componentName];
        }
    }
    return null;
};
