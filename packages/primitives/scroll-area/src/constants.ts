/** How long (ms) the `data-scrolling` attribute stays applied after the last scroll movement. */
export const SCROLL_TIMEOUT = 500;

/** Minimum size (px) of the thumb so it stays grabbable on very large content. */
export const MIN_THUMB_SIZE = 16;

/** 100 ms without scroll events ≈ scroll end (mirrors the native `scrollend` heuristic). */
export const SCROLL_END_TIMEOUT = 100;

/** Distance (px) within which a scroll offset is snapped to an edge. */
export const SCROLL_EDGE_TOLERANCE_PX = 1;
