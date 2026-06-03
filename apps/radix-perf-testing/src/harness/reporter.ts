import { BenchmarkResult } from './benchmark';
import { commands } from 'vitest/browser';

// Custom browser command registered in vite.config.mts. It runs in Node (has fs access) and
// accumulates rows across all bench files in the run, writing BENCH_OUTPUT_PATH each time.
interface BenchCommands {
    writeBenchResults(file: string, results: BenchmarkResult[]): Promise<string>;
}

/**
 * Flush this file's results to the JSON output (BENCH_OUTPUT_PATH, default bench-results.json).
 * Call from each bench file's afterAll. Tagged with the source file so multiple bench files merge
 * cleanly into one report. Tests run with fileParallelism:false, so writes never race.
 */
export async function writeResults(file: string, results: readonly BenchmarkResult[]): Promise<void> {
    await (commands as unknown as BenchCommands).writeBenchResults(file, [...results]);
}
