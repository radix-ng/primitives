import angular from '@analogjs/vite-plugin-angular';
import { playwright } from '@vitest/browser-playwright';
import { writeFileSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const root = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(root, '../..');

// Node-side accumulator: each bench file flushes its rows here; we merge by source file (tests run
// with fileParallelism:false, so no races) and rewrite BENCH_OUTPUT_PATH on every flush.
interface BenchStats {
    median: number;
    mean: number;
    stdDev: number;
    min: number;
    max: number;
    samples: number;
    outliersRemoved: number;
}
interface BenchRow {
    name: string;
    duration: BenchStats;
    renders: number;
    paint: BenchStats | null;
}

const collected = new Map<string, BenchRow[]>();

const ms = (n: number): string => `${n.toFixed(1)}ms`;

/** Print the rows a bench file just produced as a readable table to the real terminal. */
function printRows(file: string, rows: BenchRow[]): void {
    const lines = rows.map((r) => {
        const dur = `${ms(r.duration.median).padStart(8)} ±${r.duration.stdDev.toFixed(1)}`;
        const paint = r.paint ? ms(r.paint.median).padStart(8) : '       —';
        const dropped = r.duration.outliersRemoved ? ` (-${r.duration.outliersRemoved} outlier)` : '';
        return `    ${r.name.padEnd(32)} duration ${dur.padEnd(14)} paint ${paint}  renders ${r.renders}  n=${r.duration.samples}${dropped}`;
    });
    console.log(`\n  📊 ${file}\n${lines.join('\n')}\n`);
}

function writeBenchResults(_ctx: unknown, file: string, results: BenchRow[]): string {
    collected.set(file, results);
    printRows(file, results);
    const merged = [...collected.values()].flat();
    const out = process.env.BENCH_OUTPUT_PATH ?? 'bench-results.json';
    const target = isAbsolute(out) ? out : resolve(workspaceRoot, out);
    writeFileSync(target, `${JSON.stringify(merged, null, 2)}\n`);
    return target;
}

// Performance benchmark runner — see docs/adr/0009.
// Runs in a real Chromium browser via Vitest Browser Mode (Playwright provider) so we get
// real layout/paint. This is intentionally NOT the jsdom/zoneless test-setup used by the
// primitives spec suite — each bench bootstraps a real application via createApplication().
export default defineConfig({
    root,
    cacheDir: '../../node_modules/.vitest/apps/radix-perf-testing',
    resolve: { tsconfigPaths: true },
    plugins: [angular()],
    // Pre-bundle deps that primitives pull in, so the browser runner doesn't reload mid-run when one
    // is first imported (reloads make Vitest warn and can skew the first samples).
    optimizeDeps: {
        include: ['@angular/compiler', '@floating-ui/dom']
    },
    test: {
        include: ['src/tests/**/*.bench.ts'],
        // Load the JIT compiler before any bench module imports a partially-compiled primitive.
        setupFiles: ['./src/harness/setup-compiler.ts'],
        // benchmarks are sequential by nature — one file at a time, no parallelism
        fileParallelism: false,
        browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: 'chromium' }],
            commands: { writeBenchResults }
        }
    }
});
