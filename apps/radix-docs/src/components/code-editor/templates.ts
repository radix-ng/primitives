import {
    angular_json,
    dependencies,
    devDependencies,
    fontsCss,
    index_html,
    main_ts,
    tsconfig_app_json,
    tsconfig_json
} from '@/components/code-editor/example-app';
import { stylesCss } from '@/components/code-editor/example-app/styles-css.ts';
import type { Props } from '@/components/code-editor/types.ts';

export const getAngularApp = (props: Props = {}) => {
    const { code, selector, css } = props;

    const componentName = getExportedComponentName(code);
    const componentSelector = getComponentSelector(code);

    const defaultFiles = {
        'src/index.html': { content: index_html(componentName, componentSelector) },
        'src/main.ts': { content: main_ts(componentName, selector) },
        'src/styles.css': { content: stylesCss },
        'src/fonts.css': { content: fontsCss },
        'tsconfig.json': { content: tsconfig_json },
        'tsconfig.app.json': { content: tsconfig_app_json },
        'angular.json': { content: angular_json }
    };

    const files = {
        'package.json': {
            content: {
                name: `radix-ng-${selector}`,
                description: `RadixNG ${selector}`,
                license: 'MIT',
                keywords: [],
                scripts: {
                    ng: 'ng',
                    start: 'ng serve',
                    build: 'ng build'
                },
                dependencies: {
                    ...dependencies
                },
                devDependencies: {
                    ...devDependencies
                }
            }
        },

        [`src/app/${selector}.ts`]: { content: code.trim() },
        [`src/app/${selector}-demo.css`]: { content: css.trim() },

        ...defaultFiles
    };

    return { files, title: `RadixNG ${componentName}` };
};

const getExportedComponentName = (fileContent: string): string | null => {
    const exportClassRegex = /export\s+class\s+(\w+)\s+/;
    const match = fileContent.match(exportClassRegex);

    return match ? match[1] : null;
};

const getComponentSelector = (fileContent: string): string | null => {
    const selectorRegex = /@Component\(\s*\{\s*selector:\s*['"`](.*?)['"`]/;
    const match = fileContent.match(selectorRegex);

    return match ? match[1] : null;
};
