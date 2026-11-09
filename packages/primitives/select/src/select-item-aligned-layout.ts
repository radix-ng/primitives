import { clamp } from '@radix-ng/primitives/core';

interface Box {
    left: number;
    right: number;
    top: number;
    bottom: number;
    width: number;
    height: number;
}
export interface ItemAlignedMeasurements {
    trigger: Box;
    positioner: Box;
    value?: Box;
    text?: Box;
    rtl: boolean;
    viewportWidth: number;
    viewportHeight: number;
    marginTop: number;
    marginBottom: number;
    minHeight: number;
    borderBottom: number;
    scrollHeight: number;
}

/** Browser-independent geometry policy from the pinned Base UI Select.Popup. */
export function initialItemAlignedLayout(m: ItemAlignedMeasurements) {
    const availableHeight = m.viewportHeight - m.marginTop - m.marginBottom;
    let left = m.rtl ? m.trigger.right - m.positioner.width : m.trigger.left;
    let offsetY = 0;
    if (m.value && m.text) {
        left = m.positioner.left + (m.rtl ? m.value.right - m.text.right : m.value.left - m.text.left);
        offsetY =
            m.text.top - m.positioner.top + m.text.height / 2 - (m.value.top - m.trigger.top + m.value.height / 2);
    }
    const idealHeight = availableHeight - m.trigger.top + offsetY + m.marginBottom + m.borderBottom;
    const height = Math.min(availableHeight, idealHeight);
    return {
        left: clamp(left, 5, Math.max(5, m.viewportWidth - 5 - m.positioner.width)),
        height,
        scrollTop: idealHeight - height,
        idealHeight,
        availableHeight,
        measurements: m
    };
}

export function finishItemAlignedLayout(initial: ReturnType<typeof initialItemAlignedLayout>, maxScrollTop: number) {
    const { measurements: m, scrollTop, availableHeight, idealHeight } = initial;
    const topPositioned = scrollTop >= maxScrollTop - 1;
    const height = topPositioned
        ? Math.min(availableHeight, m.positioner.height) - (scrollTop - maxScrollTop)
        : initial.height;
    const fallback =
        m.trigger.top < 20 ||
        m.trigger.bottom > availableHeight - 20 ||
        Math.ceil(height) + 1 < Math.min(m.scrollHeight, m.minHeight);
    return {
        height,
        top: topPositioned
            ? m.positioner.height >= availableHeight - m.marginTop - m.marginBottom
                ? 0
                : Math.max(0, availableHeight - idealHeight)
            : undefined,
        bottom: topPositioned ? undefined : 0,
        scrollTop: topPositioned ? Infinity : scrollTop,
        fallback
    };
}

export function expandedItemAlignedLayout(
    height: number,
    maxHeight: number,
    scrollTop: number,
    maxScrollTop: number,
    fromTop: boolean
) {
    const diff = fromTop ? maxScrollTop - scrollTop : scrollTop;
    const nextHeight = Math.min(height + Math.max(0, diff), maxHeight);
    if (diff <= 1)
        return { height: height + clamp(diff, 0, Math.max(0, maxHeight - height)), scrollTop: fromTop ? Infinity : 0 };
    let nextScroll: number | undefined;
    if (maxHeight - nextHeight > 1) nextScroll = fromTop ? Infinity : 0;
    else if (!fromTop && scrollTop < maxScrollTop) nextScroll = scrollTop - (maxHeight - height);
    return { height: Math.ceil(nextHeight), scrollTop: nextScroll };
}
