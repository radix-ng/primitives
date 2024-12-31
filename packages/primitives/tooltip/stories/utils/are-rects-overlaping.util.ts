export function areRectsOverlapping(
    rect1: Pick<DOMRect, 'top' | 'left' | 'bottom' | 'right'>,
    rect2: Pick<DOMRect, 'top' | 'left' | 'bottom' | 'right'>
) {
    // Check if there is no overlap
    const noOverlap =
        rect1.right < rect2.left || // rect1 is completely left of rect2
        rect1.left > rect2.right || // rect1 is completely right of rect2
        rect1.bottom < rect2.top || // rect1 is completely above rect2
        rect1.top > rect2.bottom; // rect1 is completely below rect2
    // If there is no overlap, return false; otherwise, return true
    return !noOverlap;
}
