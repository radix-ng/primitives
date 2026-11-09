import type { CaseName } from '../src/contract';
import type { SelectDriver } from './driver';

export interface Scenario {
    name: string;
    fixture: CaseName;
    run(driver: SelectDriver): Promise<void>;
}
