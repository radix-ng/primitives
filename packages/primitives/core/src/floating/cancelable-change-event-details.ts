export interface RdxCancelableChangeEventDetails<Reason extends string = string> {
    reason: Reason;
    event: Event;
    trigger: HTMLElement | undefined;
    cancel: () => void;
    isCanceled: () => boolean;
    allowPropagation: () => void;
    readonly isPropagationAllowed: boolean;
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
    let propagationAllowed = false;
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
            allowPropagation: () => {
                propagationAllowed = true;
            },
            get isPropagationAllowed() {
                return propagationAllowed;
            },
            preventUnmountOnClose: () => {
                preventUnmountOnClose = true;
            }
        },
        shouldPreventUnmountOnClose: () => preventUnmountOnClose
    };
}
