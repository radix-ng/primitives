export interface RdxCancelableChangeEventDetails<Reason extends string = string> {
    reason: Reason;
    event: Event;
    trigger: HTMLElement | undefined;
    cancel: () => void;
    isCanceled: () => boolean;
    preventUnmountOnClose: () => void;
}

export interface RdxCancelableChangeEventTransaction<Reason extends string = string> {
    eventDetails: RdxCancelableChangeEventDetails<Reason>;
    shouldPreventUnmountOnClose: () => boolean;
}

export function createCancelableChangeEventDetails<Reason extends string>(
    reason: Reason,
    event: Event,
    trigger?: HTMLElement
): RdxCancelableChangeEventTransaction<Reason> {
    let canceled = false;
    let preventUnmountOnClose = false;

    return {
        eventDetails: {
            reason,
            event,
            trigger,
            cancel: () => {
                canceled = true;
            },
            isCanceled: () => canceled,
            preventUnmountOnClose: () => {
                preventUnmountOnClose = true;
            }
        },
        shouldPreventUnmountOnClose: () => preventUnmountOnClose
    };
}
