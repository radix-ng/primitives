import { RdxPopoverRootDirective } from '../../src/popover-root.directive';

const containerRegistry: Map<HTMLElement, RdxPopoverRootDirective> = new Map();

let document: Document | undefined;

const leftMenuSelector = '.container.sidebar-container';
let leftMenuWrapper: HTMLElement | undefined = void 0;

const rightMenuSelector = '.sbdocs-wrapper .toc-wrapper';
let rightMenuWrapper: HTMLElement | undefined = void 0;

let destroyListener: (() => void) | undefined;
const callback: (event: MouseEvent) => void = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (
        event.button !== 0 ||
        target.classList.contains('SkipOutsideClick') ||
        leftMenuWrapper?.contains(target) ||
        rightMenuWrapper?.contains(target)
    ) {
        return;
    }
    // const containers = Array.from(containerRegistry.keys());
    // const containerContainingTarget = containers.find((container) => {
    //     return (
    //         container.contains(target) ||
    //         containerRegistry.get(container)?.popoverCloseDirective()?.elementRef.nativeElement.contains(target)
    //     );
    // });
};

export function registerContainer(container: HTMLElement, popoverRoot: RdxPopoverRootDirective) {
    if (containerRegistry.has(container)) {
        return;
    }
    containerRegistry.set(container, popoverRoot);
    if (containerRegistry.size === 1) {
        addListener();
    }
}

export function deregisterContainer(container: HTMLElement) {
    if (!containerRegistry.has(container)) {
        return;
    }
    containerRegistry.delete(container);
    if (containerRegistry.size === 0) {
        removeListener();
    }
}

export function setDocument(value: Document) {
    if (document) {
        return;
    }
    document = value;
    leftMenuWrapper = document.querySelector<HTMLElement>(leftMenuSelector) ?? void 0;
    rightMenuWrapper = document.querySelector<HTMLElement>(rightMenuSelector) ?? void 0;
}

function addListener() {
    if (!document || destroyListener) {
        return;
    }
    const target = document;
    const eventName = 'click';
    const options: boolean | AddEventListenerOptions | undefined = { capture: true };
    target.addEventListener(eventName, callback, options);
    destroyListener = () => {
        target.removeEventListener(eventName, callback, options);
    };
}

function removeListener() {
    destroyListener?.();
    destroyListener = void 0;
    document = void 0;
    leftMenuWrapper = void 0;
    rightMenuWrapper = void 0;
}
