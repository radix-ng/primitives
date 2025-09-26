import { RdxRovingFocusGroupDirective } from './src/roving-focus-group.directive';
import { RdxRovingFocusItemDirective } from './src/roving-focus-item.directive';

export * from './src/roving-focus-group.directive';
export * from './src/roving-focus-item.directive';

export type { Direction, Orientation } from './src/utils';

export const rovingFocusImports = [RdxRovingFocusGroupDirective, RdxRovingFocusItemDirective];
