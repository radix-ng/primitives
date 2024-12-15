import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import * as path from 'node:path';
import { SkyManifestPublicApi } from '../types/manifest';
import { getProjectDefinitions } from './get-project-definitions';
import { getPublicApi } from './public-api';

interface ManifestOptions {
    outDir: string;
    projectNames: string[];
    projectsRootDirectory: string;
}

async function ensureDirectory(directoryPath: string): Promise<void> {
    if (!fs.existsSync(directoryPath)) {
        await fsPromises.mkdir(directoryPath);
    }
}

async function writeManifestFiles(outDir: string, publicApi: SkyManifestPublicApi): Promise<void> {
    const publicApiPath = path.join(outDir, 'public-api.json');

    //await ensureDirectory(outDir);
    await fsPromises.writeFile(publicApiPath, JSON.stringify(publicApi, undefined, 2));

    console.log(`\nCreated ${publicApiPath}.\n`);
}

export async function generateManifest(options: ManifestOptions) {
    const projects = getProjectDefinitions(options.projectsRootDirectory, options.projectNames);

    const publicApi = await getPublicApi(projects);
    const outDir = path.normalize(options.outDir);

    //await writeManifestFiles(outDir, publicApi);

    return { publicApi };
}
