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
    '@radix-ng/primitives': '^0.20.0',
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

const angular_json = `{
    "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
    "version": 1,
    "cli": {
      "analytics": false
    },
    "newProjectRoot": "projects",
    "projects": {
        "example-app": {
        "projectType": "application",
        "schematics": {
          "@schematics/angular:component": {
            "style": "css"
          },
          "@schematics/angular:application": {
            "strict": true
          }
        },
        "root": "",
        "sourceRoot": "src",
        "prefix": "app",
        "architect": {
          "build": {
            "builder": "@angular-devkit/build-angular:browser",
            "options": {
              "outputPath": "dist/example-app",
              "index": "src/index.html",
              "main": "src/main.ts",
              "polyfills": ["zone.js"],
              "tsConfig": "tsconfig.app.json",
              "inlineStyleLanguage": "css",
              "stylePreprocessorOptions": {
                "includePaths": ["node_modules/"]
              },
              "scripts": []
            },
            "configurations": {
              "production": {
                "budgets": [
                  {
                    "type": "initial",
                    "maximumWarning": "500kb",
                    "maximumError": "1mb"
                  },
                  {
                    "type": "anyComponentStyle",
                    "maximumWarning": "2kb",
                    "maximumError": "4kb"
                  }
                ],
                "outputHashing": "all"
              },
              "development": {
                "buildOptimizer": false,
                "optimization": false,
                "vendorChunk": true,
                "extractLicenses": false,
                "sourceMap": true,
                "namedChunks": true
              }
            },
            "defaultConfiguration": "production"
          },
          "serve": {
            "builder": "@angular-devkit/build-angular:dev-server",
            "configurations": {
              "production": {
                "buildTarget": "example-app:build:production"
              },
              "development": {
                "buildTarget": "example-app:build:development"
              }
            },
            "defaultConfiguration": "development"
          }
        }
      }
    }
}`;

const tsconfig_app_json = `{
    "extends": "./tsconfig.json",
    "compilerOptions": {
      "outDir": "./out-tsc/app",
      "types": []
    },
    "files": [
      "src/main.ts"
    ],
    "include": [
      "src/**/*.d.ts"
    ]
}`;

const tsconfig_json = `{
    "compileOnSave": false,
    "compilerOptions": {
      "baseUrl": "./",
      "outDir": "./dist/out-tsc",
      "sourceMap": true,
      "declaration": false,
      "module": "es2022",
      "moduleResolution": "node",
      "emitDecoratorMetadata": true,
      "experimentalDecorators": true,
      "target": "es2022",
      "typeRoots": [
        "node_modules/@types"
      ],
      "lib": [
        "es2022",
        "dom"
      ],
      "paths": {
      }
    }
}`;

export const getAngularApp = (props: Props = {}) => {
    const { code, selector, css } = props;

    const componentName = getExportedComponentName(code);
    const componentSelector = getComponentSelector(code);

    const main_ts = `import { bootstrapApplication } from '@angular/platform-browser';
import { ${componentName} } from './app/${selector}';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ApplicationConfig } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
  ],
};

bootstrapApplication(${componentName}, appConfig).catch((err) =>console.error(err));`;

    const index_html = `
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>RadixNG ${componentName}</title>
        <base href="/">

        <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body>
        <${componentSelector}></${componentSelector}>
    </body>
</html>`;

    const defaultFiles = {
        'src/main.ts': { content: main_ts },
        'tsconfig.json': { content: tsconfig_json },
        'tsconfig.app.json': { content: tsconfig_app_json },
        'angular.json': { content: angular_json },
        'src/index.html': { content: index_html }
    };

    const files = {
        'package.json': {
            content: {
                name: `radix-ng-${selector}`,
                description: `RadixNG ${componentName}`,
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
