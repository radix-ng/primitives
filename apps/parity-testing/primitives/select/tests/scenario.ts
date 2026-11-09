import type { CaseName } from '../src/contract';
import type { SelectDriver } from './driver';

export interface Scenario {
    name: string;
    fixture: CaseName;
    input?: 'touch-tap' | 'touch-gesture';
    viewport?: { width: number; height: number };
    run(driver: SelectDriver): Promise<void>;
}
