import { RdxPopoverRootDirective } from '../../src/popover-root.directive';

const containerRegistry: Map<Element, RdxPopoverRootDirective> = new Map();

let document: Document | undefined;

const leftMenuSelector = '.container.sidebar-container';
let leftMenuWrapper: Element | undefined = void 0;

const rightMenuSelector = '.sbdocs-wrapper .toc-wrapper';
let rightMenuWrapper: Element | undefined = void 0;

let destroyListener: (() => void) | undefined;
const callback: (event: MouseEvent) => void = (event: MouseEvent) => {
    if (leftMenuWrapper?.contains(event.target as Element) || rightMenuWrapper?.contains(event.target as Element)) {
        return;
    }
    const anyContainerContainsTarget = Array.from(containerRegistry.keys()).some((container) => {
        return container.contains(event.target as Element);
    });
    if (!anyContainerContainsTarget) {
        event.stopImmediatePropagation();
    }
};

export function registerContainer(container: Element, popoverRoot: RdxPopoverRootDirective) {
    if (containerRegistry.has(container)) {
        return;
    }
    containerRegistry.set(container, popoverRoot);
    if (containerRegistry.size === 1) {
        addListener();
    }
}

export function deregisterContainer(container: Element) {
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
    leftMenuWrapper = document.querySelector(leftMenuSelector) ?? void 0;
    rightMenuWrapper = document.querySelector(rightMenuSelector) ?? void 0;
}

function addListener() {
    if (!document || destroyListener) {
        return;
    }
    const target = document.body;
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
