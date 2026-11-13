# Installation and runtime dependencies

Consumer install commands and Nx workspace variants live in the [public installation guide](../../apps/radix-storybook/docs/overview/installation.docs.mdx).

- Runtime packages imported by published primitives must be declared as peers in the [library manifest](../../packages/primitives/package.json) and installed by the [ng-add schematic](../../packages/primitives/schematics/ng-add/index.ts). Read those files for the current package lists and version ranges; the schematic also defines how Angular packages are matched to the consumer's version.
- Keep matching local development dependencies in the [root manifest](../../package.json). When changing runtime dependencies, update both manifests, the schematic and the installation guide together.
- See [owned CDK replacements](cdk-migration.md) for migration rationale and utility equivalents.
