import { generateManifest } from '../../packages/docs-manifest/src/generator/generate-manifest';

(async (): Promise<void> => {
    const projectNames: string[] = ['primitives'];

    const manifest = await generateManifest({
        outDir: 'dist/docs-manifest',
        projectNames,
        projectsRootDirectory: 'packages/'
    });

    //console.log(manifest);
})();
