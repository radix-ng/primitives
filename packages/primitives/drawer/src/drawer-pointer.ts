// The pointer-drag lifecycle now lives in core so other gesture primitives (e.g. toast) can share it.
// Re-exported here to keep the drawer's internal imports and public API stable.
export { RdxPointerDragHandlers, usePointerDrag } from '@radix-ng/primitives/core';
