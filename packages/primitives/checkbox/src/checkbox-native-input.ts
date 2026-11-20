import { afterEveryRender, afterRenderEffect, DestroyRef, ElementRef, inject, signal } from '@angular/core';

interface GeneratedCheckboxInputOptions {
    authored: () => HTMLInputElement | null;
    sync: (input: HTMLInputElement) => void;
    onClick: (input: HTMLInputElement, event: MouseEvent) => void;
    onFocus: () => void;
}

/** Own the fallback checkbox after Angular has rendered its host. */
export function useGeneratedCheckboxInput(options: GeneratedCheckboxInputOptions) {
    const host = inject<ElementRef<Node>>(ElementRef).nativeElement;
    const generated = signal<HTMLInputElement | null>(null);
    const placeBesideHost = host.nodeType !== 1 || host.nodeName === 'BUTTON' || host.nodeName === 'LABEL';
    let element: HTMLInputElement | null = null;
    const onClick = (event: MouseEvent) => {
        if (element) options.onClick(element, event);
    };
    const remove = () => {
        if (!element) return;
        element.removeEventListener('click', onClick);
        element.removeEventListener('focus', options.onFocus);
        element.remove();
        element = null;
        generated.set(null);
    };

    const placeInput = () => {
        if (!element) return;
        if (placeBesideHost) {
            const parent = host.parentNode;
            if (!parent) element.remove();
            else if (host.nextSibling !== element) parent.insertBefore(element, host.nextSibling);
        } else if (element.parentNode !== host) {
            host.appendChild(element);
        }
    };

    afterRenderEffect({
        write: () => {
            if (options.authored()) {
                remove();
                return;
            }
            if (!element) {
                const document = host.ownerDocument;
                if (!document) return;
                element = document.createElement('input');
                element.type = 'checkbox';
                element.tabIndex = -1;
                element.setAttribute('aria-hidden', 'true');
                element.setAttribute('data-rdx-native-input', '');
                Object.assign(element.style, {
                    position: 'absolute',
                    opacity: '0',
                    pointerEvents: 'none',
                    margin: '0',
                    width: '1px',
                    height: '1px'
                });
                element.addEventListener('click', onClick);
                element.addEventListener('focus', options.onFocus);
            }
            options.sync(element);
            placeInput();
            generated.set(element);
        }
    });
    // A button that is also the Root can move through Portal without its following sibling.
    if (placeBesideHost) afterEveryRender({ write: placeInput });
    inject(DestroyRef).onDestroy(remove);
    return generated.asReadonly();
}
