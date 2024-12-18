import type { Props } from '@/components/code-editor/types.ts';

const dependencies = {
    '@angular/animations': '^18.0.0',
    '@angular/cdk': '~18.0.0',
    '@angular/cli': '^18.2.1',
    '@angular/common': '^18.0.1',
    '@angular/compiler': '^18.0.1',
    '@angular/core': '^18.0.1',
    '@angular/forms': '^18.0.1',
    '@angular/platform-browser': '^18.0.1',
    '@angular/platform-browser-dynamic': '^18.0.1',
    '@angular/router': '^18.0.1',
    '@radix-ng/primitives': '^0.22.0',
    rxjs: '~7.8.1',
    tslib: '^2.5.0',
    'zone.js': '~0.14.2'
};

const devDependencies = {
    '@angular-devkit/build-angular': '^18.0.2',
    '@angular/cli': '^18.0.1',
    '@angular/compiler-cli': '^18.0.1',
    '@angular/language-service': '^18.0.0',
    '@types/node': '^20',
    'ts-node': '~8.3.0',
    typescript: '~5.4.5'
};

export const getAngularApp = (props: Props = {}) => {
    const { code, selector } = props;

    const main_ts = `import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ApplicationConfig } from '@angular/core';

    export const appConfig: ApplicationConfig = {
      providers: [
      provideAnimationsAsync(),
    ],
  };

    bootstrapApplication(AppComponent, appConfig).catch((err) =>
    console.error(err)
);`;

    const defaultFiles = {
        'src/main.ts': { content: main_ts }
    };

    const files = {
        'package.json': {
            content: {
                name: `radix-ng-${selector}`,
                description: `RadixNG`,
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
        ...defaultFiles
    };

    return { files, title: `RadixNG ` };
};
