export const angular_json = `{
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
              "styles": [
                "src/styles.css",
              ],
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
