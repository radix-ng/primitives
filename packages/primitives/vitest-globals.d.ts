import type { describe, it } from 'vitest';

declare global {
    var xdescribe: typeof describe.skip;
    var xit: typeof it.skip;
}

export {};
